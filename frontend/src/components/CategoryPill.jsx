import { categoryColors } from "../constants/categoryColors";

export function CategoryPill({ cat, small }) {
  const color = categoryColors[cat] || categoryColors.default;
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "2px 10px" : "3px 12px",
      borderRadius: 99,
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      background: color + "18",
      color,
      border: `1px solid ${color}40`,
      whiteSpace: "nowrap",
    }}>{cat}</span>
  );
}