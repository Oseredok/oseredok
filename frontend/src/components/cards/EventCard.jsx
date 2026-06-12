import { useState } from "react";
import { categoryColors, colors, fonts, radius, shadows } from "../../theme/tokens";
import { IconCalendar, IconMapPin } from "../ui/Icons";

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventCard({ event, idx, onNavigate, compact = false }) {
  const [hovered, setHovered] = useState(false);
  const color = categoryColors[event.category] || categoryColors.default;
  const orgName = event.org_name || event.organization_name;

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(event)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate(event)}
      style={{
        background: colors.surface,
        border: `1px solid ${hovered ? color + "60" : colors.borderLight}`,
        borderRadius: radius.lg,
        overflow: "hidden",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? shadows.md : shadows.sm,
        animationDelay: `${idx * 60}ms`,
        animation: "fadeUp 0.45s ease both",
        display: "flex",
        flexDirection: "column",
        outline: "none",
      }}
    >
      <div
        style={{
          height: compact ? 100 : 140,
          background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
          display: "flex",
          alignItems: "flex-end",
          padding: 16,
          flexShrink: 0,
        }}
      >
        {event.category && (
          <span
            style={{
              padding: "5px 12px",
              borderRadius: radius.pill,
              background: "rgba(9, 30, 66, 0.35)",
              color: colors.white,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: fonts.body,
            }}
          >
            {event.category}
          </span>
        )}
      </div>

      <div
        style={{
          padding: compact ? "18px 20px 20px" : "22px 24px 24px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          background: colors.surface,
          gap: 0,
        }}
      >
        <h3
          style={{
            margin: "0 0 10px",
            fontSize: compact ? 16 : 18,
            fontWeight: 700,
            color: colors.text,
            fontFamily: fonts.heading,
            lineHeight: 1.35,
          }}
        >
          {event.title}
        </h3>

        {orgName && (
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 14,
              color: colors.primary,
              fontWeight: 600,
              fontFamily: fonts.body,
              lineHeight: 1.4,
            }}
          >
            {orgName}
          </p>
        )}

        <div style={{ marginBottom: 20, flexGrow: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {event.start_datetime && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: colors.textSecondary,
                fontFamily: fonts.body,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                lineHeight: 1.5,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 2 }}>
                <IconCalendar size={14} color={colors.textMuted} />
              </span>
              {formatDate(event.start_datetime)}
            </p>
          )}
          {event.location && (
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: colors.textSecondary,
                fontFamily: fonts.body,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                lineHeight: 1.5,
              }}
            >
              <span style={{ flexShrink: 0, marginTop: 2 }}>
                <IconMapPin size={14} color={colors.textMuted} />
              </span>
              {event.location}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(event);
          }}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: radius.md,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: hovered ? colors.primaryHover : colors.primary,
            color: colors.white,
            cursor: "pointer",
            transition: "background 0.15s",
            fontFamily: fonts.body,
            marginTop: "auto",
          }}
        >
          Детальніше
        </button>
      </div>
    </div>
  );
}
