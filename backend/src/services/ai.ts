import { z } from "zod";
import { config } from "../config";

const s = z.string().default("");
export const analysisSchema = z.object({
  personal: z.object({ name: s, email: s, phone: s, location: s }).default({}),
  summary: s,
  skills: z.array(z.string()).default([]),
  education: z.array(z.object({ degree: s, institution: s, period: s })).default([]),
  experience: z.array(z.object({ title: s, company: s, period: s, summary: s })).default([]),
  projects: z.array(z.object({ name: s, summary: s, tech: z.array(z.string()).default([]) })).default([]),
  engine: z.string().default("heuristic"),
  warnings: z.array(z.string()).default([]),
});
export type Analysis = z.infer<typeof analysisSchema>;

export class AiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function analyzeResume(data: Buffer, filename: string, mime: string): Promise<Analysis> {
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(data)], { type: mime }), filename);
  let res: Response;
  try {
    res = await fetch(`${config.aiServiceUrl}/ai/resume/analyze`, {
      method: "POST",
      body: form,
      headers: config.aiServiceToken ? { "X-Internal-Token": config.aiServiceToken } : undefined,
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    throw new AiError(502, "Resume analysis service is not reachable. Please try again shortly.");
  }
  if (res.status === 422 || res.status === 413) {
    const body = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new AiError(422, body.detail ?? "We couldn't read this resume.");
  }
  if (!res.ok) throw new AiError(502, "Resume analysis failed. Please try again.");
  return analysisSchema.parse(await res.json());
}
