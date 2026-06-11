import { useState } from "react";
import { categoryColors, colors, fonts, radius, shadows } from "../../theme/tokens";
import CategoryPill from "../CategoryPill";
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
        }}
      >
        {event.category && <CategoryPill cat={event.category} small />}
      </div>

      <div style={{ padding: compact ? 16 : 20, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: compact ? 16 : 18,
            fontWeight: 700,
            color: colors.text,
            fontFamily: fonts.heading,
            lineHeight: 1.3,
          }}
        >
          {event.title}
        </h3>

        {event.org_name && (
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 13,
              color: colors.primary,
              fontWeight: 600,
              fontFamily: fonts.body,
            }}
          >
            {event.org_name || event.organization_name}
          </p>
        )}

        <div style={{ marginBottom: 16, flexGrow: 1 }}>
          {event.start_datetime && (
            <p
              style={{
                margin: "0 0 4px",
                fontSize: 13,
                color: colors.textSecondary,
                fontFamily: fonts.body,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <IconCalendar size={14} color={colors.textMuted} />
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
                alignItems: "center",
                gap: 6,
              }}
            >
              <IconMapPin size={14} color={colors.textMuted} />
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
            padding: "10px 16px",
            borderRadius: radius.md,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: hovered ? colors.primaryHover : colors.primary,
            color: colors.white,
            cursor: "pointer",
            transition: "background 0.15s",
            fontFamily: fonts.body,
          }}
        >
          Детальніше
        </button>
      </div>
    </div>
  );
}
