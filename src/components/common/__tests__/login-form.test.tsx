import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/common/login-form";
import { authService } from "@/services/auth.service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/services/auth.service", () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      user: {
        id: "usr_001",
        email: "test@example.com",
        name: "Test User",
        role: "member",
        active: true,
        createdAt: new Date().toISOString(),
      },
      tokens: { accessToken: "access", refreshToken: "refresh" },
    }),
  },
}));

function renderLoginForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe("LoginForm", () => {
  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/password must be at least 8 characters/i),
    ).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it("submits credentials when the form is valid", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "supersecret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        { email: "test@example.com", password: "supersecret1" },
        // React Query passes its mutation context as a second argument.
        expect.anything(),
      );
    });
  });
});
