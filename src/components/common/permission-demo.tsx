"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Can, useAppAbility } from "@/lib/ability";

/**
 * Two ways to gate UI by permission:
 * 1. Declarative: `<Can I="..." a="...">` renders children only when allowed.
 * 2. Imperative: `useAppAbility().can(...)` for logic outside JSX.
 * The current role is set in components/providers.tsx (demo: admin).
 */
export function PermissionDemo() {
  const ability = useAppAbility();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissions (CASL)</CardTitle>
        <CardDescription>
          Buttons below render based on the current role&apos;s ability.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Can I="create" a="Report">
          <Button size="sm">Create report</Button>
        </Can>
        <Can I="delete" a="User">
          <Button size="sm" variant="destructive">
            Delete user
          </Button>
        </Can>
        <Badge variant="outline">
          can read User: {ability.can("read", "User") ? "yes" : "no"}
        </Badge>
      </CardContent>
    </Card>
  );
}
