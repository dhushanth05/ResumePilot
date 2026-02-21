from datetime import datetime
from typing import List, Any
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class JobDescriptionBase(BaseModel):
    title: str = Field(..., max_length=255, description="Job title")
    company: str | None = Field(default=None, max_length=255, description="Company name")
    location: str | None = Field(default=None, max_length=255, description="Job location")
    employment_type: str | None = Field(default=None, max_length=50, description="Employment type (e.g., Full-time, Part-time)")
    experience_level: str | None = Field(default=None, max_length=50, description="Experience level (e.g., Entry Level, Senior Level)")
    work_mode: str | None = Field(default=None, max_length=50, description="Work mode (e.g., Remote, Hybrid, On-site)")
    salary_range: str | None = Field(default=None, max_length=100, description="Salary range")
    tech_stack: List[str] | None = Field(default=None, description="List of technologies/skills")
    description_text: str = Field(..., description="Full job description text")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Job title is required and cannot be empty')
        return v.strip()

    @field_validator('description_text')
    @classmethod
    def validate_description(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('Job description is required and cannot be empty')
        if len(v.strip()) < 50:
            raise ValueError('Job description must be at least 50 characters long')
        return v.strip()

    @field_validator('tech_stack')
    @classmethod
    def validate_tech_stack(cls, v: List[str] | None) -> List[str] | None:
        if v is not None:
            # Remove duplicates and empty strings
            cleaned_stack = list(set([tech.strip() for tech in v if tech.strip()]))
            if len(cleaned_stack) > 20:
                raise ValueError('Tech stack cannot contain more than 20 items')
            return cleaned_stack
        return v


class JobDescriptionCreate(JobDescriptionBase):
    pass


class JobDescriptionRead(JobDescriptionBase):
    id: UUID
    user_id: int
    word_count: int | None
    keywords: List[str] | None
    created_at: datetime
    updated_at: datetime

    @field_validator('tech_stack', mode='before')
    @classmethod
    def parse_tech_stack(cls, v: Any) -> List[str] | None:
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v

    @field_validator('keywords', mode='before')
    @classmethod
    def parse_keywords(cls, v: Any) -> List[str] | None:
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return None
        return v

    model_config = {"from_attributes": True}


class JobDescriptionCreateResponse(BaseModel):
    message: str = Field(..., description="Success message")
    job: JobDescriptionRead = Field(..., description="Created job description")
    status_code: int = Field(default=201, description="HTTP status code")

