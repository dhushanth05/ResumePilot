from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ResumeCreate(BaseModel):
    title: str = Field(..., max_length=255)


class ResumeRead(BaseModel):
    id: UUID
    user_id: int
    title: str
    file_path: str
    extracted_text: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeListItemRead(BaseModel):
    id: UUID
    title: str
    filename: str
    created_at: datetime