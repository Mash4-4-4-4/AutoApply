import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, FileText, Loader2, Sparkles, UploadCloud } from "lucide-react";
import { Shell, StepHeader } from "../components/Shell";
import { useAuthMutations, useMe, useProfile } from "../lib/auth";

const MAX = 5 * 1024 * 1024;

export default function ResumeStep() {
  const nav = useNavigate();
  const { data: me } = useMe();
  const { data: existing } = useProfile(!!me?.hasResume);
  const { uploadResume, skipResume } = useAuthMutations();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [localErr, setLocalErr] = useState("");

  const pick = (file?: File) => {
    setLocalErr("");
    if (!file) return;
    if (!/\.(pdf|docx)$/i.test(file.name)) return setLocalErr("Please choose a PDF or DOCX file.");
    if (file.size > MAX) return setLocalErr("File is too large (max 5 MB).");
    uploadResume.mutate(file);
  };

  const uploaded = uploadResume.data?.resume ?? existing?.resume ?? null;
  const err = localErr || (uploadResume.error as Error | null)?.message;

  return (
    <Shell>
      <StepHeader step={3} />
      <div className="flex flex-1 flex-col px-7">
        <h1 className="mt-10 text-3xl font-bold tracking-tight lg:mt-8">Upload your resume</h1>
        <p className="mt-2 text-ink-soft">We'll extract your details and use them to fill applications.</p>

        <button type="button" onClick={() => input.current?.click()} disabled={uploadResume.isPending}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed py-12 transition ${drag ? "border-indigo-400 bg-indigo-100" : "border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50"}`}>
          {uploadResume.isPending ? (
            <><Loader2 className="animate-spin text-indigo-500" /><p className="mt-3 font-medium">Analyzing your resume…</p><p className="text-sm text-ink-soft">This can take a few seconds</p></>
          ) : (
            <><UploadCloud className="text-indigo-500" /><p className="mt-3 font-medium">Tap to upload<span className="hidden lg:inline"> or drag a file here</span></p><p className="text-sm text-ink-soft">PDF or DOCX · up to 5 MB</p></>
          )}
        </button>
        <input ref={input} type="file" hidden accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />

        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        {uploaded && !uploadResume.isPending && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm">
            <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
            <span className="min-w-0 flex-1 truncate font-medium">{uploaded.originalName}</span>
            <span className="text-ink-soft">Uploaded</span>
          </div>
        )}

        <div className="mt-4 space-y-3">
          {[{ icon: Sparkles, t: "Create with AI", s: "Build a professional resume" }, { icon: FileText, t: "Use a template", s: "Choose a clean template" }].map(({ icon: Icon, t, s }) => (
            <div key={t} className="flex items-center gap-4 rounded-2xl bg-white/70 px-4 py-3 opacity-60">
              <Icon className="text-rose-400" size={22} />
              <div className="flex-1"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-ink-soft">{s}</p></div>
              <span className="rounded-full bg-cream-200 px-2 py-0.5 text-[10px] font-semibold uppercase">Soon</span>
            </div>
          ))}
        </div>

        <div className="pb-6 pt-8 lg:pb-0">
          <button className="btn-primary" disabled={!uploaded || uploadResume.isPending} onClick={() => nav("/onboarding/review")}>Next <ArrowRight size={18} /></button>
          <button className="mt-3 w-full text-sm text-ink-soft underline-offset-2 hover:underline" disabled={skipResume.isPending}
            onClick={() => skipResume.mutate(undefined, { onSuccess: () => nav("/home") })}>Skip for now</button>
          <p className="mt-4 text-center text-sm text-ink-soft">Step 3 of 4</p>
        </div>
      </div>
    </Shell>
  );
}
