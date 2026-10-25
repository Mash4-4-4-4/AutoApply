import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Shell } from "../components/Shell";
import { useAuthMutations } from "../lib/auth";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuthMutations();
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  return (
    <Shell>
      <form className="flex flex-1 flex-col px-7 pt-20 lg:pt-0" onSubmit={handleSubmit((v) => login.mutate(v, { onSuccess: () => nav("/home") }))}>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-ink-soft">Log in to continue applying.</p>
        <input className="input mt-8" type="email" placeholder="Email" autoComplete="email" {...register("email", { required: true })} />
        <input className="input mt-3" type="password" placeholder="Password" autoComplete="current-password" {...register("password", { required: true })} />
        {login.error && <p className="mt-2 text-sm text-red-600">{(login.error as Error).message}</p>}
        <button className="btn-primary mt-6" disabled={login.isPending}>Log in</button>
        <p className="mt-5 text-center text-sm text-ink-soft">New here? <Link to="/signup" className="font-semibold text-ink">Create an account</Link></p>
      </form>
    </Shell>
  );
}
