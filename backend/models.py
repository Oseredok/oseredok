from sqlalchemy import Column, String, Text, TIMESTAMP
from database import Base

class Organization(Base):
    __tablename__ = "organizations"

    organization_id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    logo_url = Column(String(255))
    contact_email = Column(String(255))
    created_at = Column(TIMESTAMP)