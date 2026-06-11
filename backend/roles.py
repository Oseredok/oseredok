ORGANIZER_ROLES = frozenset({"org_owner", "organizer"})
EVENT_CREATOR_ROLES = frozenset({"admin", "org_owner", "organizer"})


def is_admin(user) -> bool:
    return user.role == "admin"


def can_create_events(user) -> bool:
    return user.role in EVENT_CREATOR_ROLES


def is_organizer(user) -> bool:
    return user.role in ORGANIZER_ROLES
