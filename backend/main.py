from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import uuid

from database import SessionLocal
from models import Organization, User
from schemas import UserRegisterRequest, UserRegisterResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.get("/")
def root():
    return {"message": "Backend is running"}

@app.get("/organizations")
def get_organizations():
    db: Session = SessionLocal()
    organizations = db.query(Organization).all()
    result = []
    for org in organizations:
        result.append({
            "organization_id": org.organization_id,
            "name": org.name,
            "description": org.description,
            "category": org.category
        })
    return result

@app.post("/auth/register", status_code=201, response_model=UserRegisterResponse)
def register(body: UserRegisterRequest):
    db: Session = SessionLocal()

    # Перевірка дубліката email
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email вже зареєстровано")

    # Хешування пароля
    hashed = pwd_context.hash(body.password)

    # Створення юзера
    new_user = User(
        user_id=str(uuid.uuid4()),
        email=body.email,
        password_hash=hashed
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserRegisterResponse(userId=new_user.user_id, email=new_user.email)