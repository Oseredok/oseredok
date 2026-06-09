export function SkeletonCard() {
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e8edf5",
      borderRadius: 18,
      padding: "28px 28px",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
        <div style={{ width: 70, height: 20, borderRadius: 99, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      </div>
      <div style={{ width: "65%", height: 18, borderRadius: 6, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginBottom: 10 }} />
      <div style={{ width: "100%", height: 13, borderRadius: 6, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginBottom: 7 }} />
      <div style={{ width: "80%", height: 13, borderRadius: 6, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    </div>
  );
}