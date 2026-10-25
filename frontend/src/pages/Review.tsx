import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Sparkles, X } from "lucide-react";
import { Shell, StepHeader } from "../components/Shell";
import { Profile } from "../lib/api";
import { useAuthMutations, useProfile } from "../lib/auth";

type Draft = Pick<Profile, "personal" | "skills" | "education">;
type Key = "personal" | "skills" | "education";

function Card({ title, editing, onToggle, children }: { title: string; editing: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white/80 p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        <button onClick={onToggle} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">{editing ? "Done" : "Edit"}</button>
      </div>
      {children}
    </section>
  );
}

const FIELDS = [["name", "Name"], ["email", "Email"], ["phone", "Phone"], ["location", "Location"]] as const;

export default function Review() {
  const nav = useNavigate();
  const { data, isLoading } = useProfile();
  const { saveDetails } = useAuthMutations();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editing, setEditing] = useState<Record<Key, boolean>>({ personal: false, skills: false, education: false });
  const [showAll, setShowAll] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (data && !draft) setDraft({ personal: data.profile.personal, skills: data.profile.skills, education: data.profile.education });
  }, [data, draft]);

  if (isLoading || !draft) return <Shell wide><div className="p-10 text-center text-ink-soft">Loading…</div></Shell>;

  const toggle = (k: Key) => setEditing((e) => ({ ...e, [k]: !e[k] }));
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !draft.skills.includes(s)) setDraft({ ...draft, skills: [...draft.skills, s] });
    setNewSkill("");
  };
  const visibleSkills = showAll || editing.skills ? draft.skills : draft.skills.slice(0, 7);
  const setEdu = (i: number, k: "degree" | "institution" | "period", v: string) =>
    setDraft({ ...draft, education: draft.education.map((e, j) => (j === i ? { ...e, [k]: v } : e)) });

  return (
    <Shell wide>
      <StepHeader step={4} />
      <div className="flex flex-1 flex-col px-7">
        <h1 className="mt-8 flex items-center gap-2 text-3xl font-bold tracking-tight">We've extracted your details <Sparkles className="text-amber-deep" size={26} /></h1>
        <p className="mt-2 text-ink-soft">Review and edit if needed.</p>
        {data?.engine === "heuristic" && <p className="mt-3 rounded-xl bg-amber-brand/20 px-4 py-2 text-sm">Extracted with basic parsing — please double-check each section.</p>}
        {data?.warnings?.map((w) => <p key={w} className="mt-3 rounded-xl bg-amber-brand/20 px-4 py-2 text-sm">{w}</p>)}

        <div className="mt-5 space-y-4">
          <Card title="Personal Info" editing={editing.personal} onToggle={() => toggle("personal")}>
            <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {FIELDS.map(([k, label]) => (
                <label key={k} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-ink-soft">{label}</span>
                  {editing.personal ? (
                    <input className="min-w-0 flex-1 rounded-lg border border-cream-300 bg-white px-2 py-1.5" value={draft.personal[k]}
                      onChange={(e) => setDraft({ ...draft, personal: { ...draft.personal, [k]: e.target.value } })} />
                  ) : (
                    <span className="min-w-0 flex-1 break-words font-medium">{draft.personal[k] || <span className="text-ink-faint">—</span>}</span>
                  )}
                </label>
              ))}
            </div>
          </Card>

          <Card title="Skills" editing={editing.skills} onToggle={() => toggle("skills")}>
            <div className="flex flex-wrap gap-2">
              {visibleSkills.map((s) => (
                <span key={s} className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  {s}
                  {editing.skills && <button aria-label={`Remove ${s}`} onClick={() => setDraft({ ...draft, skills: draft.skills.filter((x) => x !== s) })}><X size={12} /></button>}
                </span>
              ))}
              {!editing.skills && !showAll && draft.skills.length > 7 && (
                <button onClick={() => setShowAll(true)} className="px-2 py-1 text-xs text-ink-soft">+{draft.skills.length - 7} more</button>
              )}
              {!draft.skills.length && <span className="text-sm text-ink-faint">No skills found — tap Edit to add some.</span>}
            </div>
            {editing.skills && (
              <div className="mt-3 flex gap-2">
                <input className="min-w-0 flex-1 rounded-lg border border-cream-300 bg-white px-3 py-2 text-sm" placeholder="Add a skill" value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} maxLength={40} />
                <button onClick={addSkill} className="rounded-lg bg-amber-brand px-3" aria-label="Add skill"><Plus size={18} /></button>
              </div>
            )}
          </Card>

          <Card title="Education" editing={editing.education} onToggle={() => toggle("education")}>
            <div className="space-y-3 text-sm">
              {draft.education.map((e, i) => editing.education ? (
                <div key={i} className="grid gap-2 sm:grid-cols-[1.2fr_1.2fr_0.8fr_auto]">
                  {(["degree", "institution", "period"] as const).map((k) => (
                    <input key={k} placeholder={k[0].toUpperCase() + k.slice(1)} className="min-w-0 rounded-lg border border-cream-300 bg-white px-2 py-1.5" value={e[k]} onChange={(ev) => setEdu(i, k, ev.target.value)} />
                  ))}
                  <button aria-label="Remove education" onClick={() => setDraft({ ...draft, education: draft.education.filter((_, j) => j !== i) })} className="text-ink-soft"><X size={16} /></button>
                </div>
              ) : (
                <div key={i}><p className="font-medium">{e.degree}</p><p className="text-xs text-ink-soft">{[e.institution, e.period].filter(Boolean).join(" · ")}</p></div>
              ))}
              {!draft.education.length && !editing.education && <span className="text-ink-faint">No education found — tap Edit to add.</span>}
              {editing.education && (
                <button onClick={() => setDraft({ ...draft, education: [...draft.education, { degree: "", institution: "", period: "" }] })} className="flex items-center gap-1 text-xs font-semibold text-indigo-600"><Plus size={14} />Add education</button>
              )}
            </div>
          </Card>
        </div>

        <div className="pb-6 pt-8 lg:pb-0">
          {saveDetails.error && <p className="mb-2 text-sm text-red-600">{(saveDetails.error as Error).message}</p>}
          <button className="btn-primary" disabled={saveDetails.isPending}
            onClick={() => saveDetails.mutate(draft, { onSuccess: () => nav("/home") })}>Looks Good <ArrowRight size={18} /></button>
        </div>
      </div>
    </Shell>
  );
}
