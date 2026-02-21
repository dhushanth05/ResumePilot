from fastapi import APIRouter

from ..core.deps import DBSessionDep, UserDep
from ..schemas.analysis import AnalysisDashboardResponse, AnalysisResultRead, AnalysisRunRequest
from ..services.analysis import list_analyses_for_user, run_analysis

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post(
    "/run",
    response_model=AnalysisDashboardResponse,
)
async def run_analysis_endpoint(
    payload: AnalysisRunRequest,
    db: DBSessionDep,
    current_user: UserDep,
) -> AnalysisDashboardResponse:
    """
    Trigger AI analysis for a resume and job description pair.

    This endpoint is idempotent by default: if an analysis for the same
    resume_id + job_description_id already exists, it will be
    returned instead of recomputed, unless `force=true` is provided.
    """
    return await run_analysis(
        db,
        user=current_user,
        resume_id=payload.resume_id,
        job_description_id=payload.job_description_id,
        force=payload.force,
    )


@router.get(
    "/history",
    response_model=list[AnalysisResultRead],
)
async def get_analysis_history(
    db: DBSessionDep,
    current_user: UserDep,
) -> list[AnalysisResultRead]:
    """
    Return all analysis runs for the current user, ordered by created_at.
    This powers trend charts on the dashboard.
    """
    items = await list_analyses_for_user(db, user=current_user)
    return [AnalysisResultRead.model_validate(a) for a in items]

