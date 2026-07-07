"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastContainer } from "react-toastify";

import { AbilityProvider, defineAbilityFor } from "@/lib/ability";
import { getQueryClient } from "@/lib/query-client";

/**
 * Single client-side provider stack, mounted once in app/layout.tsx.
 * Add new global providers here (theme, auth context, ...) instead of
 * nesting them in layout.tsx.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // Demo: everyone is admin. In a real app, derive the role from the
  // authenticated user (e.g. authService.getCurrentUser) and rebuild the
  // ability whenever the user changes.
  const [ability] = useState(() => defineAbilityFor("admin"));

  return (
    <QueryClientProvider client={queryClient}>
      <AbilityProvider value={ability}>
        {children}
        <ToastContainer position="top-right" autoClose={4000} newestOnTop />
      </AbilityProvider>
    </QueryClientProvider>
  );
}
