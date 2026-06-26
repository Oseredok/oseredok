from pydantic import BaseModel, EmailStr, field_validator, model_validator
from datetime import datetime


def validate_event_datetimes(start: datetime, end: datetime, *, allow_past_start: bool = False) -> None:
    if not allow_past_start and start < datetime.utcnow():
        raise ValueError("Дата початку не може бути в минулому")
    if end <= start:
        raise ValueError("Дата закінчення має бути після дати початку")


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
    owner_id: str | None = None


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

    @model_validator(mode="after")
    def check_datetimes(self):
        validate_event_datetimes(self.start_datetime, self.end_datetime)
        return self


class EventUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    start_datetime: datetime | None = None
    end_datetime: datetime | None = None
    max_participants: int | None = None