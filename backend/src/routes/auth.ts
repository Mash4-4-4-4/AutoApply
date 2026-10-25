import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User, publicUser } from "../models/User";
import { COOKIE, requireAuth, setSessionCookie } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(128),
});
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { name, email, password } = parsed.data;

  if (await User.exists({ email: email.toLowerCase() })) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  setSessionCookie(res, String(user._id));
  res.status(201).json({ user: publicUser(user) });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Enter your email and password" });
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  const ok = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
  if (!user || !ok) return res.status(401).json({ error: "Incorrect email or password" });
  setSessionCookie(res, String(user._id));
  res.json({ user: publicUser(user) });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

router.get("/me", requireAuth, (_req, res) => {
  res.json({ user: publicUser(res.locals.user) });
});

export default router;
