import CategoryPill from "../components/CategoryPill";
import { IconArrowLeft } from "../components/ui/Icons";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

export default function OrgDetailPage({ org, onBack }) {
  const color = categoryColors[org.category] || categoryColors.default;
  const initial = org.name[0]?.toUpperCase() || "?";

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
        <IconArrowLeft size={16} />
        Назад до організацій
      </button>

      <div
        style={{
          height: 200,
          borderRadius: `${radius.xl}px ${radius.xl}px 0 0`,
          background: org.logo_url
            ? `url(${org.logo_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 800,
          color: colors.white,
          fontFamily: fonts.heading,
        }}
      >
        {!org.logo_url && initial}
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
          <div style={{ marginBottom: 12 }}>
            {org.category && <CategoryPill cat={org.category} />}
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {org.name}
          </h1>
          <p
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              lineHeight: 1.8,
              fontFamily: fonts.body,
            }}
          >
            {org.description || "Студентська організація НаУКМА"}
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
              Контакти
            </h3>

            {org.contact_email && (
              <a
                href={`mailto:${org.contact_email}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: radius.md,
                  fontSize: 14,
                  fontWeight: 600,
                  background: colors.surface,
                  color: colors.primary,
                  border: `1px solid ${colors.border}`,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  fontFamily: fonts.body,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.background = colors.primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.background = colors.surface;
                }}
              >
                ✉ {org.contact_email}
              </a>
            )}

            {org.category && (
              <div style={{ marginTop: 16 }}>
                <p
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    marginBottom: 6,
                    fontFamily: fonts.body,
                  }}
                >
                  Категорія
                </p>
                <CategoryPill cat={org.category} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
