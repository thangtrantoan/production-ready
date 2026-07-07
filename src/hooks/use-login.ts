"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { notify } from "@/lib/toast";
import { setTokens } from "@/lib/token-storage";
import { authService } from "@/services/auth.service";

/**
 * Reference mutation hook: wraps a service call and owns the UI side effects
 * (store tokens, toast, redirect). Components only call `login.mutate(values)`
 * and read `login.isPending` — they never touch the service or axios.
 */
export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, tokens }) => {
      setTokens(tokens);
      notify.success(`Welcome back, ${user.name}`);
      router.push("/dashboard");
    },
    // Errors are toasted globally by the MutationCache in lib/query-client.ts.
  });
}
