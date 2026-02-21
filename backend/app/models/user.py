import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class RoleEnum(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum, name="role_enum"), nullable=False, default=RoleEnum.USER
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
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

    resumes = relationship(
        "Resume",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    job_descriptions = relationship(
        "JobDescription",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    profile = relationship(
        "UserProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
        passive_deletes=True,
    )
    skills = relationship(
        "UserSkill",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    education = relationship(
        "UserEducation",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    experience = relationship(
        "UserExperience",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    projects = relationship(
        "UserProject",
        back_populates="user",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

