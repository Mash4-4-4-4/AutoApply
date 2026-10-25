import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

/** Phone-width column, centered on desktop, full-bleed on mobile. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen justify-center">
      <div className="relative flex min-h-screen w-full max-w-[430px] flex-col bg-cream-100 sm:my-4 sm:min-h-[calc(100vh-2rem)] sm:rounded-4xl sm:shadow-card">
        {children}
      </div>
    </div>
  );
}

export function StepHeader({ step, total = 4, back = true }: { step: number; total?: number; back?: boolean }) {
  const nav = useNavigate();
  return (
    <div className="flex items-center px-6 pt-6">
      {back ? (
        <button onClick={() => nav(-1)} aria-label="Back" className="rounded-full p-1"><ArrowLeft size={22} /></button>
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
