from fastapi import FastAPI, HTTPException, Depends, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta
import uuid
import os

from database import get_db
from models import Organization, User, Event, Registration
from schemas import (
    UserRegisterRequest, UserRegisterResponse,
    UserLoginRequest, TokenResponse,
    UserProfileResponse, RegistrationResponse,
    UserUpdateRequest, OrganizationCreateRequest,
    EventCreateRequest
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


def get_current_user(authorization: str = Header(...), db: Session = Depends(get_db)) -> User:
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Невірний формат токена")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Невірний токен")
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Невірний або прострочений токен")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    return user


# --- Root ---

@app.get("/")
def root():
    return {"message": "Backend is running"}


# --- Organizations ---

@app.get("/organizations")
def get_organizations(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Organization)
    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%"))
    if category:
        query = query.filter(Organization.category == category)

    return [
        {
            "organization_id": org.organization_id,
            "name": org.name,
            "description": org.description,
            "category": org.category,
            "logo_url": org.logo_url,
            "contact_email": org.contact_email,
        }
        for org in query.all()
    ]


@app.get("/organizations/{org_id}")
def get_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.organization_id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Організацію не знайдено")
    return {
        "organization_id": org.organization_id,
        "name": org.name,
        "description": org.description,
        "category": org.category,
        "logo_url": org.logo_url,
        "contact_email": org.contact_email,
    }


@app.post("/organizations", status_code=201)
def create_organization(
    body: OrganizationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Тільки адміністратор може створювати організації")
    
    existing_handle = db.query(Organization).filter(Organization.handle == body.handle).first()
    if existing_handle:
        raise HTTPException(status_code=409, detail="Такий handle вже зайнято")
    
    new_org = Organization(
        organization_id=str(uuid.uuid4()),
        name=body.name,
        handle=body.handle,
        description=body.description,
        category=body.category,
        faculty=body.faculty,
        logo_url=body.logo_url,
        contact_email=body.contact_email,
        phone=body.phone,
        instagram=body.instagram,
        telegram=body.telegram,
        website=body.website,
        status="active",
        created_at=datetime.utcnow()
    )
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return {
        "organization_id": new_org.organization_id,
        "name": new_org.name,
        "message": "Організацію створено"
    }


# --- Events ---

@app.get("/events")
def get_events(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    organization_id: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Event, Organization).outerjoin(
        Organization, Event.organization_id == Organization.organization_id
    )
    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))
    if category:
        query = query.filter(Organization.category == category)
    if organization_id:
        query = query.filter(Event.organization_id == organization_id)

    results = query.order_by(Event.start_datetime).all()

    events = []
    for event, org in results:
        count = db.query(func.count(Registration.registration_id)).filter(
            Registration.event_id == event.event_id,
            Registration.status != "cancelled"
        ).scalar()
        events.append({
            "event_id": event.event_id,
            "title": event.title,
            "description": event.description,
            "category": org.category if org else None,
            "start_datetime": event.start_datetime,
            "end_datetime": event.end_datetime,
            "location": event.location,
            "max_participants": event.max_participants,
            "participants_count": count,
            "organization_id": event.organization_id,
            "organization_name": org.name if org else None,
            "organization_logo": org.logo_url if org else None,
        })
    return events


@app.get("/events/{event_id}")
def get_event(event_id: str, db: Session = Depends(get_db)):
    result = db.query(Event, Organization).outerjoin(
        Organization, Event.organization_id == Organization.organization_id
    ).filter(Event.event_id == event_id).first()

    if not result:
        raise HTTPException(status_code=404, detail="Подію не знайдено")

    event, org = result
    count = db.query(func.count(Registration.registration_id)).filter(
        Registration.event_id == event_id,
        Registration.status != "cancelled"
    ).scalar()

    return {
        "event_id": event.event_id,
        "title": event.title,
        "description": event.description,
        "category": org.category if org else None,
        "start_datetime": event.start_datetime,
        "end_datetime": event.end_datetime,
        "location": event.location,
        "max_participants": event.max_participants,
        "participants_count": count,
        "organization_id": event.organization_id,
        "organization_name": org.name if org else None,
        "organization_logo": org.logo_url if org else None,
    }


@app.post("/events", status_code=201)
def create_event(
    body: EventCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org = db.query(Organization).filter(Organization.organization_id == body.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Організацію не знайдено")
    
    new_event = Event(
        event_id=str(uuid.uuid4()),
        organization_id=body.organization_id,
        title=body.title,
        description=body.description,
        location=body.location,
        start_datetime=body.start_datetime,
        end_datetime=body.end_datetime,
        max_participants=body.max_participants,
        status="active",
        created_at=datetime.utcnow()
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return {
        "event_id": new_event.event_id,
        "title": new_event.title,
        "message": "Подію створено"
    }


# --- Реєстрація на подію ---

@app.post("/events/{event_id}/register", response_model=RegistrationResponse)
def register_for_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Подію не знайдено")

    existing = db.query(Registration).filter(
        Registration.user_id == current_user.user_id,
        Registration.event_id == event_id,
        Registration.status != "cancelled"
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Ви вже зареєстровані на цю подію")

    if event.max_participants:
        count = db.query(func.count(Registration.registration_id)).filter(
            Registration.event_id == event_id,
            Registration.status != "cancelled"
        ).scalar()
        if count >= event.max_participants:
            raise HTTPException(status_code=400, detail="Місця закінчилися")

    reg = Registration(
        registration_id=str(uuid.uuid4()),
        user_id=current_user.user_id,
        event_id=event_id,
        status="confirmed",
        registered_at=datetime.utcnow()
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return RegistrationResponse(
        registration_id=reg.registration_id,
        event_id=reg.event_id,
        status=reg.status
    )


@app.delete("/events/{event_id}/register")
def cancel_registration(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reg = db.query(Registration).filter(
        Registration.user_id == current_user.user_id,
        Registration.event_id == event_id,
        Registration.status != "cancelled"
    ).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Реєстрацію не знайдено")

    reg.status = "cancelled"
    db.commit()
    return {"message": "Реєстрацію скасовано"}


# --- Профіль ---

@app.get("/users/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserProfileResponse(
        userId=current_user.user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role
    )

@app.patch("/users/me", response_model=UserProfileResponse)
def update_my_profile(
    body: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if body.full_name is not None:
        current_user.full_name = body.full_name
    db.commit()
    db.refresh(current_user)
    return UserProfileResponse(
        userId=current_user.user_id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role
    )


@app.get("/users/me/registrations")
def get_my_registrations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    regs = db.query(Registration, Event).join(
        Event, Registration.event_id == Event.event_id
    ).filter(
        Registration.user_id == current_user.user_id,
        Registration.status != "cancelled"
    ).all()

    return [
        {
            "registration_id": reg.registration_id,
            "status": reg.status,
            "registered_at": reg.registered_at,
            "event": {
                "event_id": event.event_id,
                "title": event.title,
                "location": event.location,
                "start_datetime": event.start_datetime,
            }
        }
        for reg, event in regs
    ]


# --- Auth ---

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