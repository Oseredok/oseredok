import { colors, fonts, layout, radius, shadows } from "../theme/tokens";

export default function Navbar({ view, user, onNavigate, onOpenAuth, onLogout }) {
  const loggedInNav = [
    { id: "organizations", label: "Організації" },
    { id: "events", label: "Події" },
  ];
  if (user?.role === "admin") {
    loggedInNav.push({ id: "admin", label: "Адмін-панель" });
  }

  const isActive = (id) => {
    if (id === "organizations") return view === "organizations" || view === "org-detail";
    if (id === "events") return view === "events" || view === "event-detail" || view === "create-event";
    if (id === "admin") return view === "admin";
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
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
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

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {loggedInNav.map(({ id, label }) => {
                const active = isActive(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onNavigate(id)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: radius.sm,
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      border: "none",
                      background: "transparent",
                      color: active ? colors.primary : colors.textSecondary,
                      cursor: "pointer",
                      borderBottom: active ? `2px solid ${colors.primary}` : "2px solid transparent",
                      fontFamily: fonts.body,
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user ? (
            <>
              <button
                type="button"
                onClick={() => onNavigate("profile")}
                style={{
                  padding: "8px 18px",
                  borderRadius: radius.pill,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  background: colors.primary,
                  color: colors.white,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Мій профіль
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
                  fontFamily: fonts.body,
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
                  fontFamily: fonts.body,
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
                  fontFamily: fonts.body,
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
