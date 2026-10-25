export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const isForm = options.body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    credentials: "include",
    headers: options.body && !isForm ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? (isForm ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong");
  return data as T;
}

export type User = { id: string; name: string; email: string; roles: string[]; onboardingStep: number; hasResume: boolean };
export type Education = { degree: string; institution: string; period: string };
export type Profile = {
  personal: { name: string; email: string; phone: string; location: string };
  summary: string;
  skills: string[];
  education: Education[];
};
export type ResumeMeta = { originalName: string; size: number; uploadedAt: string } | null;
export type ProfileResponse = { profile: Profile; resume: ResumeMeta; engine?: string; warnings?: string[] };
export const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Data Analyst", "UI/UX Designer", "Other"];
