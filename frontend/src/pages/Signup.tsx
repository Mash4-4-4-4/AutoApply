import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Shell, StepHeader } from "../components/Shell";
import { useAuthMutations } from "../lib/auth";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});
type Form = z.infer<typeof schema>;

const QUESTIONS = [
  { field: "name", title: "Let's get to know you", prompt: "First, what's your name?", placeholder: "Your name", type: "text", auto: "name", bubble: "Nice to\nmeet you!" },
  { field: "email", title: "Where can we reach you?", prompt: "Your email address", placeholder: "you@example.com", type: "email", auto: "email", bubble: "Good one!" },
  { field: "password", title: "Keep it secure", prompt: "Create a password", placeholder: "At least 8 characters", type: "password", auto: "new-password", bubble: "Almost\nthere!" },
] as const;

export default function Signup() {
  const [i, setI] = useState(0);
  const nav = useNavigate();
  const { register: signup } = useAuthMutations();
  const { register, trigger, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), mode: "onTouched" });
  const q = QUESTIONS[i];

  const next = async () => {
    if (!(await trigger(q.field))) return;
    if (i < QUESTIONS.length - 1) setI(i + 1);
    else handleSubmit((v) => signup.mutate(v, { onSuccess: () => nav("/onboarding/roles") }))();
  };

  const err = errors[q.field]?.message ?? (signup.error as Error | null)?.message;

  return (
    <Shell>
      <StepHeader step={1} />
      <form className="flex flex-1 flex-col px-7" onSubmit={(e) => { e.preventDefault(); next(); }}>
        <h1 className="mt-12 text-3xl lg:mt-10 font-bold tracking-tight">{q.title}</h1>
        <p className="mt-2 text-ink-soft">{q.prompt}</p>
        <input key={q.field} autoFocus className="input mt-6" type={q.type} placeholder={q.placeholder} autoComplete={q.auto} {...register(q.field)} />
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}

        <div className="relative mb-6 mt-auto flex flex-col items-center pt-10 lg:mt-8">
          <div className="absolute right-12 top-2 whitespace-pre-line rounded-3xl bg-amber-brand/40 px-5 py-3 text-center text-sm font-medium italic">{q.bubble}</div>
          <div className="h-40 w-40 rounded-full bg-amber-brand/30" />
          <button type="submit" disabled={signup.isPending} aria-label="Continue" className="absolute bottom-0 flex h-16 w-16 items-center justify-center rounded-full bg-amber-brand shadow-card active:scale-95 disabled:opacity-50">
            <ArrowRight />
          </button>
        </div>
        <p className="pb-6 text-center text-sm text-ink-soft">Step 1 of 4</p>
      </form>
    </Shell>
  );
}
