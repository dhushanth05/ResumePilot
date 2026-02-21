import { apiFetch } from "@/lib/api";
import type { JobDescription, JobDescriptionCreate } from "@/types/job";

const JOBS_BASE = "/jobs";

export async function createJobDescription(
  payload: JobDescriptionCreate
): Promise<JobDescription> {
  return apiFetch<JobDescription>(`${JOBS_BASE}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listJobDescriptions(): Promise<JobDescription[]> {
  return apiFetch<JobDescription[]>(`${JOBS_BASE}`, {
    method: "GET",
  });
}

export async function deleteJobDescription(jobId: string): Promise<void> {
  return apiFetch<void>(`${JOBS_BASE}/${jobId}`, {
    method: "DELETE",
  });
}

