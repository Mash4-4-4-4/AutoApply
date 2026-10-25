import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AppShell } from "../components/Shell";
import { api } from "../lib/api";
import { useAuthMutations, useMe } from "../lib/auth";

type Dash = { name: string; dailyGoal: { done: number; total: number }; stats: { applied: number; inProgress: number; shortlisted: number; needsAttention: number } };

function weekDays() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return { label: d.toLocaleDateString("en", { weekday: "short" }), date: d.getDate(), today: d.toDateString() === today.toDateString() };
  });
}

export default function Dashboard() {
  const { data: me } = useMe();
  const { logout } = useAuthMutations();
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Dash>("/profile/dashboard") });
  const goal = data?.dailyGoal ?? { done: 0, total: 4 };
  const s = data?.stats ?? { applied: 0, inProgress: 0, shortlisted: 0, needsAttention: 0 };
  const tiles = [
    { n: s.applied, l: "Applied", c: "bg-amber-brand/20" }, { n: s.inProgress, l: "In Progress", c: "bg-sky-100" },
    { n: s.shortlisted, l: "Shortlisted", c: "bg-emerald-100" }, { n: s.needsAttention, l: "Needs Attention", c: "bg-rose-100" },
  ];
  return (
    <AppShell onLogout={() => logout.mutate()}>
      <div className="mx-auto max-w-5xl px-5 pt-8 sm:px-8 lg:pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold lg:text-3xl">Hi, {me?.name}</h1>
          <button title="Log out" onClick={() => logout.mutate()} className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-brand font-bold lg:hidden">{me?.name?.[0]?.toUpperCase()}</button>
        </div>

        <div className="mt-6 flex justify-between gap-1 lg:max-w-xl">
          {weekDays().map((d) => (
            <div key={d.label + d.date} className="flex flex-col items-center gap-2 text-xs text-ink-soft">
              {d.label}
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${d.today ? "bg-amber-brand text-ink" : "bg-white text-ink"}`}>{d.date}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-sm font-medium"><span>Your Progress</span><span className="text-ink-soft">{goal.done}/{goal.total}</span></div>
        <div className="mt-2 h-2 rounded-full bg-cream-300"><div className="h-2 rounded-full bg-amber-brand" style={{ width: `${(goal.done / goal.total) * 100}%` }} /></div>

        <div className="mt-5 grid gap-5 lg:grid-cols-5">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-brand to-amber-deep/80 p-5 pb-24 shadow-card lg:col-span-3 lg:min-h-64 lg:p-8">
            <h2 className="text-xl font-bold lg:text-2xl">Let's start applying</h2>
            <p className="mt-1 max-w-[240px] text-sm lg:max-w-sm lg:text-base">We'll find and apply to the best internships for you.</p>
            <div className="absolute inset-x-0 bottom-0 h-16 rounded-t-[100%] bg-emerald-600/60" />
            <button aria-label="Start" disabled title="Available in a later phase" className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white opacity-90"><ArrowRight size={20} /></button>
          </div>
          <div className="grid grid-cols-4 gap-2 lg:col-span-2 lg:grid-cols-2 lg:gap-3">
            {tiles.map((t) => (
              <div key={t.l} className={`rounded-2xl ${t.c} p-3 lg:p-5`}>
                <div className="text-2xl font-bold lg:text-4xl">{t.n}</div>
                <div className="mt-1 text-[11px] leading-tight text-ink-soft lg:text-sm">{t.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
