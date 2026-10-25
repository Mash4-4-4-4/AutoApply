import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { requireAuth } from "../middleware/auth";
import { publicUser } from "../models/User";
import { AiError, analyzeResume } from "../services/ai";
import { deleteFile, resolveKey, saveFile } from "../services/storage";

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const single = (req: Request, res: Response, next: NextFunction) =>
  upload.single("file")(req, res, (err: any) => {
    if (err) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 5 MB)" : "Upload failed" });
    next();
  });

function detect(buf: Buffer, name: string): { ext: ".pdf" | ".docx"; mime: string } | null {
  if (buf.subarray(0, 4).toString() === "%PDF") return { ext: ".pdf", mime: "application/pdf" };
  if (buf[0] === 0x50 && buf[1] === 0x4b && path.extname(name).toLowerCase() === ".docx")
    return { ext: ".docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  return null;
}

router.post("/", single, async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "Choose a PDF or DOCX file" });
  const kind = detect(file.buffer, file.originalname);
  if (!kind) return res.status(400).json({ error: "Upload a PDF or DOCX resume" });

  let analysis;
  try {
    analysis = await analyzeResume(file.buffer, file.originalname, kind.mime);
  } catch (e) {
    if (e instanceof AiError) return res.status(e.status).json({ error: e.message });
    throw e;
  }

  const user = res.locals.user;
  const oldKey = user.resume?.storageKey;
  const storageKey = await saveFile(String(user._id), kind.ext, file.buffer);
  const p = analysis.personal;
  user.profile = {
    personal: { name: p.name || user.name, email: p.email || user.email, phone: p.phone, location: p.location },
    summary: analysis.summary,
    skills: analysis.skills,
    education: analysis.education,
    experience: analysis.experience,
    projects: analysis.projects,
  };
  user.resume = { originalName: path.basename(file.originalname).slice(0, 120), storageKey, mimeType: kind.mime, size: file.size, uploadedAt: new Date() };
  if (user.onboardingStep < 4) user.onboardingStep = 4;
  await user.save();
  if (oldKey) await deleteFile(oldKey).catch(() => {});

  res.status(201).json({
    user: publicUser(user),
    profile: user.profile,
    resume: user.resume,
    engine: analysis.engine,
    warnings: analysis.warnings,
  });
});

// Resumes are private: only the owner can download, never a public URL.
router.get("/file", async (_req, res) => {
  const r = res.locals.user.resume;
  if (!r?.storageKey) return res.status(404).json({ error: "No resume uploaded" });
  const full = resolveKey(r.storageKey);
  await fs.access(full).catch(() => null);
  res.download(full, r.originalName ?? "resume");
});

export default router;
