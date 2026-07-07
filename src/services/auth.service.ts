import { api } from "@/lib/axios";
import type { LoginPayload, LoginResponse, User } from "@/types/auth";

/**
 * One service per backend domain. Services own endpoints and payload
 * shapes; hooks own caching and UI concerns. Components never import axios.
 */
export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
