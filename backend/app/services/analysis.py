from __future__ import annotations

from collections.abc import Sequence
import re
from typing import Any
from uuid import UUID
import uuid

import numpy as np
from fastapi import HTTPException, status
from sqlalchemy import and_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.activity_log import ActivityLog
from ..models.analysis import AnalysisResult
from ..models.job import JobDescription
from ..models.resume import Resume
from ..models.skill import JobSkill, ResumeSkill, Skill
from ..models.user import User
from ..schemas.analysis import (
    AnalysisDashboardResponse,
    AnalysisResultRead,
)
from .ai.embeddings import get_default_embedding_backend
from .ai.scoring import (
    compute_ats_score,
    compute_missing_skills,
    compute_similarity_score,
)
from .ai.skills import get_skill_extractor


def _normalize_skill(name: str) -> str:
    return (name or "").strip().lower()


_WORD_NUMBERS: dict[str, int] = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
}


def _extract_years(text: str) -> float | None:
    t = (text or "").lower()
    m = re.search(r"(\d+(?:\.\d+)?)\s*\+?\s*years?", t)
    if m:
        try:
            return float(m.group(1))
        except Exception:
            return None

    m2 = re.search(r"\b(" + "|".join(_WORD_NUMBERS.keys()) + r")\b\s+years?", t)
    if m2:
        return float(_WORD_NUMBERS[m2.group(1)])

    m3 = re.search(r"over\s+(\d+)\s+years?", t)
    if m3:
        try:
            return float(m3.group(1))
        except Exception:
            return None

    return None


async def _get_resume_for_user(
    db: AsyncSession,
    *,
    user: User,
    resume_id: UUID,
) -> Resume:
    stmt = select(Resume).where(and_(Resume.id == resume_id, Resume.user_id == user.id))
    result = await db.execute(stmt)
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    return resume


async def _get_job_description_for_user(
    db: AsyncSession,
    *,
    user: User,
    job_description_id: UUID,
) -> JobDescription:
    stmt = select(JobDescription).where(
        JobDescription.id == job_description_id,
        JobDescription.user_id == user.id,
    )
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job description not found",
        )
    return job


async def _find_existing_analysis(
    db: AsyncSession,
    *,
    user: User,
    resume_id: UUID,
    job_description_id: UUID,
) -> AnalysisResult | None:
    stmt = select(AnalysisResult).where(
        AnalysisResult.user_id == user.id,
        AnalysisResult.resume_id == resume_id,
        AnalysisResult.job_description_id == job_description_id,
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def _upsert_skills_for_texts(
    db: AsyncSession,
    *,
    resume: Resume,
    resume_text: str,
    job: JobDescription,
    job_text: str,
) -> tuple[list[str], list[str]]:
    """
    Extract skills for resume and job text, ensure Skill records exist,
    and create join rows in resume_skills and job_skills.
    Returns (resume_skill_names, job_skill_names).
    """
    extractor = get_skill_extractor()

    resume_skills_names = extractor.extract_skills(resume_text)
    job_skills_names = extractor.extract_skills(job_text)

    # Normalize skill names
    def normalize(names: Sequence[str]) -> list[str]:
        return sorted({_normalize_skill(n) for n in names if _normalize_skill(n)})

    resume_norm = normalize(resume_skills_names)
    job_norm = normalize(job_skills_names)

    # Early exit if nothing detected
    if not resume_norm and not job_norm:
        return [], []

    # Upsert Skill records in a concurrency-safe way.
    all_names = sorted(set(resume_norm) | set(job_norm))
    if all_names:
        stmt = (
            insert(Skill)
            .values([{"name": name} for name in all_names])
            .on_conflict_do_nothing(index_elements=[Skill.name])
        )
        await db.execute(stmt)

    # Re-load to get ids for all names (whether pre-existing or newly inserted).
    existing_stmt = select(Skill).where(Skill.name.in_(all_names))
    existing_result = await db.execute(existing_stmt)
    skill_by_name: dict[str, Skill] = {s.name: s for s in existing_result.scalars().all()}

    # Join table inserts must be idempotent; re-running analysis should not crash.
    if resume_norm:
        resume_rows = [
            {
                "resume_id": resume.id,
                "skill_id": skill_by_name[name].id,
            }
            for name in resume_norm
            if name in skill_by_name
        ]
        if resume_rows:
            stmt = (
                insert(ResumeSkill)
                .values(resume_rows)
                .on_conflict_do_nothing(constraint="uq_resume_skill")
            )
            await db.execute(stmt)

    if job_norm:
        job_rows = [
            {
                "job_description_id": job.id,
                "skill_id": skill_by_name[name].id,
            }
            for name in job_norm
            if name in skill_by_name
        ]
        if job_rows:
            stmt = (
                insert(JobSkill)
                .values(job_rows)
                .on_conflict_do_nothing(constraint="uq_job_skill")
            )
            await db.execute(stmt)

    return resume_norm, job_norm


async def run_analysis(
    db: AsyncSession,
    *,
    user: User,
    resume_id: UUID,
    job_description_id: UUID,
    force: bool = False,
) -> AnalysisDashboardResponse:
    """
    Orchestrate full AI analysis pipeline and return dashboard-optimized payload.
    """
    user_id = user.id
    # Idempotency: check for existing result
    if not force:
        existing = await _find_existing_analysis(
            db,
            user=user,
            resume_id=resume_id,
            job_description_id=job_description_id,
        )
        if existing:
            if (
                existing.user_id != user.id
                or existing.resume_id != resume_id
                or existing.job_description_id != job_description_id
            ):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Cached analysis mismatch",
                )
            return _build_dashboard_response(existing)

    resume = await _get_resume_for_user(
        db,
        user=user,
        resume_id=resume_id,
    )
    job = await _get_job_description_for_user(
        db,
        user=user,
        job_description_id=job_description_id,
    )

    # Use extracted_text as the canonical resume text for embeddings.
    resume_text = resume.extracted_text or ""
    job_text = job.description_text or ""

    print("Resume ID:", str(resume_id))
    print("Resume text first 200 chars:", (resume_text or "")[:200])
    print("JD ID:", str(job_description_id))

    if not resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is empty. Please re-upload a text-based PDF.",
        )
    if not job_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is empty.",
        )

    # Extract & upsert skills
    resume_skill_names, job_skill_names = await _upsert_skills_for_texts(
        db,
        resume=resume,
        resume_text=resume_text,
        job=job,
        job_text=job_text,
    )

    # Embeddings & similarity
    backend = get_default_embedding_backend()
    try:
        vectors = backend.embed([resume_text, job_text])
    except Exception as e:
        print("Embedding error:", repr(e))
        vectors = None

    if not vectors:
        similarity_score = 0.0
    else:
        resume_vec = np.asarray(vectors[0], dtype=float)
        job_vec = np.asarray(vectors[1], dtype=float)
        similarity_score = compute_similarity_score(resume_vec, job_vec)

    print("Resume skills (normalized):", resume_skill_names)
    print("JD skills (normalized):", job_skill_names)
    print("Similarity score:", float(similarity_score))

    def canonicalize_skill(name: str) -> str:
        n = _normalize_skill(name)
        aliases = {
            "react.js": "react",
            "reactjs": "react",
            "nodejs": "node.js",
            "node": "node.js",
            "expressjs": "express",
            "nextjs": "next.js",
            "next": "next.js",
            "postgres": "postgresql",
            "postgre": "postgresql",
            "js": "javascript",
            "ts": "typescript",
        }
        return aliases.get(n, n)

    resume_set = {canonicalize_skill(s) for s in resume_skill_names}
    job_set = {canonicalize_skill(s) for s in job_skill_names}

    matched_skills = sorted(resume_set & job_set)
    missing_skills = sorted(job_set - resume_set)
    extra_skills = sorted(resume_set - job_set)

    fullstack_keywords = {"react", "react.js", "node.js", "node", "frontend"}
    fullstack_role = any(k in job_text.lower() for k in fullstack_keywords)

    resume_len = len(resume_text or "")
    job_len = len(job_text or "")
    has_bullets = any(ch in ("•", "-", "*") for ch in (resume_text or ""))
    formatting_score = min(1.0, max(0.0, (0.35 if has_bullets else 0.15) + min(0.65, resume_len / 6000)))
    coverage = 0.0 if not job_set else (len(matched_skills) / max(1, len(job_set)))
    keyword_optimization = float(min(1.0, max(0.0, coverage)))

    def _weight_for_skill(skill: str) -> float:
        s = canonicalize_skill(skill)
        t = job_text.lower()
        if not s:
            return 0.0
        if re.search(r"\\b(must have|required|mandatory)\\b", t) and s in t:
            return 2.0
        if re.search(r"\\b(requirements|qualification|responsibilit)\\w*\\b", t) and s in t:
            return 1.5
        return 1.0

    weighted_total = 0.0
    weighted_matched = 0.0
    critical_missing: list[str] = []
    for s in sorted(job_set):
        w = float(_weight_for_skill(s))
        if w <= 0:
            continue
        weighted_total += w
        if s in resume_set:
            weighted_matched += w
        else:
            if w >= 2.0:
                critical_missing.append(s)

    weighted_coverage = 0.0 if weighted_total <= 0 else (weighted_matched / weighted_total)
    print("Weighted coverage:", float(weighted_coverage))

    required_years = _extract_years(job_text)
    resume_years = _extract_years(resume_text)
    gap = None
    exp_match = 0.0
    if required_years is not None and resume_years is not None:
        gap = float(required_years - resume_years)
        exp_match = 1.0 if gap <= 0 else max(0.0, 1.0 - (gap / max(1.0, required_years)))

    experience_relevance = float(min(1.0, max(0.0, 0.2 + 0.8 * exp_match)))
    project_relevance = float(min(1.0, max(0.0, 0.2 + 0.8 * similarity_score)))

    # If we failed to extract skills, similarity should not dominate the score.
    if not resume_set or not job_set:
        similarity_score = 0.0

    critical_penalty = 0.0
    if critical_missing:
        critical_penalty = min(0.25, 0.05 * float(len(critical_missing)))

    if fullstack_role:
        frontend_missing = [
            s for s in missing_skills if canonicalize_skill(s) in {"react", "node.js"}
        ]
        if frontend_missing:
            critical_penalty += 0.1

    print("Critical missing:", critical_missing)
    print("Critical penalty:", float(critical_penalty))

    ats_score = float(
        max(
            0.0,
            min(
                1.0,
                (
                    0.25 * similarity_score
                    + 0.50 * weighted_coverage
                    + 0.15 * (exp_match if required_years is not None else 0.5)
                    + 0.10 * formatting_score
                )
                - critical_penalty,
            ),
        )
    )

    # Structured details JSON for analytics
    details: dict[str, Any] = {
        "resume_skill_count": len(resume_skill_names),
        "job_skill_count": len(job_skill_names),
        "resume_skills": sorted(resume_set),
        "job_skills": sorted(job_set),
        "resume_text": resume_text,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "extra_skills": extra_skills,
        "critical_missing_skills": critical_missing,
        "weighted_coverage": float(weighted_coverage),
        "breakdown": {
            "formatting": formatting_score,
            "keyword_optimization": keyword_optimization,
            "experience_relevance": experience_relevance,
            "project_relevance": project_relevance,
        },
        "experience": {
            "required_years": required_years,
            "resume_years": resume_years,
            "gap": gap,
        },
    }

    # Persist analysis + activity log in a single transaction
    analysis = AnalysisResult(
        id=uuid.uuid4(),
        user_id=user.id,
        resume_id=resume.id,
        job_description_id=job.id,
        similarity_score=similarity_score,
        ats_score=ats_score,
        missing_skills={"items": missing_skills},
        details=details,
    )
    db.add(analysis)

    # Ensure analysis.id is available for the ActivityLog foreign reference.
    await db.flush()

    log = ActivityLog(
        user_id=user_id,
        action="analysis_run",
        entity_type="analysis_result",
        entity_id=analysis.id,
        extra_data={
            "resume_id": str(resume.id),
            "job_description_id": str(job.id),
            "ats_score": ats_score,
            "similarity_score": similarity_score,
        },
    )
    db.add(log)

    try:
        await db.commit()
    except IntegrityError:
        # Handle race where another request created the same analysis
        await db.rollback()
        existing = await _find_existing_analysis(
            db,
            user=user,
            resume_id=resume_id,
            job_description_id=job_description_id,
        )
        if existing:
            return _build_dashboard_response(existing)
        raise

    await db.refresh(analysis)
    return _build_dashboard_response(analysis)


async def list_analyses_for_user(
    db: AsyncSession,
    *,
    user: User,
) -> list[AnalysisResult]:
    stmt = (
        select(AnalysisResult)
        .where(AnalysisResult.user_id == user.id)
        .order_by(AnalysisResult.created_at.asc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


def _build_dashboard_response(analysis: AnalysisResult) -> AnalysisDashboardResponse:
    details = analysis.details or {}
    resume_skills = details.get("resume_skills", []) or []
    job_skills = details.get("job_skills", []) or []
    matched_skills = details.get("matched_skills", []) or []
    missing_skills = details.get("missing_skills", []) or []
    extra_skills = details.get("extra_skills", []) or []
    breakdown = details.get("breakdown", {}) or {}

    if not extra_skills and resume_skills and job_skills:
        extra_skills = sorted(set(resume_skills) - set(job_skills))

    job_skills_set = {_normalize_skill(s) for s in job_skills}
    resume_skills_set = {_normalize_skill(s) for s in resume_skills}
    keyword_gap: list[dict[str, Any]] = []
    for i, kw in enumerate(job_skills):
        found = _normalize_skill(kw) in resume_skills_set
        if i < 5:
            importance = "High"
        elif i < 12:
            importance = "Medium"
        else:
            importance = "Low"
        impact = (1.0 if importance == "High" else 0.6 if importance == "Medium" else 0.3) * (0.0 if found else 1.0)
        keyword_gap.append(
            {
                "keyword": kw,
                "found_in_resume": found,
                "importance": importance,
                "impact_score": float(impact),
            }
        )

    exp = details.get("experience", {}) or {}
    experience_analysis = {
        "required_years": exp.get("required_years"),
        "resume_years": exp.get("resume_years"),
        "gap": exp.get("gap"),
    }

    project_analysis: list[dict[str, Any]] = []

    soft_dict = [
        "communication",
        "leadership",
        "teamwork",
        "problem solving",
        "collaboration",
    ]
    resume_blob = (details.get("resume_text", "") or "").lower()
    if not resume_blob:
        resume_blob = " ".join(resume_skills).lower()
    soft_matched = [s for s in soft_dict if s in resume_blob]
    soft_missing = [s for s in soft_dict if s not in resume_blob]
    soft_skills = {"matched": soft_matched, "missing": soft_missing}

    recommendations: list[str] = []
    if missing_skills:
        recommendations.append(
            "Add missing high-signal skills from the job description to your resume, especially those shown as missing."
        )
    if float(breakdown.get("formatting", 0.0) or 0.0) < 0.6:
        recommendations.append(
            "Improve resume formatting: use consistent headings, bullet points, and concise impact-focused statements."
        )
    if float(breakdown.get("keyword_optimization", 0.0) or 0.0) < 0.7:
        recommendations.append(
            "Optimize keywords by aligning your experience bullets with the same phrasing used in the job description."
        )
    if not recommendations:
        recommendations.append("Your resume is already well aligned. Focus on adding measurable outcomes and metrics.")

    skill_match = float(analysis.similarity_score)

    # Simple structures ready for Recharts on the frontend
    skill_gap = [
        {"skill": name, "present": True} for name in matched_skills
    ] + [
        {"skill": name, "present": False} for name in missing_skills
    ]

    skill_distribution = [
        {"label": "Matched", "value": len(matched_skills)},
        {"label": "Missing", "value": len(missing_skills)},
    ]

    result_schema = AnalysisResultRead.model_validate(analysis)

    charts = {
        "ats_score": analysis.ats_score,
        "similarity_score": analysis.similarity_score,
        "missing_skills": missing_skills,
        "matched_skills": matched_skills,
        "skill_gap": skill_gap,
        "skill_distribution": skill_distribution,
    }

    return AnalysisDashboardResponse(
        result=result_schema,
        charts=charts,  # type: ignore[arg-type]
        ats_score=float(analysis.ats_score),
        skill_match=skill_match,
        breakdown={
            "formatting": float(breakdown.get("formatting", 0.0) or 0.0),
            "keyword_optimization": float(breakdown.get("keyword_optimization", 0.0) or 0.0),
            "experience_relevance": float(breakdown.get("experience_relevance", 0.0) or 0.0),
            "project_relevance": float(breakdown.get("project_relevance", 0.0) or 0.0),
        },
        resume_skills=list(resume_skills),
        job_skills=list(job_skills),
        matched_skills=list(matched_skills),
        missing_skills=list(missing_skills),
        extra_skills=list(extra_skills),
        keyword_gap=keyword_gap,
        experience_analysis=experience_analysis,
        project_analysis=project_analysis,
        soft_skills=soft_skills,
        ai_recommendations=recommendations,
    )

