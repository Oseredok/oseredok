import { useEffect, useState } from "react";
import { API } from "../api";
import OrgCard from "../components/cards/OrgCard";
import EventCard from "../components/cards/EventCard";
import { mockEvents } from "../data/mockEvents";
import { useCount } from "../hooks/useCount";
import { colors, fonts, radius, shadows } from "../theme/tokens";

export default function HomePage({ user, orgCount, onNavigate, onOpenAuth }) {
  const [featuredOrgs, setFeaturedOrgs] = useState([]);
  const animatedCount = useCount(orgCount);

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then((r) => r.json())
      .then((data) => setFeaturedOrgs(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const featuredEvents = mockEvents.slice(0, 3);

  return (
    <div>
      <section
        style={{
          textAlign: "center",
          marginBottom: 56,
          padding: "48px 0 0",
          animation: "fadeUp 0.6s ease both",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "5px 16px",
            borderRadius: radius.pill,
            background: colors.primaryLight,
            color: colors.primary,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: fonts.body,
          }}
        >
          НаУКМА · Студентська спільнота
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.15,
            fontFamily: fonts.heading,
            color: colors.text,
            letterSpacing: "-0.03em",
            marginBottom: 16,
            maxWidth: 640,
            margin: "0 auto 16px",
          }}
        >
          Запрошуємо до{" "}
          <span style={{ color: colors.primary }}>спільноти</span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: colors.textSecondary,
            maxWidth: 520,
            margin: "0 auto 32px",
            lineHeight: 1.7,
            fontFamily: fonts.body,
          }}
        >
          Платформа для пошуку студентських організацій та реєстрації на події НаУКМА
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 40,
          }}
        >
          <button
            type="button"
            onClick={() => onNavigate("events")}
            style={{
              padding: "12px 28px",
              borderRadius: radius.md,
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              background: colors.primary,
              color: colors.white,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,82,204,0.25)",
              transition: "background 0.15s",
              fontFamily: fonts.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primary;
            }}
          >
            Переглянути події
          </button>
          <button
            type="button"
            onClick={() => onNavigate("organizations")}
            style={{
              padding: "12px 28px",
              borderRadius: radius.md,
              fontSize: 15,
              fontWeight: 700,
              border: `1.5px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              cursor: "pointer",
              transition: "all 0.15s",
              fontFamily: fonts.body,
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
            Організації
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "організацій", value: animatedCount },
            { label: "активних членів", value: "200+" },
            { label: "подій на рік", value: "50+" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: colors.primary,
                  fontFamily: fonts.heading,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  fontWeight: 500,
                  fontFamily: fonts.body,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 48, animation: "fadeUp 0.6s ease 0.1s both" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
            }}
          >
            Організації
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("organizations")}
            style={{
              background: "none",
              border: "none",
              color: colors.primary,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Дивитись всі →
          </button>
        </div>
        <div className="cards-grid">
          {featuredOrgs.map((org, i) => (
            <OrgCard
              key={org.organization_id}
              org={org}
              idx={i}
              compact
              onNavigate={() => onNavigate("organizations", org)}
            />
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 48, animation: "fadeUp 0.6s ease 0.2s both" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
            }}
          >
            Події
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("events")}
            style={{
              background: "none",
              border: "none",
              color: colors.primary,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Дивитись всі →
          </button>
        </div>
        <div className="cards-grid">
          {featuredEvents.map((event, i) => (
            <EventCard
              key={event.event_id}
              event={event}
              idx={i}
              compact
              onNavigate={() => onNavigate("events", event)}
            />
          ))}
        </div>
      </section>

      {!user && (
        <section
          style={{
            textAlign: "center",
            padding: "40px 32px",
            background: colors.primary,
            borderRadius: radius.xl,
            color: colors.white,
            animation: "fadeUp 0.6s ease 0.3s both",
          }}
        >
          <h3
            style={{
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 10,
              fontFamily: fonts.heading,
            }}
          >
            Готовий долучитись?
          </h3>
          <p
            style={{
              fontSize: 15,
              opacity: 0.9,
              marginBottom: 24,
              fontFamily: fonts.body,
            }}
          >
            Зареєструйся і знаходь події та організації за інтересами
          </p>
          <button
            type="button"
            onClick={() => onOpenAuth("register")}
            style={{
              padding: "12px 32px",
              borderRadius: radius.md,
              fontSize: 15,
              fontWeight: 700,
              border: `2px solid rgba(255,255,255,0.5)`,
              background: colors.white,
              color: colors.primary,
              cursor: "pointer",
              transition: "all 0.18s",
              fontFamily: fonts.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = colors.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.white;
              e.currentTarget.style.color = colors.primary;
            }}
          >
            Приєднатись безкоштовно →
          </button>
        </section>
      )}
    </div>
  );
}
