from pathlib import Path
from uuid import UUID

import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.resume import Resume
from ..models.user import User
from ..schemas.resume import ResumeCreate
from ..utils.storage import BASE_DIR, save_resume_file
from .ai.pdf_parser import LocalPDFParser

logger = logging.getLogger(__name__)


async def create_resume(
    db: AsyncSession,
    *,
    user: User,
    data: ResumeCreate,
) -> Resume:
    resume = Resume(user_id=user.id, title=data.title, file_path="", extracted_text=None)
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    logger.info("Created resume id=%s user_id=%s title=%s", str(resume.id), user.id, resume.title)
    return resume


async def list_resumes_for_user(
    db: AsyncSession,
    *,
    user: User,
) -> list[Resume]:
    stmt = (
        select(Resume)
        .where(Resume.user_id == user.id)
        .order_by(Resume.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_resume_for_user(
    db: AsyncSession,
    *,
    user: User,
    resume_id: UUID,
) -> Resume:
    stmt = select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
    result = await db.execute(stmt)
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )
    return resume


async def upload_resume_file(
    db: AsyncSession,
    *,
    user: User,
    file_bytes: bytes,
    filename: str,
    title: str | None = None,
    resume_id: UUID | None = None,
) -> Resume:
    """
    High-level workflow:
    - Each upload is treated as an independent Resume.
    - Save the file to disk.
    - Extract text from PDF.
    - Persist file_path + extracted_text on Resume.
    """
    parser = LocalPDFParser()

    resume = Resume(
        user_id=user.id,
        title=title or filename,
        file_path="",
        extracted_text=None,
    )
    db.add(resume)
    await db.flush()
    logger.info(
        "Upload started resume_id=%s user_id=%s filename=%s",
        str(resume.id),
        user.id,
        filename,
    )

    # Save file
    storage_path = save_resume_file(
        user_id=user.id,
        resume_id=str(resume.id),
        filename=filename,
        content=file_bytes,
    )

    # Extract text
    extracted_text = await parser.extract_text(file_bytes)

    snippet = (extracted_text or "").strip().replace("\n", " ")[:300]
    logger.info("Extracted resume text length=%s snippet=%s", len(extracted_text or ""), snippet)
    if not (extracted_text or "").strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to extract text from the uploaded PDF. Please upload a text-based PDF.",
        )

    resume.file_path = storage_path
    resume.extracted_text = extracted_text

    await db.commit()
    await db.refresh(resume)

    logger.info(
        "Upload committed resume_id=%s user_id=%s file_path=%s extracted_text_len=%s",
        str(resume.id),
        user.id,
        resume.file_path,
        len(resume.extracted_text or ""),
    )

    return resume


async def delete_resume_for_user(
    db: AsyncSession,
    *,
    user: User,
    resume_id: UUID,
) -> None:
    resume = await get_resume_for_user(db, user=user, resume_id=resume_id)
    await db.delete(resume)
    await db.commit()
    if resume.file_path:
        try:
            full_path = BASE_DIR / resume.file_path
            if full_path.is_file():
                full_path.unlink()
            parent = full_path.parent
            if parent.exists() and not any(parent.iterdir()):
                parent.rmdir()
        except OSError:
            pass


def get_resume_file_path(resume: Resume) -> Path | None:
    if not resume.file_path:
        return None
    full = BASE_DIR / resume.file_path
    return full if full.is_file() else None

