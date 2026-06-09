import { categoryColors } from "../constants/categoryColors";

export function OrgCard({ org, idx, onNavigate }) {
  const color = categoryColors[org.category] || categoryColors.default;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        animation: "fadeUp 0.45s ease both",
        animationDelay: idx * 60 + "ms",
      }}
    >
      {/* Верхній блок з іконкою */}
      <div style={{
        background: "#eef2fb",
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <span style={{ fontSize: 13, color: color, fontWeight: 600, position: "absolute", top: 12, right: 14 }}>
          {org.category}
        </span>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>

      {/* Нижній блок з текстом */}
      <div style={{ padding: "16px 16px 16px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          {org.name}
        </h3>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, marginBottom: 16, minHeight: 36 }}>
          {org.description || "Студентська організація НаУКМА"}
        </p>
        <button
          onClick={() => onNavigate(org)}
          style={{
            width: "100%", padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: "none", background: "#2563eb", color: "#fff",
            cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
          onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
        >
          Детальніше
        </button>
      </div>
    </div>
  );
}