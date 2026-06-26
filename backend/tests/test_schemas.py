from datetime import datetime, timedelta

import pytest
from pydantic import ValidationError

from schemas import EventCreateRequest, OrganizationCreateRequest, UserLoginRequest, UserRegisterRequest


def test_user_register_accepts_ukma_email():
    user = UserRegisterRequest(email="student@ukma.edu.ua", password="secret123")
    assert user.email == "student@ukma.edu.ua"


def test_user_register_accepts_optional_full_name():
    user = UserRegisterRequest(
        email="student@ukma.edu.ua",
        password="secret123",
        full_name="Student Name",
    )
    assert user.full_name == "Student Name"


def test_user_register_rejects_non_ukma_email():
    with pytest.raises(ValidationError, match="@ukma.edu.ua"):
        UserRegisterRequest(email="student@gmail.com", password="secret123")


def test_user_login_request():
    login = UserLoginRequest(email="student@ukma.edu.ua", password="secret123")
    assert login.email == "student@ukma.edu.ua"


def test_organization_create_request_minimal():
    org = OrganizationCreateRequest(name="Нова організація")
    assert org.name == "Нова організація"
    assert org.handle is None


def test_event_create_rejects_past_start():
    past = datetime.utcnow() - timedelta(days=1)
    end = past + timedelta(hours=2)
    with pytest.raises(ValidationError, match="минулому"):
        EventCreateRequest(
            organization_id="org-1",
            title="Test",
            start_datetime=past,
            end_datetime=end,
        )


def test_event_create_rejects_end_before_start():
    start = datetime.utcnow() + timedelta(days=1)
    end = start - timedelta(hours=1)
    with pytest.raises(ValidationError, match="закінчення"):
        EventCreateRequest(
            organization_id="org-1",
            title="Test",
            start_datetime=start,
            end_datetime=end,
        )


def test_event_create_accepts_future_datetimes():
    start = datetime.utcnow() + timedelta(days=1)
    end = start + timedelta(hours=2)
    event = EventCreateRequest(
        organization_id="org-1",
        title="Test",
        start_datetime=start,
        end_datetime=end,
    )
    assert event.title == "Test"
