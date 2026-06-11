import { useEffect, useState } from "react";
import { API } from "../api";
import OrgCard from "../components/cards/OrgCard";
import EventCard from "../components/cards/EventCard";
import { useCount } from "../hooks/useCount";
import { colors, fonts, radius } from "../theme/tokens";

export default function HomePage({ user, orgCount, onNavigate, onOpenAuth }) {
  const [featuredOrgs, setFeaturedOrgs] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const animatedCount = useCount(orgCount);

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then((r) => r.json())
      .then((data) => setFeaturedOrgs(data.slice(0, 4)))
      .catch(() => {});
    fetch(`${API}/events`)
      .then((r) => r.json())
      .then((data) => setFeaturedEvents(data.slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section
        style={{
          textAlign: "center",
          marginBottom: 48,
          padding: "32px 0 0",
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
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.12,
            fontFamily: fonts.heading,
            color: colors.text,
            letterSpacing: "-0.03em",
            margin: "0 auto 16px",
            maxWidth: 720,
          }}
        >
          Знайди своє
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, #4C9AFF)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            місце в університеті
          </span>
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
            gap: 40,
            flexWrap: "wrap",
            marginBottom: 8,
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

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          animation: "fadeUp 0.6s ease 0.15s both",
        }}
        className="home-split"
      >
        <div
          style={{
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.borderLight}`,
            padding: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(22px, 3vw, 28px)",
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: `2px solid ${colors.primaryLight}`,
            }}
          >
            Організації
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
            {featuredOrgs.length > 0 ? (
              featuredOrgs.map((org, i) => (
                <OrgCard
                  key={org.organization_id}
                  org={org}
                  idx={i}
                  compact
                  onNavigate={() => onNavigate("organizations", org)}
                />
              ))
            ) : (
              <p style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", padding: 24 }}>
                Організації завантажуються...
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate("organizations")}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px 20px",
              borderRadius: radius.md,
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              background: colors.primary,
              color: colors.white,
              cursor: "pointer",
              fontFamily: fonts.body,
              boxShadow: "0 2px 8px rgba(0,82,204,0.25)",
            }}
          >
            Всі організації →
          </button>
        </div>

        <div
          style={{
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.borderLight}`,
            padding: 24,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(22px, 3vw, 28px)",
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: `2px solid ${colors.primaryLight}`,
            }}
          >
            Події
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, flexGrow: 1 }}>
            {featuredEvents.length > 0 ? (
              featuredEvents.map((event, i) => (
                <EventCard
                  key={event.event_id}
                  event={{
                    ...event,
                    org_name: event.org_name || event.organization_name,
                  }}
                  idx={i}
                  compact
                  onNavigate={() => onNavigate("events", event)}
                />
              ))
            ) : (
              <p style={{ color: colors.textMuted, fontSize: 14, textAlign: "center", padding: 24 }}>
                Події завантажуються...
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate("events")}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "12px 20px",
              borderRadius: radius.md,
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              background: colors.primary,
              color: colors.white,
              cursor: "pointer",
              fontFamily: fonts.body,
              boxShadow: "0 2px 8px rgba(0,82,204,0.25)",
            }}
          >
            Всі події →
          </button>
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
            marginTop: 48,
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
              border: "2px solid rgba(255,255,255,0.5)",
              background: colors.white,
              color: colors.primary,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Приєднатись безкоштовно →
          </button>
        </section>
      )}
    </div>
  );
}
