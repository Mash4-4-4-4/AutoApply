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
const str = { type: String, default: "" };
const profileSchema = new Schema(
  {
    personal: { name: str, email: str, phone: str, location: str },
    summary: str,
    skills: { type: [String], default: [] },
    education: { type: [new Schema({ degree: str, institution: str, period: str }, { _id: false })], default: [] },
    experience: { type: [new Schema({ title: str, company: str, period: str, summary: str }, { _id: false })], default: [] },
    projects: { type: [new Schema({ name: str, summary: str, tech: { type: [String], default: [] } }, { _id: false })], default: [] },
  },
  { _id: false }
);
const resumeSchema = new Schema(
  { originalName: String, storageKey: String, mimeType: String, size: Number, uploadedAt: Date },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: [] },
    onboardingStep: { type: Number, default: 2 },
    profile: { type: profileSchema, default: () => ({}) },
    resume: { type: resumeSchema, default: undefined },
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
  hasResume: !!u.resume?.storageKey,
});
