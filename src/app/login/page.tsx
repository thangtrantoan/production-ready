import type { Metadata } from "next";

import { LoginForm } from "@/components/common/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <LoginForm />
    </main>
  );
}
