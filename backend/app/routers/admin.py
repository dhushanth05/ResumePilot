import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.database import get_db
from ..models.analysis import AnalysisResult
from ..models.job import JobDescription
from ..models.resume import Resume
from ..models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin_key(x_admin_key: str | None = Header(default=None, alias="X-Admin-Key")) -> None:
    expected = settings.admin_api_key
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Admin API key not configured",
        )

    if not x_admin_key or not secrets.compare_digest(x_admin_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized",
        )


@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_admin_key),
) -> dict:
    total_users = await db.scalar(select(func.count()).select_from(User))
    total_resumes = await db.scalar(select(func.count()).select_from(Resume))
    total_jobs = await db.scalar(select(func.count()).select_from(JobDescription))
    total_analyses = await db.scalar(select(func.count()).select_from(AnalysisResult))

    return {
        "totalUsers": int(total_users or 0),
        "totalResumes": int(total_resumes or 0),
        "totalJobs": int(total_jobs or 0),
        "totalAnalyses": int(total_analyses or 0),
    }


@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_admin_key),
) -> list[dict]:
    q = (
        select(
            User.id,
            User.email,
            User.created_at,
            User.is_active,
            func.count(Resume.id).label("resumes_count"),
        )
        .outerjoin(Resume, Resume.user_id == User.id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
    )

    result = await db.execute(q)

    def dt(v: datetime) -> str:
        return v.isoformat()

    return [
        {
            "id": row.id,
            "email": row.email,
            "created_at": dt(row.created_at),
            "resumes_count": int(row.resumes_count or 0),
            "is_active": bool(row.is_active),
        }
        for row in result.all()
    ]


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_admin_key),
) -> dict:
    existing = await db.scalar(select(func.count()).select_from(User).where(User.id == user_id))
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    return {"ok": True}


class UserTogglePayload(BaseModel):
    is_active: bool


@router.patch("/users/{user_id}")
async def toggle_user_active(
    user_id: int,
    payload: UserTogglePayload,
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_admin_key),
) -> dict:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = payload.is_active
    await db.commit()
    await db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
        "is_active": bool(user.is_active),
    }


@router.get("/resumes")
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    _: None = Depends(require_admin_key),
) -> list[dict]:
    q = (
        select(
            Resume.id,
            Resume.title,
            Resume.created_at,
            User.email.label("owner_email"),
        )
        .join(User, User.id == Resume.user_id)
        .group_by(Resume.id, User.email)
        .order_by(Resume.created_at.desc())
    )

    result = await db.execute(q)

    def dt(v: datetime) -> str:
        return v.isoformat()

    return [
        {
            "id": str(row.id),
            "title": row.title,
            "owner_email": row.owner_email,
            "created_at": dt(row.created_at),
        }
        for row in result.all()
    ]
