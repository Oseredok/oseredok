from unittest.mock import MagicMock

from roles import can_create_events, can_manage_organization, is_admin, is_organizer


class FakeUser:
    def __init__(self, role: str, user_id: str = "user-1"):
        self.role = role
        self.user_id = user_id


def test_is_admin():
    assert is_admin(FakeUser("admin"))
    assert not is_admin(FakeUser("student"))
    assert not is_admin(FakeUser("org_owner"))


def test_can_create_events():
    assert can_create_events(FakeUser("admin"))
    assert can_create_events(FakeUser("org_owner"))
    assert can_create_events(FakeUser("organizer"))
    assert not can_create_events(FakeUser("student"))


def test_is_organizer():
    assert is_organizer(FakeUser("org_owner"))
    assert is_organizer(FakeUser("organizer"))
    assert not is_organizer(FakeUser("admin"))
    assert not is_organizer(FakeUser("student"))


def test_can_manage_organization_as_admin():
    db = MagicMock()
    assert can_manage_organization(FakeUser("admin"), "org-1", db)
    db.query.assert_not_called()


def test_can_manage_organization_as_member():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = object()
    assert can_manage_organization(FakeUser("org_owner"), "org-1", db)


def test_can_manage_organization_denied_for_non_member():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    assert not can_manage_organization(FakeUser("org_owner"), "org-1", db)


def test_can_manage_organization_denied_for_student():
    db = MagicMock()
    assert not can_manage_organization(FakeUser("student"), "org-1", db)
    db.query.assert_not_called()
