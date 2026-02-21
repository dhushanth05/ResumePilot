from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from ..models.user import RoleEnum


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: int = Field(..., description="User ID")
    exp: datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRead(UserBase):
    id: int
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True

