"use client";

import { format } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  type TooltipValueType,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Reference chart pattern: colors come from the theme's --chart-* CSS
// variables (styles/globals.css) so swapping the palette restyles every
// chart; axis/grid/tooltip use the same tokens as the rest of the UI.
//
// Demo data. In a real app fetch this via a service + React Query hook,
// exactly like UsersTable does.
const revenueByMonth = Array.from({ length: 12 }, (_, monthIndex) => ({
  month: format(new Date(2025, monthIndex, 1), "MMM"),
  revenue: 32000 + ((monthIndex * 7919) % 26000),
}));

const compactCurrency = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function RevenueTooltip({
  active,
  payload,
  label,
}: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">
        Revenue: ${compactCurrency.format(Number(payload[0].value ?? 0))}
      </p>
    </div>
  );
}

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Monthly revenue, last 12 months (USD)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revenueByMonth}
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                width={44}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                tickFormatter={(value: number) => compactCurrency.format(value)}
              />
              <Tooltip
                content={RevenueTooltip}
                cursor={{ fill: "var(--muted)", fillOpacity: 0.5 }}
              />
              <Bar
                dataKey="revenue"
                fill="var(--chart-2)"
                maxBarSize={36}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
