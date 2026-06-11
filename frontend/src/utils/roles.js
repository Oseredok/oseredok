export function isAdmin(role) {
  return role === "admin";
}

export function canCreateEvent(role) {
  return role === "admin" || role === "org_owner" || role === "organizer";
}

export function isOrganizer(role) {
  return role === "org_owner" || role === "organizer";
}

export function roleLabel(role) {
  if (role === "admin") return "Адмін";
  if (role === "student") return "Студент";
  if (role === "org_owner" || role === "organizer") return "Організатор";
  return role || "—";
}
