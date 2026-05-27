from pydantic import BaseModel

class OrganizationResponse(BaseModel):
    organization_id: str
    name: str
    description: str | None = None
    category: str | None = None

    class Config:
        from_attributes = True