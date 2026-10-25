import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError, User } from "./api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try { return (await api<{ user: User }>("/auth/me")).user; }
      catch (e) { if (e instanceof ApiError && e.status === 401) return null; throw e; }
    },
  });
}

export function useAuthMutations() {
  const qc = useQueryClient();
  const setUser = (r: { user: User }) => qc.setQueryData(["me"], r.user);
  return {
    register: useMutation({ mutationFn: (b: { name: string; email: string; password: string }) => api<{ user: User }>("/auth/register", { body: b }), onSuccess: setUser }),
    login: useMutation({ mutationFn: (b: { email: string; password: string }) => api<{ user: User }>("/auth/login", { body: b }), onSuccess: setUser }),
    saveRoles: useMutation({ mutationFn: (roles: string[]) => api<{ user: User }>("/profile/roles", { method: "PUT", body: { roles } }), onSuccess: setUser }),
    skipResume: useMutation({ mutationFn: () => api<{ user: User }>("/profile/onboarding/skip-resume", { method: "POST", body: {} }), onSuccess: setUser }),
    logout: useMutation({ mutationFn: () => api("/auth/logout", { method: "POST", body: {} }), onSuccess: () => qc.setQueryData(["me"], null) }),
  };
}
