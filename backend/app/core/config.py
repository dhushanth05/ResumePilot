from functools import lru_cache
from typing import Literal

from pydantic import AnyUrl, EmailStr
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Environment
    env: Literal["local", "dev", "prod"] = "local"
    debug: bool = True

    # Project
    project_name: str = "ResumePilot API"
    api_v1_prefix: str = "/api/v1"

    # Security
    secret_key: str
    access_token_expire_minutes: int = 60 * 24  # 1 day
    algorithm: str = "HS256"

    # Database
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "resume_analyser"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Storage
    resume_storage_dir: str = "storage/resumes"

    # CORS
    frontend_origin: AnyUrl | None = None

    # Admin
    first_superuser_email: EmailStr | None = None
    first_superuser_password: str | None = None
    admin_api_key: str | None = None

    # LLM (profile extraction)
    openai_api_key: str | None = None

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
    }

    @property
    def sync_database_uri(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:"
            f"{self.postgres_password}@{self.postgres_host}:"
            f"{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def async_database_uri(self) -> str:
        # Use asyncpg for async SQLAlchemy engine
        return (
            f"postgresql+asyncpg://{self.postgres_user}:"
            f"{self.postgres_password}@{self.postgres_host}:"
            f"{self.postgres_port}/{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]


settings = get_settings()

