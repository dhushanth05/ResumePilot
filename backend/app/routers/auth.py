from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.config import settings
from ..core.database import get_db
from ..core.security import create_access_token, get_password_hash, verify_password
from ..models.user import RoleEnum, User
from ..schemas.auth import Token, UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)) -> User:
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=get_password_hash(payload.password),
        role=RoleEnum.USER,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Token:
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token)


@router.post("/login-json", response_model=Token)
async def login_json(payload: UserLogin, db: AsyncSession = Depends(get_db)) -> Token:
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    access_token = create_access_token(subject=user.id)
    return Token(access_token=access_token)


@router.post("/bootstrap-admin", response_model=UserRead)
async def bootstrap_admin(db: AsyncSession = Depends(get_db)) -> User:
    """
    One-time helper to create the first admin from env vars.
    In production, protect or disable this endpoint.
    """
    if not settings.first_superuser_email or not settings.first_superuser_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Superuser credentials not configured",
        )

    existing = await db.execute(select(User).where(User.email == settings.first_superuser_email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Superuser already exists",
        )

    user = User(
        email=settings.first_superuser_email,
        full_name="Administrator",
        hashed_password=get_password_hash(settings.first_superuser_password),
        role=RoleEnum.ADMIN,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

