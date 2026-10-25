import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Send } from "lucide-react";
import { Shell } from "../components/Shell";

export default function Welcome() {
  const nav = useNavigate();
  return (
    <Shell>
      <div className="relative flex flex-1 flex-col justify-end overflow-hidden px-7 pb-8">
        <div className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-amber-brand/25 to-transparent" />
        <Send className="absolute right-14 top-24 -rotate-12 text-amber-deep" size={64} strokeWidth={1.5} />
        <div className="absolute left-1/2 top-40 h-44 w-44 -translate-x-1/2 rounded-full bg-amber-brand/40 blur-sm" />
        <div className="relative mb-10">
          <h1 className="text-4xl font-bold tracking-tight">ApplyPilot AI</h1>
          <p className="mt-3 text-xl leading-snug text-ink-soft">Your next internship.<br />Less repetitive work.</p>
        </div>
        <button className="btn-dark" onClick={() => nav("/signup")}>Get Started <ArrowRight size={18} /></button>
        <p className="mt-5 text-center text-sm text-ink-soft">
          Already have an account? <Link to="/login" className="font-semibold text-ink">Log in</Link>
        </p>
      </div>
    </Shell>
  );
}
