
from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, Integer
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

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True)
    full_name = Column(String(255))
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50))
    created_at = Column(TIMESTAMP)

class Event(Base):
    __tablename__ = "events"
 
    event_id = Column(String(36), primary_key=True)
    organization_id = Column(String(36), ForeignKey("organizations.organization_id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    location = Column(String(255))
    start_datetime = Column(TIMESTAMP)
    end_datetime = Column(TIMESTAMP)
    max_participants = Column(Integer)
    created_at = Column(TIMESTAMP)
 
 
class Registration(Base):
    __tablename__ = "registrations"
 
    registration_id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    event_id = Column(String(36), ForeignKey("events.event_id"), nullable=False)
    status = Column(String(50), default="pending")
    registered_at = Column(TIMESTAMP)