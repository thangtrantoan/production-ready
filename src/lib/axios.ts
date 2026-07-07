/**
 * Shared axios instance. All services import `api` from here — never create
 * another instance, or the auth flow below won't apply.
 *
 * How the 401 → refresh flow works:
 *   1. Request interceptor attaches the access token (if any) as Bearer.
 *   2. A response with status 401 triggers ONE refresh call, shared by every
 *      request that fails while it is in flight (`refreshPromise`).
 *   3. On refresh success: new tokens are stored, the original request is
 *      retried once (`_retry` guard prevents loops).
 *   4. On refresh failure: tokens are cleared and the browser is sent to
 *      /login.
 *
 * Per-backend checklist when reusing this template:
 *   - BASE_URL / NEXT_PUBLIC_API_URL
 *   - refresh endpoint path + payload shape (see refreshAccessToken)
 *   - error body shape (see getApiErrorMessage + types/api.ts)
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/token-storage";
import type { ApiErrorResponse } from "@/types/api";
import type { AuthTokens } from "@/types/auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// Endpoints that must never trigger the refresh flow on 401.
const AUTH_ENDPOINTS = ["/auth/login", "/auth/refresh"];

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Single in-flight refresh shared by all 401s that arrive concurrently.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  // Plain axios (not `api`) so the interceptors above don't recurse.
  // Adjust the path and body to your backend, e.g. FastAPI often expects
  // { refresh_token } (snake_case) or the token in a cookie instead.
  const { data } = await axios.post<AuthTokens>(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });
  setTokens(data);
  return data.accessToken;
}

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      original?.url?.includes(path),
    );

    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const accessToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(
        refreshError instanceof Error ? refreshError : error,
      );
    }
  },
);

/** Turns any thrown value into a user-facing message. FastAPI-aware. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      return data.detail.map((item) => item.msg).join(". ");
    }
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED")
      return "Request timed out. Please try again.";
    if (!error.response)
      return "Cannot reach the server. Check your connection.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
