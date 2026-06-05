from pydantic import BaseModel, EmailStr


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