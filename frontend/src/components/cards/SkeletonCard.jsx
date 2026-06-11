import { colors, radius } from "../../theme/tokens";

export default function SkeletonCard() {
  const shimmer = {
    background: "linear-gradient(90deg, #EBECF0 25%, #DFE1E6 50%, #EBECF0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  };

  return (
    <div
      style={{
        background: colors.surface,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: radius.lg,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 140, ...shimmer }} />
      <div style={{ padding: 20 }}>
        <div style={{ width: 70, height: 20, borderRadius: radius.pill, marginBottom: 12, ...shimmer }} />
        <div style={{ width: "65%", height: 18, borderRadius: 6, marginBottom: 10, ...shimmer }} />
        <div style={{ width: "100%", height: 13, borderRadius: 6, marginBottom: 7, ...shimmer }} />
        <div style={{ width: "80%", height: 13, borderRadius: 6, marginBottom: 20, ...shimmer }} />
        <div style={{ width: "100%", height: 36, borderRadius: radius.md, ...shimmer }} />
      </div>
    </div>
  );
}
