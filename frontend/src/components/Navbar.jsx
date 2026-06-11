import { colors, fonts, layout, radius, shadows } from "../theme/tokens";

const NAV_LINKS = [
  { id: "home", label: "Головна" },
  { id: "organizations", label: "Організації" },
  { id: "events", label: "Події" },
];

export default function Navbar({ view, user, onNavigate, onOpenAuth, onLogout }) {
  const isActive = (id) => {
    if (id === "home") return view === "home";
    if (id === "organizations") return view === "organizations" || view === "org-detail";
    if (id === "events") return view === "events" || view === "event-detail";
    return false;
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${colors.borderLight}`,
        boxShadow: shadows.sm,
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: layout.maxWidth,
          margin: "0 auto",
          padding: "0 24px",
          height: layout.navHeight,
          gap: 16,
        }}
      >
        <button
          type="button"
          onClick={() => onNavigate("home")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.sm,
              background: colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.white,
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            О
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              letterSpacing: "-0.02em",
            }}
          >
            Осередок
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {NAV_LINKS.map(({ id, label }) => {
            const active = isActive(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onNavigate(id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: radius.pill,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  border: "none",
                  background: active ? colors.primaryLight : "transparent",
                  color: active ? colors.primary : colors.textSecondary,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  fontFamily: fonts.body,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate("profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 14px 6px 6px",
                  background: view === "profile" ? colors.primaryLight : colors.surface,
                  borderRadius: radius.pill,
                  border: `1px solid ${view === "profile" ? colors.primaryMuted : colors.border}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color: colors.white,
                    fontWeight: 700,
                  }}
                >
                  {user.email[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                  Профіль
                </span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  padding: "8px 16px",
                  borderRadius: radius.pill,
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.textSecondary,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.textSecondary;
                }}
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                style={{
                  padding: "8px 18px",
                  borderRadius: radius.pill,
                  fontSize: 14,
                  fontWeight: 600,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.text,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.color = colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.color = colors.text;
                }}
              >
                Увійти
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("register")}
                style={{
                  padding: "8px 18px",
                  borderRadius: radius.pill,
                  fontSize: 14,
                  fontWeight: 700,
                  border: "none",
                  background: colors.primary,
                  color: colors.white,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  boxShadow: "0 2px 8px rgba(0,82,204,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.primaryHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.primary;
                }}
              >
                Реєстрація
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
