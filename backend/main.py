from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Organization

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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