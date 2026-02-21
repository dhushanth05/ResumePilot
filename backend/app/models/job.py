import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class JobDescription(Base):
    __tablename__ = "job_descriptions"
    __table_args__ = (
        Index("ix_job_descriptions_user_created_at", "user_id", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    employment_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    experience_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    work_mode: Mapped[str | None] = mapped_column(String(50), nullable=True)
    salary_range: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tech_stack: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string array
    description_text: Mapped[str] = mapped_column(Text, nullable=False)
    word_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    keywords: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string array
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="job_descriptions")
    job_skills = relationship(
        "JobSkill",
        back_populates="job_description",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    analysis_results = relationship(
        "AnalysisResult",
        back_populates="job_description",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

