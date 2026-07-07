"use client";

import { useQuery } from "@tanstack/react-query";

import { userService } from "@/services/user.service";

/**
 * Query-key factory. Keep one per domain, next to its hooks, so invalidation
 * is precise and typo-proof:
 *   queryClient.invalidateQueries({ queryKey: userKeys.all });     // everything
 *   queryClient.invalidateQueries({ queryKey: userKeys.list() });  // just lists
 * Extend with parameters as needed, e.g. detail: (id) => [...all, id].
 */
export const userKeys = {
  all: ["users"] as const,
  list: () => [...userKeys.all, "list"] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: userService.getUsers,
  });
}
