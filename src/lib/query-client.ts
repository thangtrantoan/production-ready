import {
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/axios";
import { notify } from "@/lib/toast";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: { silent?: boolean };
    mutationMeta: { silent?: boolean };
  }
}

function makeQueryClient(): QueryClient {
  return new QueryClient({
    // Errors surface as toasts by default. Opt out per query/mutation with
    // `meta: { silent: true }` when the caller renders its own error state.
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.silent) return;
        notify.error(getApiErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.silent) return;
        notify.error(getApiErrorMessage(error));
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: a fresh client per request (no state shared between users).
 * Browser: a singleton so cache survives React re-renders and suspense.
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
