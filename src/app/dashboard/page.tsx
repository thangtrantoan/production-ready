import type { Metadata } from "next";

import { PermissionDemo } from "@/components/common/permission-demo";
import { RevenueChart } from "@/components/common/revenue-chart";
import { UsersTable } from "@/components/common/users-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features } from "@/config/features.config";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-6 px-6 py-10">
      <div className="grid gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Sample wiring of chart, table and permissions. Delete freely.
        </p>
      </div>

      {features.permissionDemo && <PermissionDemo />}

      {features.dashboardCharts && <RevenueChart />}

      {features.usersTable && (
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              TanStack Table with sorting, filtering and pagination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
