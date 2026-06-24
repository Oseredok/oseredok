import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base, get_db
from main import app, hash_password
from models import Organization, OrganizationMember, User
import uuid
from datetime import datetime

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
    """Recreate all tables before each test so tests are isolated."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def _db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _create_user(role="student", email=None) -> tuple[User, str]:
    """Insert a user into the DB and return (user, token)."""
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


class TestGetCurrentUser:
    def test_missing_authorization_header(self):
        resp = client.get("/users/me")
        assert resp.status_code == 422  # Header(...) makes it required

    def test_invalid_scheme(self):
        resp = client.get("/users/me", headers={"Authorization": "Basic abc123"})
        assert resp.status_code == 401
        assert "формат" in resp.json()["detail"]

    def test_malformed_token(self):
        resp = client.get("/users/me", headers={"Authorization": "Bearer notavalidjwt"})
        assert resp.status_code == 401

    def test_token_without_sub(self):
        from jose import jwt as jose_jwt
        import os
        token = jose_jwt.encode({"email": "x@ukma.edu.ua"}, os.environ["JWT_SECRET"], algorithm="HS256")
        resp = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 401
        assert "Невірний токен" in resp.json()["detail"]

    def test_token_for_nonexistent_user(self):
        from main import create_token
        token = create_token("nonexistent-id", "ghost@ukma.edu.ua")
        resp = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 404

    def test_valid_token_returns_profile(self):
        _, token = _create_user()
        resp = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200


class TestGetOrganizations:
    def test_returns_all_organizations(self):
        _create_org("Org Alpha", "org-alpha", "Science")
        _create_org("Org Beta", "org-beta", "Art")
        resp = client.get("/organizations")
        assert resp.status_code == 200
        names = [o["name"] for o in resp.json()]
        assert "Org Alpha" in names
        assert "Org Beta" in names

    def test_search_filter(self):
        _create_org("Chess Club", "chess-club", "Sport")
        _create_org("Drama Club", "drama-club", "Art")
        resp = client.get("/organizations?search=chess")
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) == 1
        assert results[0]["name"] == "Chess Club"

    def test_category_filter(self):
        _create_org("Science Org", "sci-org", "Science")
        _create_org("Art Org", "art-org", "Art")
        resp = client.get("/organizations?category=Art")
        assert resp.status_code == 200
        results = resp.json()
        assert all(o["category"] == "Art" for o in results)
        assert any(o["name"] == "Art Org" for o in results)

    def test_search_and_category_combined(self):
        _create_org("Science Art Group", "sci-art", "Art")
        _create_org("Science Only", "sci-only", "Science")
        resp = client.get("/organizations?search=Science&category=Art")
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) == 1
        assert results[0]["name"] == "Science Art Group"

    def test_empty_result(self):
        resp = client.get("/organizations?search=nonexistent_xyz")
        assert resp.status_code == 200
        assert resp.json() == []


class TestGetOrganization:
    def test_returns_org(self):
        org = _create_org("Single Org", "single-org")
        resp = client.get(f"/organizations/{org.organization_id}")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Single Org"

    def test_not_found(self):
        resp = client.get("/organizations/does-not-exist")
        assert resp.status_code == 404
        assert "не знайдено" in resp.json()["detail"]


class TestUpdateOrganization:
    def test_org_owner_can_update_their_org(self):
        org = _create_org("Owned Org", "owned-org")
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        resp = client.patch(
            f"/organizations/{org.organization_id}",
            json={"description": "Updated desc"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["description"] == "Updated desc"

    def test_non_member_cannot_update(self):
        org = _create_org("Protected Org", "protected-org")
        _, token = _create_user(role="org_owner")

        resp = client.patch(
            f"/organizations/{org.organization_id}",
            json={"description": "Hacked"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_student_cannot_update(self):
        org = _create_org("Student Block", "student-block")
        _, token = _create_user(role="student")

        resp = client.patch(
            f"/organizations/{org.organization_id}",
            json={"name": "New Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_non_admin_cannot_change_status(self):
        org = _create_org("Status Org", "status-org")
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        resp = client.patch(
            f"/organizations/{org.organization_id}",
            json={"status": "inactive"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        # status should NOT change for non-admin
        assert resp.json()["status"] == "active"

    def test_admin_can_change_status(self):
        org = _create_org("Admin Status Org", "admin-status-org")
        _, token = _create_user(role="admin")

        resp = client.patch(
            f"/organizations/{org.organization_id}",
            json={"status": "inactive"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "inactive"

    def test_duplicate_handle_rejected(self):
        _create_org("Org One", "taken-handle")
        org2 = _create_org("Org Two", "other-handle")
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org2.organization_id)

        resp = client.patch(
            f"/organizations/{org2.organization_id}",
            json={"handle": "taken-handle"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 409

    def test_same_handle_allowed(self):
        """Updating to the same handle should not trigger conflict."""
        org = _create_org("Same Handle Org", "same-handle")
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        resp = client.patch(
            f"/organizations/{org.organization_id}",
            json={"handle": "same-handle"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200

    def test_org_not_found(self):
        _, token = _create_user(role="admin")
        resp = client.patch(
            "/organizations/nonexistent-id",
            json={"name": "X"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


class TestDeleteOrganization:
    def test_admin_can_delete(self):
        org = _create_org("Delete Me", "delete-me")
        _, token = _create_user(role="admin")

        resp = client.delete(
            f"/organizations/{org.organization_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert "видалено" in resp.json()["message"]

        # Verify it's gone
        resp2 = client.get(f"/organizations/{org.organization_id}")
        assert resp2.status_code == 404

    def test_non_admin_cannot_delete(self):
        org = _create_org("Keep Me", "keep-me")
        _, token = _create_user(role="org_owner")

        resp = client.delete(
            f"/organizations/{org.organization_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_delete_nonexistent_org(self):
        _, token = _create_user(role="admin")
        resp = client.delete(
            "/organizations/ghost-id",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404

    def test_delete_also_removes_members(self):
        org = _create_org("Org With Members", "org-with-members")
        user, _ = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        _, admin_token = _create_user(role="admin")
        resp = client.delete(
            f"/organizations/{org.organization_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert resp.status_code == 200

        db = SessionLocal()
        count = db.query(OrganizationMember).filter(
            OrganizationMember.organization_id == org.organization_id
        ).count()
        db.close()
        assert count == 0