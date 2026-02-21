import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class Skill(Base):
    __tablename__ = "skills"
    __table_args__ = (
        Index("ix_skills_name", "name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    category: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    resume_skills = relationship(
        "ResumeSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    job_skills = relationship(
        "JobSkill",
        back_populates="skill",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ResumeSkill(Base):
    __tablename__ = "resume_skills"
    __table_args__ = (
        UniqueConstraint("resume_id", "skill_id", name="uq_resume_skill"),
        Index(
            "ix_resume_skills_resume_skill",
            "resume_id",
            "skill_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    resume_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)

    resume = relationship("Resume", back_populates="resume_skills")
    skill = relationship("Skill", back_populates="resume_skills")


class JobSkill(Base):
    __tablename__ = "job_skills"
    __table_args__ = (
        UniqueConstraint("job_description_id", "skill_id", name="uq_job_skill"),
        Index(
            "ix_job_skills_job_skill",
            "job_description_id",
            "skill_id",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    job_description_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("job_descriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    skill_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    importance: Mapped[float | None] = mapped_column(Float, nullable=True)

    job_description = relationship("JobDescription", back_populates="job_skills")
    skill = relationship("Skill", back_populates="job_skills")

