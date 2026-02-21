import { apiFetch } from "@/lib/api";
import type {
  Resume,
  ResumeListItem,
} from "@/types/resume";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
const RESUMES_BASE = "/resumes";

export async function getResumes(): Promise<ResumeListItem[]> {
  return apiFetch<ResumeListItem[]>(`${RESUMES_BASE}`, {
    method: "GET",
  });
}

export async function uploadResumeFile(
  file: File,
  title?: string
): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);
  if (title) {
    formData.append("title", title);
  }

  return apiFetch<Resume>(`${RESUMES_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
}

export async function deleteResume(resumeId: string): Promise<void> {
  await apiFetch<void>(`${RESUMES_BASE}/${resumeId}`, {
    method: "DELETE",
  });
}

/**
 * Fetch the resume PDF and open it in a new tab.
 * Pass a window opened synchronously on click to avoid popup blockers.
 */
export async function viewResumeFile(
  resumeId: string,
  targetWindow?: Window | null
): Promise<void> {
  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("access_token")
      : null;
  const res = await fetch(`${API_BASE_URL}${RESUMES_BASE}/${resumeId}/file`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const msg = res.status === 404 ? "File not found" : "Failed to load file";
    throw new Error(msg);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

