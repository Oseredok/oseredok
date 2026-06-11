import { useState } from "react";
import { categoryColors, colors, fonts, radius, shadows } from "../../theme/tokens";
import CategoryPill from "../CategoryPill";

export default function OrgCard({ org, idx, onNavigate, compact = false }) {
  const [hovered, setHovered] = useState(false);
  const color = categoryColors[org.category] || categoryColors.default;
  const initial = org.name[0]?.toUpperCase() || "?";

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(org)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onNavigate(org)}
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
          background: org.logo_url
            ? `url(${org.logo_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: compact ? 28 : 36,
          fontWeight: 800,
          color: colors.white,
          fontFamily: fonts.heading,
        }}
      >
        {!org.logo_url && initial}
      </div>

      <div style={{ padding: compact ? 16 : 20, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {org.category && (
          <div style={{ marginBottom: 10 }}>
            <CategoryPill cat={org.category} small />
          </div>
        )}

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
          {org.name}
        </h3>

        <p
          style={{
            margin: "0 0 16px",
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flexGrow: 1,
            fontFamily: fonts.body,
          }}
        >
          {org.description || "Студентська організація НаУКМА"}
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(org);
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
