from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class EducationItem(BaseModel):
    institution: str | None = None
    degree: str | None = None
    field_of_study: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None


class ExperienceItem(BaseModel):
    company: str | None = None
    job_title: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    description: str | None = None


class ProjectItem(BaseModel):
    project_name: str | None = None
    description: str | None = None
    technologies: list[str] | None = None


class SkillItem(BaseModel):
    skill_name: str
    category: str | None = None


class ProfileBase(BaseModel):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    summary: str | None = None


class ProfileRead(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(ProfileBase):
    full_name: str | None = None
    email: str | None = None
    phone: str | None = None
    summary: str | None = None


class EducationRead(EducationItem):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class EducationCreate(EducationItem):
    pass


class EducationUpdate(EducationItem):
    pass


class ExperienceRead(ExperienceItem):
    id: int
    user_id: int

    model_config = {"from_attributes": True}


class ExperienceCreate(ExperienceItem):
    pass


class ExperienceUpdate(ExperienceItem):
    pass


class ProjectRead(ProjectItem):
    id: int
    user_id: int

    model_config = {"from_attributes": True}

    @field_validator("technologies", mode="before")
    @classmethod
    def technologies_to_list(cls, v: str | list[str] | None) -> list[str] | None:
        if v is None:
            return None
        if isinstance(v, str):
            return [x.strip() for x in v.split(",") if x.strip()]
        return v


class ProjectCreate(ProjectItem):
    pass


class ProjectUpdate(ProjectItem):
    pass


class SkillRead(SkillItem):
    id: int
    user_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SkillCreate(BaseModel):
    skill_name: str = Field(..., min_length=1, max_length=255)
    category: str | None = None


class FullProfileRead(BaseModel):
    profile: ProfileRead | None = None
    skills: list[SkillRead] = []
    education: list[EducationRead] = []
    experience: list[ExperienceRead] = []
    projects: list[ProjectRead] = []


class FullProfileUpdate(BaseModel):
    profile: ProfileUpdate | None = None
    skills: list[SkillCreate] | None = None
    education: list[EducationCreate] | None = None
    experience: list[ExperienceCreate] | None = None
    projects: list[ProjectCreate] | None = None


class ProfileGenerateRequest(BaseModel):
    resume_id: str = Field(..., description="Resume UUID to extract profile from")
    overwrite: bool = Field(
        default=False,
        description="If true, replace existing profile. If false and profile exists, returns 409.",
    )
