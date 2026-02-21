from __future__ import annotations

from collections.abc import Sequence

import numpy as np

from .embeddings import cosine_similarity


def compute_similarity_score(
    resume_embedding: np.ndarray,
    job_embedding: np.ndarray,
) -> float:
    """
    Compute cosine similarity in [0, 1] for stable comparison.
    """
    raw = cosine_similarity(resume_embedding, job_embedding)
    # cosine is [-1, 1]; clamp and shift into [0, 1]
    return float(max(0.0, (raw + 1.0) / 2.0))


def compute_ats_score(
    similarity_score: float,
    matched_skills: Sequence[str],
    required_skills: Sequence[str],
) -> float:
    """
    Placeholder ATS-style scoring function.

    Combines semantic similarity with skill coverage in a weighted way.
    """
    if not required_skills:
        coverage = 1.0
    else:
        coverage = len(set(matched_skills)) / len(set(required_skills))

    # Weighted combination; these weights can be tuned
    score = 0.6 * similarity_score + 0.4 * coverage
    return float(max(0.0, min(score, 1.0)))


def compute_missing_skills(
    resume_skills: Sequence[str],
    required_skills: Sequence[str],
) -> list[str]:
    resume_set = {s.lower() for s in resume_skills}
    req_set = {s.lower() for s in required_skills}
    missing = sorted(req_set - resume_set)
    return list(missing)

