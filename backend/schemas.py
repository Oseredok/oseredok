from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime


class OrganizationResponse(BaseModel):
    organization_id: str
    name: str
    description: str | None = None
    category: str | None = None

    class Config:
        from_attributes = True


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

    @field_validator("email")
    @classmethod
    def email_must_be_ukma(cls, v: str) -> str:
        if not v.endswith("@ukma.edu.ua"):
            raise ValueError("Дозволені лише адреси з доменом @ukma.edu.ua")
        return v


class UserRegisterResponse(BaseModel):
    userId: str
    email: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    token: str
    userId: str
    email: str


class UserProfileResponse(BaseModel):
    userId: str
    email: str
    full_name: str | None = None
    role: str | None = None
    faculty: str | None = None


class RegistrationResponse(BaseModel):
    registration_id: str
    event_id: str
    status: str


class UserUpdateRequest(BaseModel):
    full_name: str | None = None
    faculty: str | None = None


class OrganizationCreateRequest(BaseModel):
    name: str
    handle: str | None = None
    description: str | None = None
    category: str | None = None
    faculty: str | None = None
    logo_url: str | None = None
    contact_email: str | None = None
    phone: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    website: str | None = None


class OrganizationUpdateRequest(BaseModel):
    name: str | None = None
    handle: str | None = None
    description: str | None = None
    category: str | None = None
    faculty: str | None = None
    logo_url: str | None = None
    contact_email: str | None = None
    phone: str | None = None
    instagram: str | None = None
    telegram: str | None = None
    website: str | None = None
    status: str | None = None


class EventCreateRequest(BaseModel):
    organization_id: str
    title: str
    description: str | None = None
    location: str | None = None
    start_datetime: datetime
    end_datetime: datetime
    max_participants: int | None = None