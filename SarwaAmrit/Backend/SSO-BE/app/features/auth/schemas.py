from __future__ import annotations

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_slug: str = "demo"
    mfa_code: str | None = None


class LoginResponse(BaseModel):
    session_id: str
    mfa_required: bool = False
    user_id: str | None = None


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str | None = None
    tenant_slug: str = "demo"


class SignupResponse(BaseModel):
    session_id: str
    user_id: str
    email: EmailStr
