import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .core.config import settings
from .core.database import Base, engine
from .core.errors import init_error_handlers
from .routers import admin, analysis, auth, jobs, profile, resumes

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.project_name,
        version="0.1.0",
    )

    @app.on_event("startup")
    async def startup() -> None:
        if settings.env != "local":
            return

        db_url = settings.async_database_uri
        logger.info("DB async url=%s", db_url)
        logger.info("DB name=%s host=%s port=%s", settings.postgres_db, settings.postgres_host, settings.postgres_port)
        if not db_url.startswith("postgresql+"):
            raise RuntimeError("Invalid database configuration: expected PostgreSQL async URL")

        from . import models  # noqa: F401

        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
            if os.getenv("RESET_DB") == "1":
                await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE"))
                await conn.execute(text("CREATE SCHEMA public"))
            await conn.run_sync(Base.metadata.create_all)

    # CORS
    origins: list[str] = []
    if settings.frontend_origin:
        origins.append(str(settings.frontend_origin).rstrip("/"))
    if settings.env == "local":
        origins.extend(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
        )

    allow_origins = sorted(set(origins))
    # Browsers reject Access-Control-Allow-Origin: * together with allow_credentials=true.
    # If no explicit origins were configured, fall back to wildcard but disable credentials.
    allow_credentials = bool(allow_origins)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins or ["*"],  # relax for local dev; tighten in prod
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Error / validation handlers
    init_error_handlers(app)

    # Routers
    api_prefix = settings.api_v1_prefix
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(resumes.router, prefix=api_prefix)
    app.include_router(jobs.router, prefix=api_prefix)
    app.include_router(analysis.router, prefix=api_prefix)
    app.include_router(profile.router, prefix=api_prefix)
    app.include_router(admin.router, prefix=api_prefix)

    @app.get("/health", tags=["system"])
    async def health_check() -> dict:
        return {"status": "ok"}

    return app


app = create_app()

