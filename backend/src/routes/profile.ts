import { Router } from "express";
import { z } from "zod";
import { ROLES, publicUser } from "../models/User";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const rolesSchema = z.object({ roles: z.array(z.enum(ROLES)).min(1, "Select at least one role") });

router.put("/roles", async (req, res) => {
  const parsed = rolesSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const user = res.locals.user;
  user.roles = [...new Set(parsed.data.roles)];
  if (user.onboardingStep < 3) user.onboardingStep = 3;
  await user.save();
  res.json({ user: publicUser(user) });
});

// Phase 1 stand-in: resume upload arrives in Phase 2. Lets the user reach the dashboard.
router.post("/onboarding/skip-resume", async (_req, res) => {
  const user = res.locals.user;
  if (user.onboardingStep < 5) user.onboardingStep = 5;
  await user.save();
  res.json({ user: publicUser(user) });
});

const detailsSchema = z.object({
  personal: z.object({
    name: z.string().trim().min(1, "Name is required").max(80),
    email: z.string().trim().email("Enter a valid email"),
    phone: z.string().trim().max(24).default(""),
    location: z.string().trim().max(80).default(""),
  }),
  skills: z.array(z.string().trim().min(1).max(40)).max(60),
  education: z.array(z.object({
    degree: z.string().trim().max(120), institution: z.string().trim().max(120), period: z.string().trim().max(40),
  })).max(10),
});

router.get("/details", (_req, res) => {
  const u = res.locals.user;
  res.json({ profile: u.profile, resume: u.resume ?? null });
});

// Saves the user-verified details (the review screen). Experience/projects are kept as extracted.
router.put("/details", async (req, res) => {
  const parsed = detailsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const user = res.locals.user;
  user.profile.personal = parsed.data.personal;
  user.profile.skills = [...new Set(parsed.data.skills)];
  user.profile.education = parsed.data.education.filter((e) => e.degree || e.institution);
  if (user.onboardingStep < 5) user.onboardingStep = 5;
  await user.save();
  res.json({ user: publicUser(user), profile: user.profile });
});

router.get("/dashboard", (_req, res) => {
  const user = res.locals.user;
  // Real numbers arrive with applications (Phase 5).
  res.json({
    name: user.name,
    dailyGoal: { done: 0, total: 4 },
    stats: { applied: 0, inProgress: 0, shortlisted: 0, needsAttention: 0 },
  });
});

export default router;
