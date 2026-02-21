import { apiFetch } from "@/lib/api";
import type {
  AnalysisDashboardResponse,
  AnalysisResult,
  AnalysisRunRequest,
} from "@/types/analysis";

const ANALYSIS_BASE = "/analysis";

export async function runAnalysis(
  payload: AnalysisRunRequest
): Promise<AnalysisDashboardResponse> {
  return apiFetch<AnalysisDashboardResponse>(`${ANALYSIS_BASE}/run`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAnalysisHistory(): Promise<AnalysisResult[]> {
  return apiFetch<AnalysisResult[]>(`${ANALYSIS_BASE}/history`, {
    method: "GET",
  });
}

