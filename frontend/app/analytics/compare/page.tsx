"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

import { SkillGapBar } from "@/components/charts/SkillGapBar";
import { SkillRadar } from "@/components/charts/SkillRadar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysisHistory, runAnalysis } from "@/services/analysis";
import { listJobDescriptions } from "@/services/jobs";
import { getResumes } from "@/services/resumes";
import type { AnalysisDashboardResponse, AnalysisResult } from "@/types/analysis";
import type { JobDescription } from "@/types/job";
import type { ResumeListItem } from "@/types/resume";

export default function ResumeComparisonPage() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);

  const [compareResumeAId, setCompareResumeAId] = useState("");
  const [compareResumeBId, setCompareResumeBId] = useState("");
  const [compareJobId, setCompareJobId] = useState("");
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareSubmitting, setCompareSubmitting] = useState(false);
  const [compareResult, setCompareResult] = useState<
    { a: AnalysisDashboardResponse; b: AnalysisDashboardResponse } | null
  >(null);

  useEffect(() => {
    void (async () => {
      try {
        const items = await getAnalysisHistory();
        setHistory(items);
      } catch {
        // ignore history errors for now
      }
      try {
        const [resumeData, jobData] = await Promise.all([
          getResumes(),
          listJobDescriptions(),
        ]);
        setResumes(resumeData);
        setJobs(jobData);
      } catch {
        // ignore initial load errors
      }
    })();
  }, []);

  const handleCompareResumes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compareResumeAId || !compareResumeBId || !compareJobId) {
      setCompareError("Select two resumes and a job description.");
      return;
    }
    if (compareResumeAId === compareResumeBId) {
      setCompareError("Choose two different resumes to compare.");
      return;
    }

    setCompareSubmitting(true);
    setCompareError(null);
    try {
      const [a, b] = await Promise.all([
        runAnalysis({
          resume_id: compareResumeAId,
          job_description_id: compareJobId,
        }),
        runAnalysis({
          resume_id: compareResumeBId,
          job_description_id: compareJobId,
        }),
      ]);
      setCompareResult({ a, b });

      try {
        const items = await getAnalysisHistory();
        setHistory(items);
      } catch {
        // ignore
      }
    } catch (err) {
      setCompareError((err as Error).message);
    } finally {
      setCompareSubmitting(false);
    }
  };

  const latestCharts = compareResult?.b.charts ?? null;

  return (
    <DashboardLayout
      title="Resume Comparison"
      subtitle="Compare two different resumes for the same job description."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compare resumes</CardTitle>
            <CardDescription>
              Select two resumes and a job description to see detailed comparison.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleCompareResumes} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Resume A</label>
                <select
                  value={compareResumeAId}
                  onChange={(e) => setCompareResumeAId(e.target.value)}
                  className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <option value="">Select resume A...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">Resume B</label>
                <select
                  value={compareResumeBId}
                  onChange={(e) => setCompareResumeBId(e.target.value)}
                  className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <option value="">Select resume B...</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Job description
                </label>
                <select
                  value={compareJobId}
                  onChange={(e) => setCompareJobId(e.target.value)}
                  className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <option value="">Select a job description...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                      {job.company ? ` at ${job.company}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {compareError && (
                <p className="text-xs text-red-400" role="alert">
                  {compareError}
                </p>
              )}

              <Button type="submit" disabled={compareSubmitting} className="w-full">
                {compareSubmitting ? "Comparing..." : "Compare"}
              </Button>
            </form>

            {/* Comparison Results - Only show after comparison is made */}
            {compareResult ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Resume A Score Card */}
                  <Card className="border-slate-700 bg-slate-900/70">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-300">
                        Resume A
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">ATS Score</span>
                        <span className="text-lg font-bold text-slate-50">
                          {Math.round(compareResult.a.charts.ats_score * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Similarity</span>
                        <span className="text-lg font-bold text-slate-50">
                          {Math.round(compareResult.a.charts.similarity_score * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Overall</span>
                        <span className="text-lg font-bold text-sky-400">
                          {Math.round(((compareResult.a.charts.ats_score + compareResult.a.charts.similarity_score) / 2) * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Resume B Score Card */}
                  <Card className="border-slate-700 bg-slate-900/70">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-slate-300">
                        Resume B
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">ATS Score</span>
                        <span className="text-lg font-bold text-slate-50">
                          {Math.round(compareResult.b.charts.ats_score * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Similarity</span>
                        <span className="text-lg font-bold text-slate-50">
                          {Math.round(compareResult.b.charts.similarity_score * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">Overall</span>
                        <span className="text-lg font-bold text-sky-400">
                          {Math.round(((compareResult.b.charts.ats_score + compareResult.b.charts.similarity_score) / 2) * 100)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Skill Difference Summary */}
                <Card className="border-slate-700 bg-slate-900/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-slate-300">
                      Skill Difference Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="space-y-1 text-sm">
                        <div className="text-xs font-medium text-slate-400">ATS Change</div>
                        <div className={`font-medium ${
                          Math.round(compareResult.b.charts.ats_score * 100) - Math.round(compareResult.a.charts.ats_score * 100) >= 0 
                            ? "text-green-400" : "text-red-400"
                        }`}>
                          {Math.round(compareResult.b.charts.ats_score * 100) - Math.round(compareResult.a.charts.ats_score * 100) >= 0 ? "+" : ""}
                          {Math.round(compareResult.b.charts.ats_score * 100) - Math.round(compareResult.a.charts.ats_score * 100)}%
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-xs font-medium text-slate-400">Similarity Change</div>
                        <div className={`font-medium ${
                          Math.round(compareResult.b.charts.similarity_score * 100) - Math.round(compareResult.a.charts.similarity_score * 100) >= 0 
                            ? "text-green-400" : "text-red-400"
                        }`}>
                          {Math.round(compareResult.b.charts.similarity_score * 100) - Math.round(compareResult.a.charts.similarity_score * 100) >= 0 ? "+" : ""}
                          {Math.round(compareResult.b.charts.similarity_score * 100) - Math.round(compareResult.a.charts.similarity_score * 100)}%
                        </div>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="text-xs font-medium text-slate-400">Higher Overall Match</div>
                        <div className="font-medium text-sky-400">
                          {((compareResult.b.charts.ats_score + compareResult.b.charts.similarity_score) / 2) > 
                           ((compareResult.a.charts.ats_score + compareResult.a.charts.similarity_score) / 2) 
                            ? "Resume B" : "Resume A"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Gap Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skill gap</CardTitle>
                    <CardDescription>
                      Visual comparison of matched and missing skills.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestCharts && latestCharts.skill_gap.length > 0 ? (
                      <SkillGapBar data={latestCharts.skill_gap} />
                    ) : (
                      <p className="text-sm text-slate-400">No skill gap data available.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Skill Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skill radar</CardTitle>
                    <CardDescription>
                      High-level view of skill distribution.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {latestCharts ? (
                      <SkillRadar data={latestCharts.skill_distribution} />
                    ) : (
                      <p className="text-sm text-slate-400">No skill distribution data available.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Empty state when no comparison has been made */
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="text-slate-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">Select resumes to compare</div>
                  <div className="text-sm mt-2">
                    Choose two resumes and a job description to see detailed comparison results
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
