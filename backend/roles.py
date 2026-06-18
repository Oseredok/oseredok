ORGANIZER_ROLES = frozenset({"org_owner", "organizer"})
EVENT_CREATOR_ROLES = frozenset({"admin", "org_owner", "organizer"})


def is_admin(user) -> bool:
    return user.role == "admin"


def can_create_events(user) -> bool:
    return user.role in EVENT_CREATOR_ROLES


def is_organizer(user) -> bool:
    return user.role in ORGANIZER_ROLES


def can_manage_organization(user, org_id, db) -> bool:
    if is_admin(user):
        return True
    if not is_organizer(user):
        return False
    from models import OrganizationMember
    return (
        db.query(OrganizationMember)
        .filter(
            OrganizationMember.user_id == user.user_id,
            OrganizationMember.organization_id == org_id,
        )
        .first()
        is not None
    )
