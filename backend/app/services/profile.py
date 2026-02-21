import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.profile import (
    UserEducation,
    UserExperience,
    UserProfile,
    UserProject,
    UserSkill,
)
from app.models.user import User
from app.schemas.profile import (
    FullProfileRead,
    FullProfileUpdate,
    ProfileRead,
    SkillRead,
    EducationRead,
    ExperienceRead,
    ProjectRead,
)

logger = logging.getLogger(__name__)


# -------------------------
# GET FULL PROFILE
# -------------------------
async def get_full_profile(
    db: AsyncSession,
    *,
    user: User,
) -> FullProfileRead:
    stmt = (
        select(User)
        .where(User.id == user.id)
        .options(
            selectinload(User.profile),
            selectinload(User.skills),
            selectinload(User.education),
            selectinload(User.experience),
            selectinload(User.projects),
        )
    )

    result = await db.execute(stmt)
    u = result.scalar_one_or_none()

    if not u:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    profile = u.profile

    return FullProfileRead(
        profile=ProfileRead.model_validate(profile) if profile else None,
        skills=[SkillRead.model_validate(s) for s in u.skills],
        education=[EducationRead.model_validate(e) for e in u.education],
        experience=[ExperienceRead.model_validate(e) for e in u.experience],
        projects=[ProjectRead.model_validate(p) for p in u.projects],
    )


# -------------------------
# CREATE / UPDATE PROFILE
# -------------------------
async def update_full_profile(
    db: AsyncSession,
    *,
    user: User,
    payload: FullProfileUpdate,
) -> FullProfileRead:

    # ---------- PROFILE ----------
    if payload.profile is not None:
        stmt = select(UserProfile).where(UserProfile.user_id == user.id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()

        if profile:
            if payload.profile.full_name is not None:
                profile.full_name = payload.profile.full_name
            if payload.profile.email is not None:
                profile.email = payload.profile.email
            if payload.profile.phone is not None:
                profile.phone = payload.profile.phone
            if payload.profile.summary is not None:
                profile.summary = payload.profile.summary
        else:
            profile = UserProfile(
                user_id=user.id,
                full_name=payload.profile.full_name,
                email=payload.profile.email,
                phone=payload.profile.phone,
                summary=payload.profile.summary,
            )
            db.add(profile)
            await db.flush()

    # ---------- SKILLS ----------
    if payload.skills is not None:
        existing = (
            await db.execute(select(UserSkill).where(UserSkill.user_id == user.id))
        ).scalars().all()

        for s in existing:
            await db.delete(s)

        for s in payload.skills:
            db.add(
                UserSkill(
                    user_id=user.id,
                    skill_name=s.skill_name,
                    category=s.category,
                )
            )

    # ---------- EDUCATION ----------
    if payload.education is not None:
        existing = (
            await db.execute(select(UserEducation).where(UserEducation.user_id == user.id))
        ).scalars().all()

        for e in existing:
            await db.delete(e)

        for e in payload.education:
            db.add(
                UserEducation(
                    user_id=user.id,
                    institution=e.institution,
                    degree=e.degree,
                    field_of_study=e.field_of_study,
                    start_date=e.start_date,
                    end_date=e.end_date,
                    description=e.description,
                )
            )

    # ---------- EXPERIENCE ----------
    if payload.experience is not None:
        existing = (
            await db.execute(select(UserExperience).where(UserExperience.user_id == user.id))
        ).scalars().all()

        for e in existing:
            await db.delete(e)

        for e in payload.experience:
            db.add(
                UserExperience(
                    user_id=user.id,
                    company=e.company,
                    job_title=e.job_title,
                    start_date=e.start_date,
                    end_date=e.end_date,
                    description=e.description,
                )
            )

    # ---------- PROJECTS ----------
    if payload.projects is not None:
        existing = (
            await db.execute(select(UserProject).where(UserProject.user_id == user.id))
        ).scalars().all()

        for p in existing:
            await db.delete(p)

        for p in payload.projects:
            tech_str = ",".join(p.technologies or []) if p.technologies else None

            db.add(
                UserProject(
                    user_id=user.id,
                    project_name=p.project_name,
                    description=p.description,
                    technologies=tech_str,
                )
            )

    await db.commit()

    return await get_full_profile(db, user=user)
