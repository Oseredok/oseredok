import { useState, useEffect } from "react";
import { categoryColors } from "../constants/categoryColors";
import { CategoryPill } from "../components/CategoryPill";

const API = "http://127.0.0.1:8000";

function getDay(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).getDate();
}

const MONTH_SHORT = ["СІЧ","ЛЮТ","БЕР","КВІ","ТРА","ЧЕР","ЛИП","СЕР","ВЕР","ЖОВ","ЛИС","ГРУ"];
function getMonthAbbr(dateStr) {
  if (!dateStr) return "";
  return MONTH_SHORT[new Date(dateStr).getMonth()];
}

function statusLabel(event) {
  const now = new Date();
  const start = new Date(event.start_datetime);
  const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Завершено", bg: "#f1f5f9", color: "#94a3b8" };
  if (diff === 0) return { label: "Сьогодні", bg: "#fef9c3", color: "#ca8a04" };
  if (diff <= 3) return { label: "Незабаром", bg: "#dcfce7", color: "#16a34a" };
  return { label: "Реєстрація", bg: "#dbeafe", color: "#2563eb" };
}

export function OrgDetailPage({ org, onBack }) {
  const color = categoryColors[org.category] || "#2563eb";
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    // ✅ використовуємо існуючий endpoint з фільтром
    fetch(`${API}/events?organization_id=${org.organization_id}`)
      .then(r => r.json())
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [org.organization_id]);

  const contacts = [
    org.contact_email && { icon: "✉", label: org.contact_email, href: `mailto:${org.contact_email}` },
    org.instagram && { icon: "📷", label: org.instagram, href: `https://instagram.com/${org.instagram.replace("@", "")}` },
    org.telegram && { icon: "✈", label: org.telegram, href: `https://t.me/${org.telegram.replace("@", "")}` },
    org.website && { icon: "🌐", label: org.website, href: org.website },
  ].filter(Boolean);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>  {/* ✅ прибрали maxWidth щоб було на всю ширину як у інших сторінок */}

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
          border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155",
          cursor: "pointer", marginBottom: 24, transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.color = "#2563eb"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
      >
        ← Назад до організацій
      </button>

      {/* Hero Banner */}
      <div style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
        borderRadius: "20px 20px 0 0",
        height: 120,
      }} />

      {/* Header Card */}
      <div style={{
        background: "#fff",
        borderRadius: "0 0 20px 20px",
        padding: "0 36px 28px",
        border: "1.5px solid #e8edf5",
        borderTop: "none",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        marginBottom: 20,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: org.logo_url
            ? `url(${org.logo_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color}, ${color}99)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800, color: "#fff",
          fontFamily: "'Playfair Display', serif",
          border: "3px solid #fff",
          boxShadow: `0 4px 16px ${color}40`,
          marginTop: -36, marginBottom: 16,
        }}>
          {!org.logo_url && org.name[0]}
        </div>

        <h1 style={{
          fontSize: 26, fontWeight: 800, color: "#0f172a",
          fontFamily: "'Playfair Display', serif", marginBottom: 8,
        }}>
          {org.name}
        </h1>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {org.category && <CategoryPill cat={org.category} />}
          {org.faculty && (
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              📍 {org.faculty}
            </span>
          )}
        </div>
      </div>

      {/* About */}
      {org.description && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: "24px 32px",
          border: "1.5px solid #e8edf5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Про організацію</h2>
          </div>
          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
            {org.description}
          </p>
        </div>
      )}

      {/* Events */}
      <div style={{
        background: "#fff", borderRadius: 20, padding: "24px 32px",
        border: "1.5px solid #e8edf5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Найближчі події</h2>
        </div>

        {loadingEvents && (
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Завантаження...</p>
        )}

        {!loadingEvents && events.length === 0 && (
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Немає запланованих подій</p>
        )}

        {!loadingEvents && events.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {events.map((event, i) => {
              const status = statusLabel(event);
              return (
                <div key={event.event_id} style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 0",
                  borderBottom: i < events.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  {/* Date badge */}
                  <div style={{
                    width: 44, flexShrink: 0, textAlign: "center",
                    background: "#eff6ff", borderRadius: 10, padding: "6px 4px",
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
                      {getDay(event.start_datetime)}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase" }}>
                      {getMonthAbbr(event.start_datetime)}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {event.title}
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {event.location && (
                        <span style={{ fontSize: 12, color: "#64748b" }}>📍 {event.location}</span>
                      )}
                      {event.start_datetime && (
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          🕐 {new Date(event.start_datetime).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <span style={{
                    padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: status.bg, color: status.color, flexShrink: 0,
                  }}>
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Contacts */}
      {contacts.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 20, padding: "24px 32px",
          border: "1.5px solid #e8edf5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🔗</span>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Контакти</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {contacts.map((c, i) => (
              <a key={i} href={c.href} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 10,
                fontSize: 14, color: "#334155", textDecoration: "none", fontWeight: 500,
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                onMouseLeave={e => e.currentTarget.style.color = "#334155"}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{c.icon}</span>
                {c.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}