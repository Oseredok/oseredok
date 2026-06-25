import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app, hash_password
from models import Organization, OrganizationMember, User, Event, Registration
import uuid
from datetime import datetime, timedelta

engine = create_engine("sqlite:///./test.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)


def override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _create_user(role="student", email=None) -> tuple[User, str]:
    db = SessionLocal()
    uid = str(uuid.uuid4())
    email = email or f"{uid[:8]}@ukma.edu.ua"
    user = User(
        user_id=uid,
        email=email,
        full_name="Test User",
        password_hash=hash_password("pass1234"),
        role=role,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    resp = client.post("/auth/login", json={"email": email, "password": "pass1234"})
    token = resp.json()["token"]
    return user, token


def _create_org(name="Test Org", handle=None, category="Science") -> Organization:
    db = SessionLocal()
    org = Organization(
        organization_id=str(uuid.uuid4()),
        name=name,
        handle=handle or name.lower().replace(" ", "-"),
        category=category,
        status="active",
        created_at=datetime.utcnow(),
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    db.close()
    return org


def _make_member(user_id, org_id, role_in_org="owner"):
    db = SessionLocal()
    db.add(OrganizationMember(
        membership_id=str(uuid.uuid4()),
        user_id=user_id,
        organization_id=org_id,
        role_in_org=role_in_org,
        joined_at=datetime.utcnow(),
    ))
    db.commit()
    db.close()


def _create_event(org_id, title="Test Event", future=True) -> Event:
    db = SessionLocal()
    start = datetime.utcnow() + timedelta(days=1 if future else -1)
    event = Event(
        event_id=str(uuid.uuid4()),
        organization_id=org_id,
        title=title,
        start_datetime=start,
        end_datetime=start + timedelta(hours=2),
        max_participants=10,
        status="active",
        created_at=datetime.utcnow(),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    db.close()
    return event


# --- Auth ---

class TestAuthRegister:
    def test_register_new_user(self):
        resp = client.post("/auth/register", json={
            "email": "newuser@ukma.edu.ua",
            "full_name": "New User",
            "password": "pass1234",
        })
        assert resp.status_code == 201
        assert resp.json()["email"] == "newuser@ukma.edu.ua"

    def test_register_duplicate_email(self):
        client.post("/auth/register", json={
            "email": "dup@ukma.edu.ua",
            "full_name": "User",
            "password": "pass1234",
        })
        resp = client.post("/auth/register", json={
            "email": "dup@ukma.edu.ua",
            "full_name": "User2",
            "password": "pass1234",
        })
        assert resp.status_code == 409

    def test_login_wrong_password(self):
        client.post("/auth/register", json={
            "email": "login@ukma.edu.ua",
            "full_name": "User",
            "password": "pass1234",
        })
        resp = client.post("/auth/login", json={
            "email": "login@ukma.edu.ua",
            "password": "wrongpass",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self):
        resp = client.post("/auth/login", json={
            "email": "ghost@ukma.edu.ua",
            "password": "pass1234",
        })
        assert resp.status_code == 401


# --- Users ---

class TestGetAllUsers:
    def test_admin_can_get_all_users(self):
        _create_user(role="student")
        _, token = _create_user(role="admin")
        resp = client.get("/users", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_non_admin_cannot_get_all_users(self):
        _, token = _create_user(role="student")
        resp = client.get("/users", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403


class TestCreateUser:
    def test_admin_can_create_user(self):
        _, token = _create_user(role="admin")
        resp = client.post("/users", json={
            "email": "created@ukma.edu.ua",
            "full_name": "Created User",
            "password": "pass1234",
            "role": "student",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 201
        assert "user_id" in resp.json()

    def test_non_admin_cannot_create_user(self):
        _, token = _create_user(role="student")
        resp = client.post("/users", json={
            "email": "hacked@ukma.edu.ua",
            "full_name": "Hacker",
            "password": "pass1234",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    def test_duplicate_email_rejected(self):
        _, token = _create_user(role="admin")
        client.post("/users", json={
            "email": "dup2@ukma.edu.ua",
            "password": "pass1234",
        }, headers={"Authorization": f"Bearer {token}"})
        resp = client.post("/users", json={
            "email": "dup2@ukma.edu.ua",
            "password": "pass1234",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 409


class TestDeleteUser:
    def test_admin_can_delete_user(self):
        user, _ = _create_user(role="student")
        _, token = _create_user(role="admin")
        resp = client.delete(f"/users/{user.user_id}", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert "видалено" in resp.json()["message"]

    def test_non_admin_cannot_delete_user(self):
        user, _ = _create_user(role="student")
        _, token = _create_user(role="student")
        resp = client.delete(f"/users/{user.user_id}", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    def test_cannot_delete_self(self):
        user, token = _create_user(role="admin")
        resp = client.delete(f"/users/{user.user_id}", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 400

    def test_delete_nonexistent_user(self):
        _, token = _create_user(role="admin")
        resp = client.delete("/users/nonexistent-id", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 404


class TestSearchUsers:
    def test_admin_can_search(self):
        db = SessionLocal()
        uid = str(uuid.uuid4())
        db.add(User(
            user_id=uid,
            email=f"{uid[:8]}@ukma.edu.ua",
            full_name="Unique Searchable Name",
            password_hash=hash_password("pass1234"),
            role="student",
            created_at=datetime.utcnow(),
        ))
        db.commit()
        db.close()

        _, token = _create_user(role="admin")
        resp = client.get("/users/search?q=Unique+Searchable", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_non_admin_cannot_search(self):
        _, token = _create_user(role="student")
        resp = client.get("/users/search?q=test", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403


class TestUpdateMyProfile:
    def test_can_update_full_name(self):
        _, token = _create_user(role="student")
        resp = client.patch("/users/me", json={"full_name": "Updated Name"},
                            headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "Updated Name"

    def test_can_update_faculty(self):
        _, token = _create_user(role="student")
        resp = client.patch("/users/me", json={"faculty": "IT"},
                            headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["faculty"] == "IT"


class TestGetMyRegistrations:
    def test_returns_registrations(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="student")

        client.post(f"/events/{event.event_id}/register",
                    headers={"Authorization": f"Bearer {token}"})

        resp = client.get("/users/me/registrations",
                          headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert len(resp.json()) == 1
        assert resp.json()[0]["event"]["event_id"] == event.event_id

    def test_returns_empty_when_no_registrations(self):
        _, token = _create_user(role="student")
        resp = client.get("/users/me/registrations",
                          headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json() == []


class TestGetMyOrganizations:
    def test_admin_gets_all_orgs(self):
        _create_org("Org A", "org-a")
        _create_org("Org B", "org-b")
        _, token = _create_user(role="admin")
        resp = client.get("/users/me/organizations",
                          headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert len(resp.json()) >= 2

    def test_org_owner_gets_own_orgs(self):
        org = _create_org("My Org", "my-org")
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)
        resp = client.get("/users/me/organizations",
                          headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert any(o["organization_id"] == org.organization_id for o in resp.json())


class TestGetMyOrganization:
    def test_returns_organization_for_member(self):
        org = _create_org("Member Org", "member-org")
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)
        resp = client.get("/users/me/organization",
                          headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert resp.json()["organization_id"] == org.organization_id

    def test_returns_404_when_no_membership(self):
        _, token = _create_user(role="student")
        resp = client.get("/users/me/organization",
                          headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 404


class TestCreateOrganization:
    def test_admin_can_create_org(self):
        _, token = _create_user(role="admin")
        resp = client.post("/organizations", json={
            "name": "New Org",
            "handle": "new-org",
            "category": "Science",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 201
        assert resp.json()["name"] == "New Org"

    def test_non_admin_cannot_create_org(self):
        _, token = _create_user(role="student")
        resp = client.post("/organizations", json={
            "name": "Hacked Org",
            "handle": "hacked-org",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 403

    def test_duplicate_handle_rejected(self):
        _, token = _create_user(role="admin")
        client.post("/organizations", json={
            "name": "Org One",
            "handle": "dup-handle",
        }, headers={"Authorization": f"Bearer {token}"})
        resp = client.post("/organizations", json={
            "name": "Org Two",
            "handle": "dup-handle",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 409

    def test_create_org_with_owner(self):
        _, token = _create_user(role="admin")
        owner, _ = _create_user(role="student")
        resp = client.post("/organizations", json={
            "name": "Owned Org",
            "handle": "owned-org",
            "owner_id": owner.user_id,
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 201

    def test_create_org_with_nonexistent_owner(self):
        _, token = _create_user(role="admin")
        resp = client.post("/organizations", json={
            "name": "Ghost Org",
            "handle": "ghost-org",
            "owner_id": "nonexistent-id",
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 404