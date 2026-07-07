import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site.config";

const demos = [
  {
    href: "/login",
    title: "Login form",
    description: "react-hook-form + zod validation, mutation via React Query.",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "TanStack Table, Recharts and CASL permissions in one page.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {siteConfig.name}
        </h1>
        <p className="text-muted-foreground">{siteConfig.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {demos.map((demo) => (
          <Card key={demo.href}>
            <CardHeader>
              <CardTitle>{demo.title}</CardTitle>
              <CardDescription>{demo.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href={demo.href}>Open demo</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Start here: <code>src/config/site.config.ts</code>, then read{" "}
        <code>CONTRIBUTING.md</code> for the conventions.
      </p>
    </main>
  );
}
