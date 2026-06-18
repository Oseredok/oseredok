import os

from jose import jwt

from main import create_token, hash_password, org_to_dict, verify_password
from models import Organization


def test_hash_and_verify_password():
    hashed = hash_password("secret123")
    assert verify_password("secret123", hashed)
    assert not verify_password("wrong", hashed)


def test_create_token_payload():
    token = create_token("user-42", "student@ukma.edu.ua")
    payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
    assert payload["sub"] == "user-42"
    assert payload["email"] == "student@ukma.edu.ua"


def test_org_to_dict_defaults_status():
    org = Organization(organization_id="1", name="КНУ", handle="knu")
    data = org_to_dict(org)
    assert data["status"] == "active"
    assert data["name"] == "КНУ"
    assert data["handle"] == "knu"


def test_org_to_dict_preserves_fields():
    org = Organization(
        organization_id="2",
        name="КУТ",
        handle="kut",
        category="Art",
        status="pending",
        contact_email="club@ukma.edu.ua",
    )
    data = org_to_dict(org)
    assert data["category"] == "Art"
    assert data["status"] == "pending"
    assert data["contact_email"] == "club@ukma.edu.ua"
