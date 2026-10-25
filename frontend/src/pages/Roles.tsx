import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Shell, StepHeader } from "../components/Shell";
import { useAuthMutations, useMe } from "../lib/auth";
import { ROLES } from "../lib/api";

export default function Roles() {
  const { data: me } = useMe();
  const nav = useNavigate();
  const { saveRoles } = useAuthMutations();
  const [picked, setPicked] = useState<string[]>(me?.roles ?? []);
  const toggle = (r: string) => setPicked((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  return (
    <Shell>
      <StepHeader step={2} />
      <div className="flex flex-1 flex-col px-7">
        <h1 className="mt-10 text-3xl lg:mt-8 font-bold tracking-tight">What are you looking for?</h1>
        <p className="mt-2 text-ink-soft">Select one or more roles.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ROLES.map((r) => {
            const on = picked.includes(r);
            return (
              <button key={r} onClick={() => toggle(r)} aria-pressed={on}
                className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left font-medium transition ${on ? "bg-amber-brand" : "bg-cream-200/80"}`}>
                {r}
                {on && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"><Check size={14} /></span>}
              </button>
            );
          })}
        </div>
        <div className="mt-auto pb-6 pt-8">
          {saveRoles.error && <p className="mb-2 text-sm text-red-600">{(saveRoles.error as Error).message}</p>}
          <button className="btn-primary" disabled={!picked.length || saveRoles.isPending}
            onClick={() => saveRoles.mutate(picked, { onSuccess: () => nav("/onboarding/resume") })}>
            Next <ArrowRight size={18} />
          </button>
          <p className="mt-4 text-center text-sm text-ink-soft">Step 2 of 4</p>
        </div>
      </div>
    </Shell>
  );
}
