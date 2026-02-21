import { apiFetch } from "@/lib/api";
import type { FullProfile, ProfileUpdatePayload } from "@/types/profile";

const PROFILE_BASE = "/profile";

export async function getProfile(): Promise<FullProfile> {
  return apiFetch<FullProfile>(`${PROFILE_BASE}/me`, { method: "GET" });
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<FullProfile> {
  return apiFetch<FullProfile>(`${PROFILE_BASE}/me`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function generateProfileFromResume(
  resumeId: string,
  overwrite: boolean = false
): Promise<FullProfile> {
  return apiFetch<FullProfile>(`${PROFILE_BASE}/generate`, {
    method: "POST",
    body: JSON.stringify({ resume_id: resumeId, overwrite }),
  });
}
