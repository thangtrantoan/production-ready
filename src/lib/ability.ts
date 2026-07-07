import {
  AbilityBuilder,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability";
import { useAbility } from "@casl/react";

import type { Role } from "@/types/auth";

export type Action = "manage" | "create" | "read" | "update" | "delete";
export type Subject = "User" | "Report" | "Dashboard" | "all";

export type AppAbility = MongoAbility<[Action, Subject]>;

// Provide with <AbilityProvider value={ability}> and gate UI with <Can>.
// Both come from @casl/react and share a single internal context.
export { AbilityProvider, Can } from "@casl/react";

/**
 * Central permission matrix. Keep every role's rules here so access control
 * is auditable in one place. If the backend returns permission rules,
 * replace this switch with `createMongoAbility(rulesFromApi)`.
 */
export function defineAbilityFor(role: Role): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  switch (role) {
    case "admin":
      can("manage", "all");
      break;
    case "manager":
      can("read", ["Dashboard", "Report", "User"]);
      can(["create", "update"], "Report");
      break;
    case "member":
      can("read", ["Dashboard", "Report"]);
      break;
  }

  return build();
}

/** Imperative check inside components: `const ability = useAppAbility()`. */
export function useAppAbility(): AppAbility {
  return useAbility<AppAbility>();
}
