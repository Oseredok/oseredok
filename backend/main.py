from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
import uuid
import os

from database import SessionLocal, get_db
from models import Organization, User, Event
from schemas import (
    UserRegisterRequest, UserRegisterResponse,
    UserLoginRequest, TokenResponse
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET", "change_me_in_production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@app.get("/")
def root():
    return {"message": "Backend is running"}


@app.get("/organizations")
def get_organizations(
    search: str | None = Query(default=None, description="Пошук за назвою"),
    category: str | None = Query(default=None, description="Фільтр за категорією"),
    db: Session = Depends(get_db)
):
    query = db.query(Organization)

    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%"))

    if category:
        query = query.filter(Organization.category == category)

    organizations = query.all()
    return [
        {
            "organization_id": org.organization_id,
            "name": org.name,
            "description": org.description,
            "category": org.category,
            "logo_url": org.logo_url,
            "contact_email": org.contact_email,
        }
        for org in organizations
    ]


@app.post("/auth/register", status_code=201, response_model=UserRegisterResponse)
def register(body: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email вже зареєстровано")

    new_user = User(
        user_id=str(uuid.uuid4()),
        email=body.email,
        full_name=body.full_name,
        password_hash=hash_password(body.password),
        role="student",
        created_at=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserRegisterResponse(userId=new_user.user_id, email=new_user.email)


@app.post("/auth/login", response_model=TokenResponse)
def login(body: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Невірний email або пароль")

    token = create_token(user.user_id, user.email)
    return TokenResponse(token=token, userId=user.user_id, email=user.email)

@app.get("/events")
def get_events(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Event, Organization).outerjoin(
        Organization, Event.organization_id == Organization.organization_id
    )

    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))

    if category:
        query = query.filter(Organization.category == category)

    results = query.order_by(Event.start_datetime).all()
    return [
        {
            "event_id": event.event_id,
            "title": event.title,
            "description": event.description,
            "category": org.category if org else None,
            "start_datetime": event.start_datetime,
            "end_datetime": event.end_datetime,
            "location": event.location,
            "max_participants": event.max_participants,
            "organization_id": event.organization_id,
            "organization_name": org.name if org else None,
            "organization_logo": org.logo_url if org else None,
        }
        for event, org in results
    ]