export interface AnalysisRunRequest {
  resume_id: string;
  job_description_id: string;
  force?: boolean;
}

export interface AnalysisResult {
  id: string;
  user_id: number;
  resume_id: string;
  job_description_id: string;
  similarity_score: number;
  ats_score: number;
  missing_skills: Record<string, unknown> | null;
  details: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
}

export interface AnalysisCharts {
  ats_score: number;
  similarity_score: number;
  missing_skills: string[];
  matched_skills: string[];
  skill_gap: { skill: string; present: boolean }[];
  skill_distribution: { label: string; value: number }[];
}

export interface ScoreBreakdown {
  formatting: number;
  keyword_optimization: number;
  experience_relevance: number;
  project_relevance: number;
  weighted_skill_score: number;
  category_scores: Record<string, number>;
  confidence_score: number;
  preferredSkillImpact: number;
  bonusSkillDifferentiator: number;
}

export interface KeywordGapItem {
  keyword: string;
  found_in_resume: boolean;
  importance: "High" | "Medium" | "Low" | string;
  impact_score: number;
  category: string;
  priority: "critical" | "important" | "nice_to_have";
}

export interface ExperienceAnalysis {
  required_years: number | null;
  resume_years: number | null;
  gap: number | null;
}

export interface ProjectAnalysisItem {
  project_name: string;
  relevance_score: number;
  matched_technologies: string[];
}

export interface SoftSkills {
  matched: string[];
  missing: string[];
}

export interface AnalysisDashboardResponse {
  result: AnalysisResult;
  charts: AnalysisCharts;

  ats_score: number;
  skill_match: number;
  breakdown: ScoreBreakdown;

  resume_skills: string[];
  job_skills: string[];
  matched_skills: string[];
  missing_skills: string[];
  extra_skills: string[];

  categorized_skills: Record<string, string[]>;
  weighted_scores: Record<string, number>;

  keyword_gap: KeywordGapItem[];
  experience_analysis: ExperienceAnalysis;
  project_analysis: ProjectAnalysisItem[];
  soft_skills: SoftSkills;
  ai_recommendations: string[];
  smart_recommendations: {
    recommendations: Array<{
      type: string;
      priority: string;
      title: string;
      description: string;
      actionable: string;
      impact_score: number;
    }>;
    summary: {
      critical_issues: number;
      high_priority_issues: number;
      medium_priority_issues: number;
      low_priority_issues: number;
      total_impact_score: number;
    };
  };
}

