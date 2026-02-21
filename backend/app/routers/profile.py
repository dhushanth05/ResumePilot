from uuid import UUID

from fastapi import APIRouter, status

from ..core.deps import DBSessionDep, UserDep
from ..schemas.profile import FullProfileRead, FullProfileUpdate, ProfileGenerateRequest
from ..services import profile as profile_service

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("/me", response_model=FullProfileRead)
async def get_my_profile(
    db: DBSessionDep,
    current_user: UserDep,
) -> FullProfileRead:
    return await profile_service.get_full_profile(db, user=current_user)


@router.put("/me", response_model=FullProfileRead)
async def update_my_profile(
    payload: FullProfileUpdate,
    db: DBSessionDep,
    current_user: UserDep,
) -> FullProfileRead:
    return await profile_service.update_full_profile(
        db,
        user=current_user,
        payload=payload,
    )


@router.post("/generate", response_model=FullProfileRead, status_code=status.HTTP_201_CREATED)
async def generate_profile(
    payload: ProfileGenerateRequest,
    db: DBSessionDep,
    current_user: UserDep,
) -> FullProfileRead:
    resume_id = UUID(payload.resume_id)
    return await profile_service.generate_profile_from_resume(
        db,
        user=current_user,
        resume_id=resume_id,
        overwrite=payload.overwrite,
    )
