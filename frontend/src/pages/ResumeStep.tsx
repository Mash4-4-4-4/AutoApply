import { useNavigate } from "react-router-dom";
import { ArrowRight, UploadCloud } from "lucide-react";
import { Shell, StepHeader } from "../components/Shell";
import { useAuthMutations } from "../lib/auth";

/** Placeholder: real upload + AI analysis ships in Phase 2. */
export default function ResumeStep() {
  const nav = useNavigate();
  const { skipResume } = useAuthMutations();
  return (
    <Shell>
      <StepHeader step={3} />
      <div className="flex flex-1 flex-col px-7">
        <h1 className="mt-10 text-3xl font-bold tracking-tight">Upload your resume</h1>
        <p className="mt-2 text-ink-soft">We'll extract your details and use them to fill applications.</p>
        <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-indigo-200 bg-indigo-50/60 py-12 opacity-60">
          <UploadCloud className="text-indigo-500" />
          <p className="mt-3 font-medium">Tap to upload</p>
          <p className="text-sm text-ink-soft">PDF or DOCX</p>
        </div>
        <p className="mt-4 rounded-2xl bg-amber-brand/20 px-4 py-3 text-sm">Resume upload and AI analysis arrive in Phase 2. Skip for now to explore the app.</p>
        <div className="mt-auto pb-6 pt-8">
          <button className="btn-primary" disabled={skipResume.isPending} onClick={() => skipResume.mutate(undefined, { onSuccess: () => nav("/home") })}>
            Skip for now <ArrowRight size={18} />
          </button>
          <p className="mt-4 text-center text-sm text-ink-soft">Step 3 of 4</p>
        </div>
      </div>
    </Shell>
  );
}
