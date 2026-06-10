import { categoryColors } from "../constants/categoryColors";

const categoryIcons = {
  IT: (color) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Debates: (color) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  default: (color) => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
  const time = d.toTimeString().slice(0, 5);
  return `${day} ${months[d.getMonth()]}, ${time}`;
}

function formatDateRange(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const months = ["січня","лютого","березня","квітня","травня","червня","липня","серпня","вересня","жовтня","листопада","грудня"];
  const time = s.toTimeString().slice(0, 5);

  if (e && s.getDate() !== e.getDate()) {
    return `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}, ${time}`;
  }
  return `${s.getDate()} ${months[s.getMonth()]}, ${time}`;
}

export function EventCard({ event, idx, onNavigate }) {
  const color = categoryColors[event.category] || categoryColors.default;
  const bgColor = color + "18";
  const Icon = categoryIcons[event.category] || categoryIcons.default;
  const orgInitial = event.organization_name?.[0]?.toUpperCase() || "?";

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      border: "1px solid #e8edf5",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      animation: "fadeUp 0.45s ease both",
      animationDelay: idx * 60 + "ms",
    }}>
      {/* Верхній блок з іконкою */}
      <div style={{
        background: bgColor,
        height: 140,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}>
        <span style={{
          fontSize: 12, color: color, fontWeight: 700,
          position: "absolute", top: 12, right: 14,
        }}>
          {event.category}
        </span>
        {Icon(color)}
      </div>

      {/* Нижній блок */}
      <div style={{ padding: "16px 16px 16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12, lineHeight: 1.4 }}>
          {event.title}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748b" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {formatDateRange(event.start_datetime, event.end_datetime)}
          </div>
          {event.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748b" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {event.location}
            </div>
          )}
        </div>

        {event.organization_name && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {orgInitial}
            </div>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{event.organization_name}</span>
          </div>
        )}

        <button
          onClick={() => onNavigate && onNavigate(event)}
          style={{
            width: "100%", padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            border: "none", background: "#2563eb", color: "#fff",
            cursor: "pointer", transition: "background 0.15s", marginTop: "auto",
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