import os
from uuid import UUID

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from ..core.deps import DBSessionDep, UserDep
from ..schemas.resume import (
    ResumeCreate,
    ResumeListItemRead,
    ResumeRead,
)
from ..services import resumes as resume_service

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.post(
    "",
    response_model=ResumeRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_resume(
    payload: ResumeCreate,
    db: DBSessionDep,
    current_user: UserDep,
) -> ResumeRead:
    resume = await resume_service.create_resume(db, user=current_user, data=payload)
    return ResumeRead.model_validate(resume)


@router.get("", response_model=list[ResumeListItemRead])
async def list_resumes(
    db: DBSessionDep,
    current_user: UserDep,
) -> list[ResumeListItemRead]:
    items = await resume_service.list_resumes_for_user(db, user=current_user)
    return [
        ResumeListItemRead(
            id=r.id,
            title=r.title,
            filename=os.path.basename(r.file_path or ""),
            created_at=r.created_at,
        )
        for r in items
    ]


@router.get("/{resume_id}", response_model=ResumeRead)
async def get_resume(
    resume_id: UUID,
    db: DBSessionDep,
    current_user: UserDep,
) -> ResumeRead:
    resume = await resume_service.get_resume_for_user(
        db, user=current_user, resume_id=resume_id
    )
    return ResumeRead.model_validate(resume)


@router.get("/{resume_id}/file")
async def get_resume_file(
    resume_id: UUID,
    db: DBSessionDep,
    current_user: UserDep,
):
    """Stream the resume PDF for view or download."""
    resume = await resume_service.get_resume_for_user(
        db, user=current_user, resume_id=resume_id
    )
    path = resume_service.get_resume_file_path(resume)
    if not path:
        raise HTTPException(status_code=404, detail="File not found")
    filename = path.name
    return FileResponse(
        path,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f'inline; filename="{filename}"'},
    )


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: UUID,
    db: DBSessionDep,
    current_user: UserDep,
) -> None:
    await resume_service.delete_resume_for_user(
        db, user=current_user, resume_id=resume_id
    )


@router.post(
    "/upload",
    response_model=ResumeRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    file: UploadFile = File(...),
    title: str | None = Form(None),
    db: DBSessionDep = None,
    current_user: UserDep = None,
) -> ResumeRead:
    """
    Upload a resume PDF, extract text, create a resume, and persist it.
    """
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise ValueError("Only PDF files are supported")

    file_bytes = await file.read()
    resume = await resume_service.upload_resume_file(
        db,
        user=current_user,
        file_bytes=file_bytes,
        filename=file.filename,
        title=title,
    )

    return ResumeRead.model_validate(resume)

