import { useState } from "react";
import EventCard from "../components/cards/EventCard";
import { mockEvents } from "../data/mockEvents";
import { colors, fonts, radius, shadows } from "../theme/tokens";

export default function ProfilePage({ user, onNavigateToEvent }) {
  const [tab, setTab] = useState("events");
  const myEvents = mockEvents.slice(0, 2);

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: 16, color: colors.textSecondary, fontFamily: fonts.body }}>
          Увійди, щоб переглянути профіль
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 800, margin: "0 auto" }}>
      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`,
          boxShadow: shadows.sm,
          padding: 32,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: colors.primary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: colors.white,
            fontWeight: 800,
            margin: "0 auto 16px",
            fontFamily: fonts.heading,
          }}
        >
          {user.email[0].toUpperCase()}
        </div>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: colors.text,
            marginBottom: 4,
            fontFamily: fonts.heading,
          }}
        >
          Мій профіль
        </h1>
        <p style={{ fontSize: 15, color: colors.textSecondary, fontFamily: fonts.body }}>
          {user.email}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          background: colors.borderLight,
          borderRadius: radius.md,
          padding: 4,
        }}
      >
        {[
          { id: "events", label: "Мої події" },
          { id: "organizations", label: "Мої організації" },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: radius.sm,
              fontSize: 14,
              fontWeight: tab === id ? 700 : 500,
              border: "none",
              background: tab === id ? colors.surface : "transparent",
              color: tab === id ? colors.primary : colors.textSecondary,
              cursor: "pointer",
              boxShadow: tab === id ? shadows.sm : "none",
              transition: "all 0.15s",
              fontFamily: fonts.body,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "events" && (
        <div>
          {myEvents.length > 0 ? (
            <div className="cards-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
              {myEvents.map((event, i) => (
                <EventCard
                  key={event.event_id}
                  event={event}
                  idx={i}
                  compact
                  onNavigate={onNavigateToEvent}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                background: colors.surface,
                borderRadius: radius.lg,
                border: `1px solid ${colors.borderLight}`,
              }}
            >
              <p style={{ fontSize: 15, color: colors.textMuted, fontFamily: fonts.body }}>
                Ти ще не зареєстрований на жодну подію
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "organizations" && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 20px",
            background: colors.surface,
            borderRadius: radius.lg,
            border: `1px solid ${colors.borderLight}`,
          }}
        >
          <p style={{ fontSize: 15, color: colors.textMuted, fontFamily: fonts.body }}>
            Ти ще не долучився до жодної організації
          </p>
        </div>
      )}
    </div>
  );
}
