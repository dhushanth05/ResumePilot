import { apiFetch } from "@/lib/api";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "@/types/auth";

const AUTH_BASE = "/auth";

export async function register(payload: RegisterPayload): Promise<User> {
  return apiFetch<User>(`${AUTH_BASE}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const token = await apiFetch<TokenResponse>(`${AUTH_BASE}/login-json`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem("access_token", token.access_token);
  }

  return token;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("access_token");
  }
}

