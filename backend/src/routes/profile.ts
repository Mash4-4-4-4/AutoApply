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
