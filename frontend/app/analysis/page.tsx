"use client";

import { useEffect, useState } from "react";
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Download,
  FileText,
  Info,
  Printer,
  TriangleAlert,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { runAnalysis } from "@/services/analysis";
import { getAnalysisHistory } from "@/services/analysis";
import { listJobDescriptions } from "@/services/jobs";
import { getResumes } from "@/services/resumes";
import EmptyState from "@/components/ui/EmptyState";
import { WeightedScoreCard } from "@/components/analysis/WeightedScoreCard";
import { PriorityIndicator } from "@/components/analysis/PriorityIndicator";
import { SmartRecommendations } from "@/components/analysis/SmartRecommendations";
import { SimplifiedScoreOverview } from "@/components/analysis/SimplifiedScoreOverview";
import { ImpactSimulator } from "@/components/analysis/ImpactSimulator";
import { categorizeSkills, calculateWeightedScore, normalizeSkill } from "@/lib/skillCategorization";
import { generateSmartRecommendations } from "@/lib/smartRecommendations";
import { extractExperienceFromText, calculateExperienceRelevance } from "@/lib/experienceRelevance";
import { enhanceAnalysisResponse } from "@/lib/analysisEnhancer";
import type {
  AnalysisDashboardResponse,
  AnalysisResult,
  KeywordGapItem,
} from "@/types/analysis";
import type { JobDescription } from "@/types/job";
import type { ResumeListItem } from "@/types/resume";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function scoreToColor(score01: number) {
  const pct = score01 * 100;
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function scoreToTextColor(score01: number) {
  const pct = score01 * 100;
  if (pct >= 80) return "text-emerald-300";
  if (pct >= 60) return "text-amber-300";
  return "text-rose-300";
}

function toPct(score01: number) {
  return Math.round(clamp01(score01) * 100);
}

function downloadTextFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]) {
  const headers = Array.from(
    rows.reduce((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set<string>())
  );
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (/[\n\r,\"]/g.test(s)) return `"${s.replaceAll("\"", '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(headers.map((h) => escape((r as Record<string, unknown>)[h])).join(","));
  }
  return lines.join("\n");
}

function RadialScore({ value01, label, hint }: { value01: number; label: string; hint?: string }) {
  const pct = toPct(value01);
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const color = scoreToTextColor(value01);
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayValue((prev) => {
          if (prev < pct) return prev + 2;
          clearInterval(interval);
          return pct;
        });
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timer);
  }, [pct]);
  
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 100 100" className="h-20 w-20">
          <circle
            cx="50"
            cy="50"
            r={r}
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="10"
            fill="transparent"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={r}
            strokeWidth="10"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            className={color}
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 50 50)"
            initial={{ strokeDasharray: `0 ${c}` }}
            animate={{ strokeDasharray: `${dash} ${c - dash}` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-lg font-semibold text-slate-50">{displayValue}%</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-400">Score</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate text-sm font-medium text-slate-100">{label}</div>
          {hint ? (
            <span title={hint} className="inline-flex items-center text-slate-400">
              <Info className="h-4 w-4" />
            </span>
          ) : null}
        </div>
        <div className="mt-2 h-2 w-full max-w-[14rem] overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className={`h-2 ${scoreToColor(value01)}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function Badge({ text, variant }: { text: string; variant: "green" | "red" | "blue" | "slate" }) {
  const cls =
    variant === "green"
      ? "bg-emerald-500/15 text-emerald-200 ring-emerald-500/20"
      : variant === "red"
        ? "bg-rose-500/15 text-rose-200 ring-rose-500/20"
        : variant === "blue"
          ? "bg-sky-500/15 text-sky-200 ring-sky-500/20"
          : "bg-slate-500/15 text-slate-200 ring-slate-500/20";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs ring-1 ${cls}`}>
      {text}
    </span>
  );
}

function Heatmap({ jobSkills, resumeSkills }: { jobSkills: string[]; resumeSkills: string[] }) {
  const resumeSet = new Set(resumeSkills);
  const items = jobSkills.slice(0, 36);
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {items.map((k) => {
        const ok = resumeSet.has(k);
        return (
          <div
            key={k}
            title={ok ? "Found in resume" : "Missing from resume"}
            className={`rounded-lg border px-2 py-2 text-[11px] leading-tight ${
              ok
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
                : "border-rose-500/20 bg-rose-500/10 text-rose-100"
            }`}
          >
            {k}
          </div>
        );
      })}
    </div>
  );
}

export default function AnalysisPage() {
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJobDescriptionId, setSelectedJobDescriptionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisDashboardResponse | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const [resumeData, jobData, historyData] = await Promise.all([
          getResumes(),
          listJobDescriptions(),
          getAnalysisHistory(),
        ]);
        setResumes(resumeData);
        setJobs(jobData);
        setHistory(historyData);
      } catch {
        // ignore initial load errors
      }
    })();
  }, []);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedJobDescriptionId) {
      setError("Select both a resume and job description.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await runAnalysis({
        resume_id: selectedResumeId,
        job_description_id: selectedJobDescriptionId,
      });
      
      // Enhance the analysis with weighted scoring and smart recommendations
      // Note: In a real implementation, you'd fetch the resume text here
      const enhancedResult = enhanceAnalysisResponse(result);
      setAnalysis(enhancedResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const charts = analysis?.charts;
  const breakdown = analysis?.breakdown;

  const scoreCards = analysis
    ? [
        {
          label: "Weighted ATS Score",
          value01: analysis.breakdown?.weighted_skill_score ?? analysis.ats_score,
          hint: "Weighted score considering skill categories and priorities.",
        },
        {
          label: "Skill Match %",
          value01: analysis.skill_match,
          hint: "Semantic similarity between resume and job description.",
        },
        {
          label: "Formatting Score",
          value01: breakdown?.formatting ?? 0,
          hint: "Structure, readability, and scannability for ATS.",
        },
        {
          label: "Keyword Optimization",
          value01: breakdown?.keyword_optimization ?? 0,
          hint: "Coverage of job-relevant keywords in your resume.",
        },
        {
          label: "Experience Relevance",
          value01: breakdown?.experience_relevance ?? 0,
          hint: "How closely your experience aligns with the role.",
        },
        {
          label: "Confidence Score",
          value01: breakdown?.confidence_score ?? 0,
          hint: "Reliability of the analysis based on data quality.",
        },
      ]
    : [];

  const donutData = analysis
    ? [
        { name: "Matched", value: analysis.matched_skills.length, fill: "#10b981" },
        { name: "Missing", value: analysis.missing_skills.length, fill: "#fb7185" },
        { name: "Extra", value: analysis.extra_skills.length, fill: "#38bdf8" },
      ]
    : [];

  const radarData = analysis
    ? [
        {
          metric: "Formatting",
          value: toPct(breakdown?.formatting ?? 0),
        },
        {
          metric: "Keywords",
          value: toPct(breakdown?.keyword_optimization ?? 0),
        },
        {
          metric: "Experience",
          value: toPct(breakdown?.experience_relevance ?? 0),
        },
        {
          metric: "Projects",
          value: toPct(breakdown?.project_relevance ?? 0),
        },
        {
          metric: "Skill Match",
          value: toPct(analysis.skill_match),
        },
      ]
    : [];

  const trend = history
    .slice(-12)
    .map((h) => ({
      created_at: new Date(h.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "2-digit",
      }),
      ats: Math.round(h.ats_score * 100),
      sim: Math.round(h.similarity_score * 100),
    }));

  const handleExportCsv = () => {
    if (!analysis) return;
    const rows = analysis.keyword_gap.map((k: KeywordGapItem) => ({
      keyword: k.keyword,
      found_in_resume: k.found_in_resume,
      importance: k.importance,
      impact_score: k.impact_score,
    }));
    downloadTextFile("analysis-keyword-gap.csv", toCsv(rows), "text/csv");
  };

  const handleExportJson = () => {
    if (!analysis) return;
    downloadTextFile("analysis-report.json", JSON.stringify(analysis, null, 2), "application/json");
  };

  const handlePrint = () => {
    window.print();
  };
   return (
    <DashboardLayout
      title="Analysis"
      subtitle="Run an AI analysis against a job description and review the results."
    >
      <div className="space-y-8">
        {/* Run analysis — soft floating block */}
        <motion.section 
          className="rounded-2xl bg-slate-900/40 px-5 py-6 ring-1 ring-slate-800/50 backdrop-blur-sm sm:px-6 md:max-w-2xl hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
          initial={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Run Analysis Form */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-100">Run analysis</h2>
                <p className="mt-0.5 text-sm text-slate-400">
                  Select a resume and job description to generate a match report.
                </p>
              </div>
              <form onSubmit={handleRunAnalysis} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Resume</label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    <option value="">Select a resume...</option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Job description</label>
                  <select
                    value={selectedJobDescriptionId}
                    onChange={(e) => setSelectedJobDescriptionId(e.target.value)}
                    className="block w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
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

                {error && (
                  <p className="text-xs text-red-400" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={submitting} className={`w-full rounded-xl transition-all duration-200 ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-blue-500/20'}`}>
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 bg-white/5 rounded-lg animate-pulse"></div>
                    </div>
                  ) : (
                    "Run analysis"
                  )}
                </Button>
              </form>

              <p className="mt-3 text-xs text-slate-500">
                Tip: Upload resumes and save job descriptions first to make selection easier.
              </p>
            </div>

            {/* Right: Export Buttons */}
            <div className="lg:w-48">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-100">Export</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  Download results
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-full rounded-lg hover:shadow-blue-500/20 transition-all duration-200 ${!analysis ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleExportCsv}
                  disabled={!analysis}
                >
                  {!analysis ? (
                    <div className="w-4 h-4 bg-white/5 rounded-lg animate-pulse"></div>
                  ) : (
                    <><Download className="mr-1.5 h-3.5 w-3.5" /> CSV</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-full rounded-lg hover:shadow-blue-500/20 transition-all duration-200 ${!analysis ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleExportJson}
                  disabled={!analysis}
                >
                  {!analysis ? (
                    <div className="w-4 h-4 bg-white/5 rounded-lg animate-pulse"></div>
                  ) : (
                    <><FileText className="mr-1.5 h-3.5 w-3.5" /> JSON</>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`w-full rounded-lg hover:shadow-blue-500/20 transition-all duration-200 ${!analysis ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handlePrint}
                  disabled={!analysis}
                >
                  {!analysis ? (
                    <div className="w-4 h-4 bg-white/5 rounded-lg animate-pulse"></div>
                  ) : (
                    <><Printer className="mr-1.5 h-3.5 w-3.5" /> Print</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Results — free-flowing bento grid, no single big card */}
        {!analysis ? (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
            transition={{ duration: 0.6 }}
          >
            <EmptyState 
              type="analytics" 
              onAction={() => window.location.href = '/resumes'}
            />
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: isLoaded ? 1 : 0, translateY: isLoaded ? 0 : 16 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/20 px-4 py-3 ring-1 ring-slate-800/40">
              <span className="text-sm font-medium text-slate-200">Results</span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> 80–100
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> 60–79
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500" /> &lt;60
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
                {/* Simplified Score Overview */}
                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-100">Score Overview</h3>
                    <p className="text-xs text-slate-400">
                      Consolidated view of your match quality and analysis confidence
                    </p>
                  </div>
                  <SimplifiedScoreOverview
                    overallMatch={analysis.ats_score}
                    technicalFit={analysis.breakdown?.weighted_skill_score || analysis.skill_match}
                    experienceFit={analysis.breakdown?.experience_relevance || 0}
                    atsOptimization={analysis.breakdown?.formatting || 0}
                    confidenceScore={analysis.breakdown?.confidence_score || 0}
                    breakdown={{
                      category_scores: analysis.breakdown?.category_scores || {},
                      preferredSkillImpact: (analysis as any).weighted_scores?.preferredSkillImpact || 0,
                      bonusSkillDifferentiator: (analysis as any).weighted_scores?.bonusSkillDifferentiator || 0
                    }}
                  />
                </div>

                {/* Categorized Skills Breakdown */}
                {analysis?.categorized_skills && (
                  <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-slate-100">Skills by Category</h3>
                      <p className="text-xs text-slate-400">
                        Job requirements broken down by skill categories
                      </p>
                    </div>
                    <div className="flex-1 space-y-3">
                      {Object.entries(analysis.categorized_skills).map(([category, skills]) => {
                        const categoryScore = analysis.breakdown?.category_scores?.[category] || 0;
                        const priority = category === 'core_technical' ? 'critical' : 
                                       category === 'backend' || category === 'frontend' ? 'important' : 'nice_to_have';
                        
                        return (
                          <div key={category} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium capitalize text-slate-200">
                                  {category.replace('_', ' ')}
                                </span>
                                <PriorityIndicator priority={priority} size="sm" />
                              </div>
                              <span className="text-sm font-medium text-slate-300">
                                {Math.round(categoryScore * 100)}%
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {skills.slice(0, 6).map((skill: string) => (
                                <span key={skill} className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-300">
                                  {skill}
                                </span>
                              ))}
                              {skills.length > 6 && (
                                <span className="px-2 py-1 text-xs rounded bg-slate-800 text-slate-400">
                                  +{skills.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-200">Skills Ratio</div>
                    <span className="text-xs text-slate-400">Matched vs Missing</span>
                  </div>
                  <div className="flex flex-col items-center space-y-6">
                    {/* Centered Donut Chart */}
                    <div className="flex h-52 w-52 items-center justify-center">
                      {!analysis ? (
                        <div className="w-full h-full bg-white/5 rounded-lg animate-pulse"></div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={donutData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={55}
                              outerRadius={80}
                              paddingAngle={3}
                            >
                              {donutData.map((d) => (
                                <Cell key={d.name} fill={d.fill} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "rgba(2,6,23,0.9)",
                                border: "1px solid rgba(148,163,184,0.2)",
                                borderRadius: 12,
                              }}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Stacked Stats Below Chart */}
                    <div className="w-full space-y-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                        <div className="text-xs text-slate-400">Matched skills</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-50">
                          {analysis.matched_skills.length}
                        </div>
                      </div>
                      
                      <div className="h-px bg-slate-800/50"></div>
                      
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                        <div className="text-xs text-slate-400">Missing skills</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-50">
                          {analysis.missing_skills.length}
                        </div>
                      </div>
                      
                      <div className="h-px bg-slate-800/50"></div>
                      
                      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
                        <div className="text-xs text-slate-400">Extra skills</div>
                        <div className="mt-1 text-2xl font-semibold text-slate-50">
                          {analysis.extra_skills.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-200">Performance Radar</div>
                    <span className="text-xs text-slate-400">Score distribution</span>
                  </div>
                  <div className={`h-[320px] ${!analysis ? 'flex items-center justify-center' : ''}`}>
                    {!analysis ? (
                      <div className="w-full h-full bg-white/5 rounded-lg animate-pulse"></div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} outerRadius="80%">
                          <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                          <PolarRadiusAxis tick={{ fill: "#94a3b8", fontSize: 12 }} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(2,6,23,0.9)",
                              border: "1px solid rgba(148,163,184,0.2)",
                              borderRadius: 12,
                            }}
                          />
                          <Radar dataKey="value" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  
                  {/* How to Read This Chart */}
                  <div className="mt-4 rounded-lg border border-slate-800/50 bg-slate-950/40 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-sky-400"></div>
                      <h4 className="text-xs font-medium text-slate-300">How to Read This Chart</h4>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div>
                        <span><span className="text-slate-400">Skill Match:</span> How well your skills align with job requirements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400"></div>
                        <span><span className="text-slate-400">Experience:</span> Relevance of your work experience to the role</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-violet-400"></div>
                        <span><span className="text-slate-400">Keywords:</span> Coverage of important job-related terms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-rose-400"></div>
                        <span><span className="text-slate-400">Projects:</span> How your project experience matches requirements</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                        <span><span className="text-slate-400">Formatting:</span> ATS readability and structure quality</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">Extracted Resume Skills</h3>
                    <p className="text-xs text-slate-400">Detected skills from your resume</p>
                  </div>
                  <div className="flex-1">
                    {analysis.resume_skills.length === 0 ? (
                      <p className="text-sm text-slate-400">No skills extracted.</p>
                    ) : (
                      <div className="flex max-h-56 flex-wrap gap-2 overflow-auto pr-1">
                        {analysis.resume_skills.slice(0, 40).map((s) => (
                          <Badge key={s} text={s} variant="slate" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">Extracted JD Skills</h3>
                    <p className="text-xs text-slate-400">Skills required or implied by the role</p>
                  </div>
                  <div className="flex-1">
                    {analysis.job_skills.length === 0 ? (
                      <p className="text-sm text-slate-400">No skills extracted.</p>
                    ) : (
                      <div className="flex max-h-56 flex-wrap gap-2 overflow-auto pr-1">
                        {analysis.job_skills.slice(0, 40).map((s) => (
                          <Badge key={s} text={s} variant="slate" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">Skill Comparison</h3>
                    <p className="text-xs text-slate-400">Matched, missing, and extra skills</p>
                  </div>
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 text-xs font-medium text-slate-300">Matched</div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.matched_skills.slice(0, 18).map((s) => (
                            <Badge key={s} text={s} variant="green" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-medium text-slate-300">Missing</div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.missing_skills.slice(0, 18).map((s) => (
                            <Badge key={s} text={s} variant="red" />
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-2 text-xs font-medium text-slate-300">Extra</div>
                        <div className="flex flex-wrap gap-2">
                          {analysis.extra_skills.slice(0, 18).map((s) => (
                            <Badge key={s} text={s} variant="blue" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">Skill Heatmap</h3>
                    <p className="text-xs text-slate-400">
                      Quick scan of job skills present vs missing in your resume
                    </p>
                  </div>
                  <Heatmap jobSkills={analysis.job_skills} resumeSkills={analysis.resume_skills} />
                </div>

                <div className="rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">Enhanced Keyword Gap Analysis</h3>
                      <p className="text-xs text-slate-400">
                        Skills categorized by priority with semantic normalization
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">
                      {analysis.keyword_gap.length} keywords analyzed
                    </span>
                  </div>
                  <div>
                    <div className="overflow-hidden rounded-xl ring-1 ring-slate-800/50">
                      <div className="grid grid-cols-5 bg-slate-950/40 px-4 py-3 text-xs font-medium text-slate-300">
                        <div>Keyword</div>
                        <div>Category</div>
                        <div>Found</div>
                        <div>Priority</div>
                        <div>Impact</div>
                      </div>
                      <div className="divide-y divide-slate-800">
                        {analysis.keyword_gap.slice(0, 15).map((row: KeywordGapItem) => {
                          const danger = row.importance === "High" && !row.found_in_resume;
                          const priority = row.priority || 'nice_to_have';
                          
                          return (
                            <div
                              key={row.keyword}
                              className={`grid grid-cols-5 px-4 py-3 text-xs items-center ${
                                danger ? "bg-rose-500/10" : "bg-transparent"
                              }`}
                            >
                              <div className="truncate pr-3 text-slate-100 font-medium">{row.keyword}</div>
                              <div className="text-slate-300 capitalize">
                                {row.category || 'unknown'}
                              </div>
                              <div className="text-slate-200">
                                {row.found_in_resume ? (
                                  <span className="text-emerald-400">✓ Found</span>
                                ) : (
                                  <span className="text-rose-400">✗ Missing</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <PriorityIndicator priority={priority as any} size="sm" />
                              </div>
                              <div className={danger ? "text-rose-200 font-medium" : "text-slate-200"}>
                                {Math.round(row.impact_score * 100)}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {analysis.keyword_gap.length > 15 ? (
                      <div className="mt-3 text-xs text-slate-400">
                        Showing top 15 keywords. Export CSV for full list with categorization.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">Experience Fit</h3>
                    <p className="text-xs text-slate-400">Required vs resume experience gap</p>
                  </div>
                  <div>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-950/50 ring-1 ring-slate-800/50 p-4">
                          <div className="text-xs text-slate-400">Required (JD)</div>
                          <div className="mt-1 text-xl font-semibold text-slate-50">
                            {analysis.experience_analysis.required_years ?? "—"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-950/50 ring-1 ring-slate-800/50 p-4">
                          <div className="text-xs text-slate-400">Resume</div>
                          <div className="mt-1 text-xl font-semibold text-slate-50">
                            {analysis.experience_analysis.resume_years ?? "—"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-950/50 ring-1 ring-slate-800/50 p-4">
                          <div className="text-xs text-slate-400">Gap</div>
                          <div className="mt-1 text-xl font-semibold text-slate-50">
                            {analysis.experience_analysis.gap ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-950/50 ring-1 ring-slate-800/50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="text-xs font-medium text-slate-300">Fit indicator</div>
                          <div className="text-xs text-slate-400">
                            {analysis.experience_analysis.required_years == null ||
                            analysis.experience_analysis.resume_years == null
                              ? "Not detected"
                              : (analysis.experience_analysis.gap ?? 0) <= 0
                                ? "Meets"
                                : "Gap"}
                          </div>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
                          <motion.div
                            className={`h-3 ${scoreToColor(breakdown?.experience_relevance ?? 0)}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${toPct(breakdown?.experience_relevance ?? 0)}%` }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-slate-100">Soft Skills Match</h3>
                    <p className="text-xs text-slate-400">Signal check for common soft skills</p>
                  </div>
                  <div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {analysis.soft_skills.matched.map((s) => (
                        <div
                          key={s}
                          className="flex items-center justify-between rounded-xl bg-slate-950/50 ring-1 ring-slate-800/50 p-4"
                        >
                          <div className="text-sm capitalize text-slate-100">{s}</div>
                          <span className="inline-flex items-center gap-2 text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" /> Matched
                          </span>
                        </div>
                      ))}
                      {analysis.soft_skills.missing.map((s) => (
                        <div
                          key={s}
                          className="flex items-center justify-between rounded-xl bg-slate-950/50 ring-1 ring-slate-800/50 p-4"
                        >
                          <div className="text-sm capitalize text-slate-100">{s}</div>
                          <span className="inline-flex items-center gap-2 text-amber-300">
                            <TriangleAlert className="h-4 w-4" /> Missing
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Impact Simulator */}
                {analysis?.keyword_gap && (
                  <div className="rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-slate-100">Score Impact Simulator</h3>
                      <p className="text-xs text-slate-400">
                        See how adding missing skills could improve your match score
                      </p>
                    </div>
                    <ImpactSimulator
                      missingSkills={analysis.keyword_gap
                        .filter(item => !item.found_in_resume)
                        .map(item => ({
                          skill: item.keyword,
                          category: item.category || 'unknown',
                          priority: item.priority as 'critical' | 'important' | 'nice_to_have',
                          currentImpact: 0,
                          potentialImpact: item.impact_score,
                          scoreIncrease: item.impact_score * 0.1 // Simplified calculation
                        }))}
                      currentScore={analysis.ats_score}
                      maxPossibleScore={1.0}
                    />
                  </div>
                )}

                {/* Smart Recommendations */}
                {analysis?.smart_recommendations && (
                  <div className="rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-slate-100">Smart Recommendations</h3>
                      <p className="text-xs text-slate-400">
                        Targeted, high-impact improvements to increase match quality
                      </p>
                    </div>
                    <SmartRecommendations 
                      recommendations={analysis.smart_recommendations.recommendations}
                      summary={analysis.smart_recommendations.summary}
                    />
                  </div>
                )}

                {/* Legacy AI Recommendations - Fallback */}
                {!analysis?.smart_recommendations && (
                  <div className="rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-slate-100">AI Improvement Suggestions</h3>
                      <p className="text-xs text-slate-400">
                        Targeted, high-impact improvements to increase match quality
                      </p>
                    </div>
                    <div>
                      <ul className="space-y-2 text-sm text-slate-100">
                        {analysis?.ai_recommendations.map((r) => (
                          <li key={r} className="flex gap-3">
                            <span className="mt-1 h-2 w-2 flex-none rounded-full bg-sky-400" />
                            <span className="leading-relaxed text-slate-200">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-900/30 p-5 ring-1 ring-slate-800/40 md:col-span-2 xl:col-span-3">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-100">Score Trend</h3>
                      <p className="text-xs text-slate-400">ATS score and similarity over recent runs</p>
                    </div>
                    {trend.length >= 2 && (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Current ATS</div>
                          <div className="text-lg font-semibold text-emerald-400">
                            {trend[trend.length - 1].ats}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Peak Score</div>
                          <div className="text-lg font-semibold text-sky-400">
                            {Math.max(...trend.map(t => t.ats))}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Trend</div>
                          <div className={`text-lg font-semibold ${
                            trend[trend.length - 1].ats > trend[0].ats 
                              ? 'text-emerald-400' 
                              : trend[trend.length - 1].ats < trend[0].ats 
                                ? 'text-rose-400' 
                                : 'text-slate-400'
                          }`}>
                            {trend[trend.length - 1].ats > trend[0].ats 
                              ? '↑' 
                              : trend[trend.length - 1].ats < trend[0].ats 
                                ? '↓' 
                                : '→'
                            } {Math.abs(trend[trend.length - 1].ats - trend[0].ats)}%
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    {trend.length < 2 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <div className="w-8 h-0.5 bg-slate-600 rounded-full"></div>
                        </div>
                        <p className="text-sm text-slate-400 text-center">Run more analyses to see trends.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trend} margin={{ left: 6, right: 6, top: 10, bottom: 40 }}>
                              <XAxis 
                                dataKey="created_at" 
                                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                                axisLine={{ stroke: "#475569" }}
                              />
                              <YAxis 
                                tick={{ fill: "#94a3b8", fontSize: 12 }} 
                                domain={[0, 100]}
                                axisLine={{ stroke: "#475569" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(2,6,23,0.9)",
                                  border: "1px solid rgba(148,163,184,0.2)",
                                  borderRadius: 12,
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="ats"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: "#10b981", r: 4 }}
                                activeDot={{ r: 6 }}
                                name="ATS %"
                              />
                              <Line
                                type="monotone"
                                dataKey="sim"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                dot={{ fill: "#38bdf8", r: 4 }}
                                activeDot={{ r: 6 }}
                                name="Skill Match %"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Compact Legend */}
                        <div className="flex justify-center gap-6 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-400">ATS Score</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                            <span className="text-xs text-slate-400">Skill Match</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
