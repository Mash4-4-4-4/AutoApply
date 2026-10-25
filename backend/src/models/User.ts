import { Schema, model, InferSchemaType } from "mongoose";

export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "UI/UX Designer",
  "Other",
] as const;

/**
 * onboardingStep = the NEXT step the user must complete
 * 2 = role preferences, 3 = resume upload, 4 = review extracted details, 5 = done
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: [] },
    onboardingStep: { type: Number, default: 2 },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: any };
export const User = model("User", userSchema);

export const publicUser = (u: UserDoc) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  roles: u.roles,
  onboardingStep: u.onboardingStep,
});
