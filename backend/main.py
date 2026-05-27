from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
import uuid
import os

from database import SessionLocal, get_db
from models import Organization, User
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


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


SECRET_KEY = os.getenv("JWT_SECRET", "change_me_in_production")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24


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
def get_organizations(db: Session = Depends(get_db)):
    organizations = db.query(Organization).all()
    return [
        {
            "organization_id": org.organization_id,
            "name": org.name,
            "description": org.description,
            "category": org.category
        }
        for org in organizations
    ]


@app.post("/auth/register", status_code=201, response_model=UserRegisterResponse)
def register(body: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email вже зареєстровано")

    hashed = hash_password(body.password)
    new_user = User(
        user_id=str(uuid.uuid4()),
        email=body.email,
        password_hash=hashed
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