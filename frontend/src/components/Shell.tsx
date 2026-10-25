import { ArrowLeft, Check, ClipboardList, Compass, Home, LogOut, Plus, Send, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-bold ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-amber-brand"><Send size={18} /></span>
      ApplyPilot AI
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="relative hidden h-screen flex-col justify-between overflow-hidden bg-gradient-to-br from-amber-brand to-amber-deep p-12 lg:sticky lg:top-0 lg:flex">
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20" />
      <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/15" />
      <Logo className="relative text-xl" />
      <div className="relative">
        <h2 className="text-5xl font-bold leading-tight tracking-tight">Your next internship.<br />Less repetitive work.</h2>
        <ul className="mt-8 space-y-3 text-lg">
          {["Build your profile once", "AI fills every application for you", "Set it going, close the tab, come back to results"].map((t) => (
            <li key={t} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white"><Check size={14} /></span>{t}</li>
          ))}
        </ul>
      </div>
      <p className="relative text-sm text-ink/70">Less typing. More interviews.</p>
    </aside>
  );
}

/** Auth/onboarding layout: full-bleed on phones, split brand panel + form on desktop. */
export function Shell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-cream-100 lg:grid lg:grid-cols-[5fr_6fr]">
      <BrandPanel />
      <main className="flex min-h-screen flex-col lg:min-h-0 lg:py-10">
        <div className={`mx-auto flex w-full flex-1 flex-col md:max-w-lg ${wide ? "lg:max-w-2xl" : "lg:max-w-md"} lg:my-auto lg:flex-none`}>
          {children}
        </div>
      </main>
    </div>
  );
}

export function StepHeader({ step, total = 4, back = true }: { step: number; total?: number; back?: boolean }) {
  const nav = useNavigate();
  return (
    <div className="flex items-center px-6 pt-6 lg:px-7 lg:pt-0">
      {back ? (
        <button onClick={() => nav(-1)} aria-label="Back" className="rounded-full p-1 hover:bg-cream-200"><ArrowLeft size={22} /></button>
      ) : <span className="w-8" />}
      <div className="mx-auto flex gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`h-1 w-8 rounded-full ${i < step ? "bg-ink" : "bg-cream-300"}`} />
        ))}
      </div>
      <span className="w-8" />
    </div>
  );
}

const NAV = [
  { label: "Home", icon: Home, active: true },
  { label: "Explore", icon: Compass },
  { label: "Applications", icon: ClipboardList },
  { label: "Profile", icon: User },
];

/** App layout: sidebar on desktop, bottom tab bar on phones. */
export function AppShell({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-cream-100 lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-cream-300 bg-white/50 p-6 lg:flex">
        <Logo />
        <nav className="mt-10 space-y-1">
          {NAV.map(({ label, icon: Icon, active }) => (
            <div key={label} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium ${active ? "bg-amber-brand" : "text-ink-faint"}`}>
              <Icon size={20} />{label}{!active && <span className="ml-auto text-[10px] uppercase tracking-wide">Soon</span>}
            </div>
          ))}
        </nav>
        <button onClick={onLogout} className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-soft hover:bg-cream-200"><LogOut size={18} />Log out</button>
      </aside>

      <div className="min-w-0 flex-1 pb-28 lg:pb-10">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-around border-t border-cream-300 bg-white/95 px-4 pb-5 pt-3 backdrop-blur lg:hidden">
        <TabItem {...NAV[0]} />
        <TabItem {...NAV[1]} />
        <button disabled aria-label="Add" className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-amber-brand shadow-card"><Plus /></button>
        <TabItem {...NAV[2]} />
        <TabItem {...NAV[3]} />
      </nav>
    </div>
  );
}

function TabItem({ label, icon: Icon, active }: (typeof NAV)[number]) {
  return <div className={`flex flex-col items-center gap-1 text-[11px] ${active ? "font-semibold text-ink" : "text-ink-faint"}`}><Icon size={22} />{label}</div>;
}
