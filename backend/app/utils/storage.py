from __future__ import annotations

import os
from pathlib import Path
from typing import Final

from ..core.config import settings

BASE_DIR: Final[Path] = Path(__file__).resolve().parents[2]


def get_resume_storage_root() -> Path:
    return BASE_DIR / settings.resume_storage_dir


def save_resume_file(
    *,
    user_id: int,
    resume_id: str,
    filename: str,
    content: bytes,
) -> str:
    """
    Save resume file under a deterministic path and return the relative path.
    """
    safe_name = os.path.basename(filename)
    root = get_resume_storage_root()
    target_dir = root / str(user_id) / resume_id
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / safe_name
    target_path.write_bytes(content)
    # Return path relative to project root for portability
    return str(target_path.relative_to(BASE_DIR))

