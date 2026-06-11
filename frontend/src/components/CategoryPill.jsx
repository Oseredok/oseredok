import { categoryColors, colors, fonts, radius } from "../../theme/tokens";

export default function CategoryPill({ cat, small }) {
  const color = categoryColors[cat] || categoryColors.default;
  return (
    <span
      style={{
        display: "inline-block",
        padding: small ? "2px 10px" : "4px 12px",
        borderRadius: radius.pill,
        fontSize: small ? 10 : 11,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        background: color + "18",
        color,
        border: `1px solid ${color}40`,
        whiteSpace: "nowrap",
        fontFamily: fonts.body,
      }}
    >
      {cat}
    </span>
  );
}
