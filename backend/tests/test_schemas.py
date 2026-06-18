import pytest
from pydantic import ValidationError

from schemas import OrganizationCreateRequest, UserLoginRequest, UserRegisterRequest


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
