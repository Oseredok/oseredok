import pytest
from pydantic import ValidationError

from schemas import UserRegisterRequest


def test_user_register_accepts_ukma_email():
    user = UserRegisterRequest(email="student@ukma.edu.ua", password="secret123")
    assert user.email == "student@ukma.edu.ua"


def test_user_register_rejects_non_ukma_email():
    with pytest.raises(ValidationError, match="@ukma.edu.ua"):
        UserRegisterRequest(email="student@gmail.com", password="secret123")
