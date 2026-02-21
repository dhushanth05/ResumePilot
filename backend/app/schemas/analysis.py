from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AnalysisRunRequest(BaseModel):
    resume_id: UUID
    job_description_id: UUID
    force: bool = False


class AnalysisResultRead(BaseModel):
    id: UUID
    user_id: int
    resume_id: UUID
    job_description_id: UUID
    similarity_score: float
    ats_score: float
    missing_skills: dict | None
    details: dict | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisCharts(BaseModel):
    ats_score: float
    similarity_score: float
    missing_skills: list[str]
    matched_skills: list[str]
    skill_gap: list[dict]
    skill_distribution: list[dict]


class ScoreBreakdown(BaseModel):
    formatting: float
    keyword_optimization: float
    experience_relevance: float
    project_relevance: float


class KeywordGapItem(BaseModel):
    keyword: str
    found_in_resume: bool
    importance: str
    impact_score: float


class ExperienceAnalysis(BaseModel):
    required_years: float | None = None
    resume_years: float | None = None
    gap: float | None = None


class ProjectAnalysisItem(BaseModel):
    project_name: str
    relevance_score: float
    matched_technologies: list[str]


class SoftSkills(BaseModel):
    matched: list[str]
    missing: list[str]


class AnalysisDashboardResponse(BaseModel):
    result: AnalysisResultRead
    charts: AnalysisCharts

    ats_score: float
    skill_match: float
    breakdown: ScoreBreakdown

    resume_skills: list[str]
    job_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    extra_skills: list[str]

    keyword_gap: list[KeywordGapItem]
    experience_analysis: ExperienceAnalysis
    project_analysis: list[ProjectAnalysisItem]
    soft_skills: SoftSkills
    ai_recommendations: list[str]

