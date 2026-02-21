"""Add user profile tables (user_profiles, user_skills, user_education, user_experience, user_projects).

Revision ID: 001_profile
Revises:
Create Date: 2025-02-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_profile"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_profiles",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("phone", sa.String(64), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index("ix_user_profiles_id", "user_profiles", ["id"], unique=False)
    op.create_index("ix_user_profiles_user_id", "user_profiles", ["user_id"], unique=True)

    op.create_table(
        "user_skills",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("skill_name", sa.String(255), nullable=False),
        sa.Column("category", sa.String(128), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_skills_id", "user_skills", ["id"], unique=False)
    op.create_index("ix_user_skills_user_id", "user_skills", ["user_id"], unique=False)

    op.create_table(
        "user_education",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("institution", sa.String(512), nullable=True),
        sa.Column("degree", sa.String(255), nullable=True),
        sa.Column("field_of_study", sa.String(255), nullable=True),
        sa.Column("start_date", sa.String(64), nullable=True),
        sa.Column("end_date", sa.String(64), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_education_id", "user_education", ["id"], unique=False)
    op.create_index("ix_user_education_user_id", "user_education", ["user_id"], unique=False)

    op.create_table(
        "user_experience",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("company", sa.String(512), nullable=True),
        sa.Column("job_title", sa.String(255), nullable=True),
        sa.Column("start_date", sa.String(64), nullable=True),
        sa.Column("end_date", sa.String(64), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_experience_id", "user_experience", ["id"], unique=False)
    op.create_index("ix_user_experience_user_id", "user_experience", ["user_id"], unique=False)

    op.create_table(
        "user_projects",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("project_name", sa.String(512), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("technologies", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_projects_id", "user_projects", ["id"], unique=False)
    op.create_index("ix_user_projects_user_id", "user_projects", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_user_projects_user_id", "user_projects")
    op.drop_index("ix_user_projects_id", "user_projects")
    op.drop_table("user_projects")
    op.drop_index("ix_user_experience_user_id", "user_experience")
    op.drop_index("ix_user_experience_id", "user_experience")
    op.drop_table("user_experience")
    op.drop_index("ix_user_education_user_id", "user_education")
    op.drop_index("ix_user_education_id", "user_education")
    op.drop_table("user_education")
    op.drop_index("ix_user_skills_user_id", "user_skills")
    op.drop_index("ix_user_skills_id", "user_skills")
    op.drop_table("user_skills")
    op.drop_index("ix_user_profiles_user_id", "user_profiles")
    op.drop_index("ix_user_profiles_id", "user_profiles")
    op.drop_table("user_profiles")
