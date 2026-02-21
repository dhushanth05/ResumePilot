export type Role = "user" | "admin";

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  role: Role;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  full_name?: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

