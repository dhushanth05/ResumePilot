from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    name: str = Field(..., max_length=255)
    category: str | None = Field(default=None, max_length=255)


class SkillCreate(SkillBase):
    pass


class SkillRead(SkillBase):
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class ResumeSkillRead(BaseModel):
    id: UUID
    resume_id: UUID
    skill: SkillRead
    weight: float | None

    model_config = {"from_attributes": True}


class JobSkillRead(BaseModel):
    id: UUID
    job_description_id: UUID
    skill: SkillRead
    importance: float | None

    model_config = {"from_attributes": True}

