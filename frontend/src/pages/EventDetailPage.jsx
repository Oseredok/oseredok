import CategoryPill from "../components/CategoryPill";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventDetailPage({ event, user, onBack, onOpenAuth }) {
  const color = categoryColors[event.category] || categoryColors.default;

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          borderRadius: radius.pill,
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.textSecondary,
          cursor: "pointer",
          marginBottom: 24,
          transition: "all 0.15s",
          fontFamily: fonts.body,
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
        ← Назад до подій
      </button>

      <div
        style={{
          height: 200,
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
          display: "flex",
          alignItems: "flex-end",
          padding: 24,
        }}
      >
        {event.category && <CategoryPill cat={event.category} />}
      </div>

      <div
          className="detail-grid"
          style={{
            background: colors.surface,
            borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
            border: `1px solid ${colors.borderLight}`,
            borderTop: "none",
            boxShadow: shadows.md,
            padding: "32px",
          }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              marginBottom: 8,
              letterSpacing: "-0.02em",
            }}
          >
            {event.title}
          </h1>
          {event.org_name && (
            <p
              style={{
                fontSize: 15,
                color: colors.primary,
                fontWeight: 600,
                marginBottom: 20,
                fontFamily: fonts.body,
              }}
            >
              {event.org_name}
            </p>
          )}
          <p
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              lineHeight: 1.8,
              fontFamily: fonts.body,
            }}
          >
            {event.description}
          </p>
        </div>

        <aside>
          <div
            style={{
              background: colors.bg,
              borderRadius: radius.lg,
              padding: 24,
              border: `1px solid ${colors.borderLight}`,
            }}
          >
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: colors.textMuted,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
                fontFamily: fonts.body,
              }}
            >
              Деталі події
            </h3>

            {event.start_datetime && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginBottom: 4,
                    fontFamily: fonts.body,
                  }}
                >
                  Дата та час
                </p>
                <p style={{ fontSize: 14, color: colors.text, fontWeight: 600, fontFamily: fonts.body }}>
                  {formatDate(event.start_datetime)}
                </p>
              </div>
            )}

            {event.location && (
              <div style={{ marginBottom: 16 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginBottom: 4,
                    fontFamily: fonts.body,
                  }}
                >
                  Локація
                </p>
                <p style={{ fontSize: 14, color: colors.text, fontWeight: 600, fontFamily: fonts.body }}>
                  {event.location}
                </p>
              </div>
            )}

            {event.max_participants && (
              <div style={{ marginBottom: 24 }}>
                <p
                  style={{
                    fontSize: 12,
                    color: colors.textMuted,
                    marginBottom: 4,
                    fontFamily: fonts.body,
                  }}
                >
                  Місць
                </p>
                <p style={{ fontSize: 14, color: colors.text, fontWeight: 600, fontFamily: fonts.body }}>
                  до {event.max_participants} учасників
                </p>
              </div>
            )}

            {user ? (
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: radius.md,
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  background: colors.primary,
                  color: colors.white,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Зареєструватись на подію
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: radius.md,
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  background: colors.primary,
                  color: colors.white,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Увійти для реєстрації
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
