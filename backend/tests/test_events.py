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
        description="Test description",
        location="Test location",
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


class TestGetEvents:
    def test_returns_all_events(self):
        org = _create_org()
        _create_event(org.organization_id, "Event One")
        _create_event(org.organization_id, "Event Two")
        resp = client.get("/events")
        assert resp.status_code == 200
        titles = [e["title"] for e in resp.json()]
        assert "Event One" in titles
        assert "Event Two" in titles

    def test_search_filter(self):
        org = _create_org()
        _create_event(org.organization_id, "Python Workshop")
        _create_event(org.organization_id, "Art Show")
        resp = client.get("/events?search=Python")
        assert resp.status_code == 200
        results = resp.json()
        assert len(results) == 1
        assert results[0]["title"] == "Python Workshop"

    def test_filter_by_organization(self):
        org1 = _create_org("Org One", "org-one")
        org2 = _create_org("Org Two", "org-two")
        _create_event(org1.organization_id, "Org1 Event")
        _create_event(org2.organization_id, "Org2 Event")
        resp = client.get(f"/events?organization_id={org1.organization_id}")
        assert resp.status_code == 200
        assert all(e["organization_id"] == org1.organization_id for e in resp.json())

    def test_empty_result(self):
        resp = client.get("/events?search=nonexistent_xyz")
        assert resp.status_code == 200
        assert resp.json() == []


class TestGetEvent:
    def test_returns_event(self):
        org = _create_org()
        event = _create_event(org.organization_id, "Single Event")
        resp = client.get(f"/events/{event.event_id}")
        assert resp.status_code == 200
        assert resp.json()["title"] == "Single Event"

    def test_not_found(self):
        resp = client.get("/events/does-not-exist")
        assert resp.status_code == 404
        assert "не знайдено" in resp.json()["detail"]


class TestCreateEvent:
    def test_org_owner_can_create_event(self):
        org = _create_org()
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        resp = client.post(
            "/events",
            json={
                "organization_id": org.organization_id,
                "title": "New Event",
                "description": "Desc",
                "location": "Place",
                "start_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "end_datetime": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
                "max_participants": 50,
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 201
        assert resp.json()["title"] == "New Event"

    def test_student_cannot_create_event(self):
        org = _create_org()
        _, token = _create_user(role="student")

        resp = client.post(
            "/events",
            json={
                "organization_id": org.organization_id,
                "title": "Hacked Event",
                "start_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "end_datetime": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_non_member_cannot_create_event(self):
        org = _create_org()
        _, token = _create_user(role="org_owner")

        resp = client.post(
            "/events",
            json={
                "organization_id": org.organization_id,
                "title": "Hacked Event",
                "start_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "end_datetime": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_org_not_found(self):
        _, token = _create_user(role="admin")
        resp = client.post(
            "/events",
            json={
                "organization_id": "nonexistent-id",
                "title": "Event",
                "start_datetime": (datetime.utcnow() + timedelta(days=1)).isoformat(),
                "end_datetime": (datetime.utcnow() + timedelta(days=1, hours=2)).isoformat(),
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


class TestRegisterForEvent:
    def test_user_can_register(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="student")

        resp = client.post(
            f"/events/{event.event_id}/register",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "confirmed"

    def test_cannot_register_twice(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="student")

        client.post(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token}"})
        resp = client.post(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 409

    def test_cannot_register_for_past_event(self):
        org = _create_org()
        event = _create_event(org.organization_id, future=False)
        _, token = _create_user(role="student")

        resp = client.post(
            f"/events/{event.event_id}/register",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 400

    def test_cannot_register_when_full(self):
        org = _create_org()
        db = SessionLocal()
        event = Event(
            event_id=str(uuid.uuid4()),
            organization_id=org.organization_id,
            title="Full Event",
            start_datetime=datetime.utcnow() + timedelta(days=1),
            end_datetime=datetime.utcnow() + timedelta(days=1, hours=2),
            max_participants=1,
            status="active",
            created_at=datetime.utcnow(),
        )
        db.add(event)
        db.commit()

        # Register first user
        user1, token1 = _create_user(role="student")
        client.post(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token1}"})

        # Try to register second user
        _, token2 = _create_user(role="student")
        resp = client.post(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token2}"})
        assert resp.status_code == 400
        db.close()

    def test_event_not_found(self):
        _, token = _create_user(role="student")
        resp = client.post(
            "/events/nonexistent-id/register",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


class TestCancelRegistration:
    def test_user_can_cancel(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="student")

        client.post(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token}"})
        resp = client.delete(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200
        assert "скасовано" in resp.json()["message"]

    def test_cancel_nonexistent_registration(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="student")

        resp = client.delete(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 404


class TestUpdateEvent:
    def test_org_member_can_update_event(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        resp = client.patch(
            f"/events/{event.event_id}",
            json={"title": "Updated Title"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Title"

    def test_non_member_cannot_update_event(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="org_owner")

        resp = client.patch(
            f"/events/{event.event_id}",
            json={"title": "Hacked"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_event_not_found(self):
        _, token = _create_user(role="admin")
        resp = client.patch(
            "/events/nonexistent-id",
            json={"title": "X"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404


class TestGetEventParticipants:
    def test_org_member_can_see_participants(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        user, token = _create_user(role="org_owner")
        _make_member(user.user_id, org.organization_id)

        student, student_token = _create_user(role="student")
        client.post(f"/events/{event.event_id}/register", headers={"Authorization": f"Bearer {student_token}"})

        resp = client.get(
            f"/events/{event.event_id}/participants",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert any(p["email"] == student.email for p in resp.json())

    def test_non_member_cannot_see_participants(self):
        org = _create_org()
        event = _create_event(org.organization_id)
        _, token = _create_user(role="student")

        resp = client.get(
            f"/events/{event.event_id}/participants",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 403

    def test_event_not_found(self):
        _, token = _create_user(role="admin")
        resp = client.get(
            "/events/nonexistent-id/participants",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 404