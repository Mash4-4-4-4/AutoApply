import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, Profile, ProfileResponse, User } from "./api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try { return (await api<{ user: User }>("/auth/me")).user; }
      catch (e) { if (e instanceof ApiError && e.status === 401) return null; throw e; }
    },
  });
}

export function useProfile(enabled = true) {
  return useQuery({ queryKey: ["profile"], enabled, queryFn: () => api<ProfileResponse>("/profile/details") });
}

export function useAuthMutations() {
  const qc = useQueryClient();
  const setUser = (r: { user: User }) => qc.setQueryData(["me"], r.user);
  return {
    register: useMutation({ mutationFn: (b: { name: string; email: string; password: string }) => api<{ user: User }>("/auth/register", { body: b }), onSuccess: setUser }),
    login: useMutation({ mutationFn: (b: { email: string; password: string }) => api<{ user: User }>("/auth/login", { body: b }), onSuccess: setUser }),
    saveRoles: useMutation({ mutationFn: (roles: string[]) => api<{ user: User }>("/profile/roles", { method: "PUT", body: { roles } }), onSuccess: setUser }),
    skipResume: useMutation({ mutationFn: () => api<{ user: User }>("/profile/onboarding/skip-resume", { method: "POST", body: {} }), onSuccess: setUser }),
    uploadResume: useMutation({
      mutationFn: (file: File) => { const f = new FormData(); f.append("file", file); return api<{ user: User } & ProfileResponse>("/resume", { body: f }); },
      onSuccess: (r) => { setUser(r); qc.setQueryData(["profile"], { profile: r.profile, resume: r.resume, engine: r.engine, warnings: r.warnings }); },
    }),
    saveDetails: useMutation({
      mutationFn: (p: Pick<Profile, "personal" | "skills" | "education">) => api<{ user: User }>("/profile/details", { method: "PUT", body: p }),
      onSuccess: (r) => { setUser(r); qc.invalidateQueries({ queryKey: ["profile"] }); },
    }),
    logout: useMutation({ mutationFn: () => api("/auth/logout", { method: "POST", body: {} }), onSuccess: () => qc.clear() }),
  };
}
