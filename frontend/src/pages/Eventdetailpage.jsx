import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(start, end) {
  if (!start || !end) return "";
  const ms = new Date(end) - new Date(start);
  const h = Math.round(ms / 3600000);
  return `${h} год`;
}

const InfoChip = ({ icon, text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontSize: 13, fontWeight: 500 }}>
    <span style={{ fontSize: 15 }}>{icon}</span>
    <span>{text}</span>
  </div>
);

const DetailRow = ({ icon, label, value, bold }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
    <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{icon}</span>
    <span style={{ fontSize: 14, color: "#64748b", minWidth: 0, flex: 1 }}>
      {label && <span style={{ color: "#94a3b8", marginRight: 6 }}>{label}</span>}
      <span style={{ color: "#0f172a", fontWeight: bold ? 700 : 500 }}>{value}</span>
    </span>
  </div>
);

export function EventDetailPage({ event, onBack, user, onLoginRequired, onNavigateToOrg }) {
  const [eventData, setEventData] = useState(event || null);
  const [loading, setLoading] = useState(!event);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  useEffect(() => {
    if (!event) return;
    setEventData(event);
    setLoading(false);
    setRegSuccess(false);
    setIsRegistered(false);
    setServerMsg("");
  }, [event]);

  // Check if already registered
  useEffect(() => {
    if (!user || !eventData) return;
    const token = localStorage.getItem("token");
    fetch(`${API}/users/me/registrations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.some((r) => r.event?.event_id === eventData.event_id);
          setIsRegistered(found);
        }
      })
      .catch(() => {});
  }, [user, eventData]);

  const handleRegisterClick = () => {
    if (!user) { onLoginRequired?.(); return; }
    setShowRegModal(true);
    setServerMsg("");
  };

  const handleConfirmRegister = async () => {
    setRegistering(true);
    setServerMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/events/${eventData.event_id}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.status === 200 || res.status === 201) {
        setIsRegistered(true);
        setRegSuccess(true);
        setShowRegModal(false);
        setEventData((prev) => ({ ...prev, participants_count: (prev.participants_count || 0) + 1 }));
      } else if (res.status === 409) {
        setServerMsg("Ви вже зареєстровані на цю подію");
      } else if (res.status === 400) {
        setServerMsg("Місця закінчилися");
      } else {
        setServerMsg("Щось пішло не так");
      }
    } catch {
      setServerMsg("Немає зв'язку з сервером");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelReg = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API}/events/${eventData.event_id}/register`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsRegistered(false);
      setRegSuccess(false);
      setEventData((prev) => ({ ...prev, participants_count: Math.max(0, (prev.participants_count || 1) - 1) }));
    } catch {}
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 15 }}>Завантаження...</div>
  );
  if (!eventData) return null;

  const spotsLeft = eventData.max_participants
    ? eventData.max_participants - (eventData.participants_count || 0)
    : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;
  const progressPct = eventData.max_participants
    ? Math.min(100, Math.round(((eventData.participants_count || 0) / eventData.max_participants) * 100))
    : 0;

  const dateLabel = `${formatDate(eventData.start_datetime)}, ${formatTime(eventData.start_datetime)} — ${formatTime(eventData.end_datetime)}`;

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", color: "#2563eb",
          fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 24, padding: 0,
        }}
      >
        ← Назад до подій
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* LEFT: Main content */}
        <div>
          {/* Header card */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 36px 28px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 16, lineHeight: 1.2 }}>
              {eventData.title}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <InfoChip icon="🕐" text={`${formatDate(eventData.start_datetime)}, ${formatTime(eventData.start_datetime)}`} />
              <InfoChip icon="📍" text={eventData.location} />
              <InfoChip icon="👥" text={eventData.max_participants ? `до ${eventData.max_participants} осіб` : "Без обмежень"} />
              {eventData.start_datetime && eventData.end_datetime && (
                <InfoChip icon="📅" text={`Офлайн, ${formatDuration(eventData.start_datetime, eventData.end_datetime)}`} />
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 36px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Про подію</h2>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.75, whiteSpace: "pre-line" }}>
              {eventData.description || "Опис відсутній."}
            </p>
          </div>
        </div>

        {/* RIGHT: Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Registration card */}
          <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

            {/* Progress bar */}
            {eventData.max_participants && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Зареєстровано</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                    {eventData.participants_count || 0} / {eventData.max_participants} місць
                  </span>
                </div>
                <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${progressPct}%`,
                    background: isFull ? "#ef4444" : "linear-gradient(90deg, #2563eb, #60a5fa)",
                    borderRadius: 99, transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            )}

            <DetailRow icon="🕐" value={dateLabel} />
            <DetailRow icon="📍" value={eventData.location} />
            <DetailRow icon="💵" label="Участь" value="безкоштовна" bold />
            <div style={{ height: 8 }} />

            {/* Success state */}
            {regSuccess && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>
                ✓ Ви успішно зареєстровані!
              </div>
            )}

            {serverMsg && (
              <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, marginBottom: 12 }}>
                {serverMsg}
              </div>
            )}

            {isRegistered ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ padding: "12px", borderRadius: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
                  ✓ Ви зареєстровані
                </div>
                <button
                  onClick={handleCancelReg}
                  style={{
                    width: "100%", padding: "11px", borderRadius: 12, fontSize: 13, fontWeight: 600,
                    border: "1.5px solid #fecaca", background: "#fff", color: "#ef4444", cursor: "pointer",
                  }}
                >
                  Скасувати реєстрацію
                </button>
              </div>
            ) : (
              <button
                onClick={handleRegisterClick}
                disabled={isFull}
                style={{
                  width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                  border: "none",
                  background: isFull ? "#e2e8f0" : "linear-gradient(135deg, #1a56db, #3b82f6)",
                  color: isFull ? "#94a3b8" : "#fff",
                  cursor: isFull ? "not-allowed" : "pointer",
                  boxShadow: isFull ? "none" : "0 4px 14px rgba(26,86,219,0.3)",
                  transition: "all 0.15s",
                }}
              >
                {isFull ? "Місця закінчились" : "Зареєструватись на подію"}
              </button>
            )}
          </div>

          {/* Organizer card */}
          {eventData.organization_name && (
            <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Організатор</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12, background: "#2563eb",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 16,
                }}>
                  {eventData.organization_logo
                    ? <img src={eventData.organization_logo} alt="" style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} />
                    : (eventData.organization_name?.[0] || "О")}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{eventData.organization_name}</div>
                </div>
              </div>
              {onNavigateToOrg && eventData.organization_id && (
                <button
                  onClick={() => onNavigateToOrg({ organization_id: eventData.organization_id, name: eventData.organization_name })}
                  style={{
                    width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                    border: "1.5px solid #e2e8f0", background: "#fff", color: "#2563eb",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#2563eb"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                >
                  Переглянути організацію
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      {showRegModal && (
        <RegistrationModal
          event={eventData}
          user={user}
          onClose={() => setShowRegModal(false)}
          onConfirm={handleConfirmRegister}
          loading={registering}
          serverMsg={serverMsg}
        />
      )}
    </div>
  );
}

// ─── Registration Modal ───────────────────────────────────────────────────────

function RegistrationModal({ event, user, onClose, onConfirm, loading, serverMsg }) {
  const spotsLeft = event.max_participants
    ? event.max_participants - (event.participants_count || 0)
    : null;
  const progressPct = event.max_participants
    ? Math.min(100, Math.round(((event.participants_count || 0) / event.max_participants) * 100))
    : 0;

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "ІП";
  const dateLabel = `${formatDate(event.start_datetime)}, ${formatTime(event.start_datetime)} — ${formatTime(event.end_datetime)}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, padding: "28px 28px 24px",
          width: "100%", maxWidth: 380,
          boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
          animation: "slideUp 0.25s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #1a56db, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 18 }}>📋</span>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Реєстрація на подію</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{event.title}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 2 }}>✕</button>
        </div>

        {/* User profile row */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Ваш профіль</p>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", background: "#f8fafc",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: "#dbeafe",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 13, color: "#2563eb",
              }}>
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{user?.full_name || user?.email}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{user?.email}</div>
              </div>
            </div>
            <span style={{ fontSize: 18 }}>✅</span>
          </div>
        </div>

        {/* Event details */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Деталі події</p>
          <div style={{ padding: "14px", borderRadius: 12, background: "#f8fafc", border: "1.5px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
              <span>📅</span> <span>{dateLabel}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
              <span>📍</span> <span>{event.location}</span>
            </div>
            {event.max_participants && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569" }}>
                <span>👥</span> <span>Команди до 5 осіб</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {event.max_participants && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Записалось місць:</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                {event.participants_count || 0} з {event.max_participants}
              </span>
            </div>
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #2563eb, #60a5fa)", borderRadius: 99 }} />
            </div>
          </div>
        )}

        {serverMsg && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, marginBottom: 12 }}>
            {serverMsg}
          </div>
        )}

        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            border: "none", background: loading ? "#e2e8f0" : "linear-gradient(135deg, #1a56db, #3b82f6)",
            color: loading ? "#94a3b8" : "#fff", cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 14px rgba(26,86,219,0.3)",
            transition: "all 0.15s",
          }}
        >
          {loading ? "Реєстрація..." : "Підтвердити участь"}
        </button>
      </div>
    </div>
  );
}