import { useEffect, useState } from "react";
import { API } from "../api";
import { colors, fonts, radius, shadows } from "../theme/tokens";

function getDay(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).getDate();
}
const MONTH_SHORT = ["СІЧ","ЛЮТ","БЕР","КВІ","ТРА","ЧЕР","ЛИП","СЕР","ВЕР","ЖОВ","ЛИС","ГРУ"];
function getMonthAbbr(dateStr) {
  if (!dateStr) return "";
  return MONTH_SHORT[new Date(dateStr).getMonth()];
}
function formatTime(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

export function OrgDashboardPage({ user, onNavigate }) {
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveMsg, setSaveMsg] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`${API}/users/me/organization`, { headers }).then(r => r.ok ? r.json() : null),
    ])
      .then(([orgData]) => {
        if (orgData) {
          setOrg(orgData);
          setEditForm({
            name: orgData.name || "",
            description: orgData.description || "",
            contact_email: orgData.contact_email || "",
          });
          return fetch(`${API}/events?organization_id=${orgData.organization_id}`).then(r => r.json());
        }
        return [];
      })
      .then(eventsData => setEvents(Array.isArray(eventsData) ? eventsData : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const loadParticipants = (eventId) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
      return;
    }
    setSelectedEventId(eventId);
    setLoadingParticipants(true);
    fetch(`${API}/events/${eventId}/participants`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoadingParticipants(false));
  };

  const handleSaveOrg = () => {
    fetch(`${API}/organizations/${org.organization_id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setOrg(data);
        setEditing(false);
        setSaveMsg("Збережено");
        setTimeout(() => setSaveMsg(""), 3000);
      })
      .catch(() => {});
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.start_datetime) >= now);
  const pastEvents = events.filter(e => new Date(e.start_datetime) < now);

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: colors.textMuted }}>Завантаження...</div>;

  if (!org) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: colors.textMuted, fontSize: 16, marginBottom: 16 }}>
        Вас не прив'язано до жодної організації
      </p>
      <p style={{ color: colors.textMuted, fontSize: 14 }}>
        Зверніться до адміністратора
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", animation: "fadeUp 0.4s ease both" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 4 }}>
          Панель організатора
        </h1>
        <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
          Керуйте подіями та інформацією вашої організації
        </p>
      </div>

      {/* Організація */}
      <div style={{ background: colors.surface, borderRadius: radius.xl, border: `1px solid ${colors.borderLight}`, boxShadow: shadows.sm, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${colors.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: fonts.heading, marginBottom: 2 }}>
              🏛 {org.name}
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>{org.category}</p>
          </div>
          <button
            onClick={() => { setEditing(!editing); setSaveMsg(""); }}
            style={{ padding: "8px 16px", borderRadius: radius.md, fontSize: 13, fontWeight: 600, border: `1.5px solid ${colors.border}`, background: "none", color: colors.primary, cursor: "pointer", fontFamily: fonts.body }}
          >
            ✏️ {editing ? "Скасувати" : "Редагувати"}
          </button>
        </div>

        <div style={{ padding: "20px 28px" }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Назва", key: "name" },
                { label: "Опис", key: "description" },
                { label: "Контактний email", key: "contact_email" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>{label}</label>
                  {key === "description" ? (
                    <textarea
                      value={editForm[key] || ""}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      rows={3}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, resize: "vertical", boxSizing: "border-box" }}
                    />
                  ) : (
                    <input
                      value={editForm[key] || ""}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }}
                    />
                  )}
                </div>
              ))}
              <button
                onClick={handleSaveOrg}
                style={{ alignSelf: "flex-start", padding: "10px 24px", borderRadius: radius.md, fontSize: 14, fontWeight: 700, border: "none", background: colors.primary, color: colors.white, cursor: "pointer", fontFamily: fonts.body }}
              >
                Зберегти зміни
              </button>
              {saveMsg && <p style={{ fontSize: 13, color: "#16a34a", fontFamily: fonts.body }}>✓ {saveMsg}</p>}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
              {[
                { label: "Опис", value: org.description },
                { label: "Email", value: org.contact_email },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4, fontFamily: fonts.body }}>{label}</p>
                  <p style={{ fontSize: 14, color: colors.text, fontFamily: fonts.body }}>{value || "—"}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Події */}
      <div style={{ background: colors.surface, borderRadius: radius.xl, border: `1px solid ${colors.borderLight}`, boxShadow: shadows.sm, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ padding: "20px 28px", borderBottom: `1px solid ${colors.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: fonts.heading, marginBottom: 2 }}>📅 Мої події</h2>
            <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>{events.length} подій загалом</p>
          </div>
          <button
            onClick={() => onNavigate("create-event")}
            style={{ padding: "8px 18px", borderRadius: radius.md, fontSize: 13, fontWeight: 700, border: "none", background: colors.primary, color: colors.white, cursor: "pointer", fontFamily: fonts.body }}
          >
            + Нова подія
          </button>
        </div>

        <div style={{ padding: "8px 28px 24px" }}>
          {events.length === 0 && (
            <p style={{ textAlign: "center", padding: "32px 0", color: colors.textMuted, fontSize: 14, fontFamily: fonts.body }}>
              Подій ще немає
            </p>
          )}

          {upcomingEvents.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", padding: "16px 0 8px", fontFamily: fonts.body }}>Майбутні</p>
              {upcomingEvents.map(event => (
                <EventRow
                  key={event.event_id}
                  event={event}
                  isSelected={selectedEventId === event.event_id}
                  participants={selectedEventId === event.event_id ? participants : []}
                  loadingParticipants={loadingParticipants && selectedEventId === event.event_id}
                  onToggleParticipants={() => loadParticipants(event.event_id)}
                  onNavigate={onNavigate}
                />
              ))}
            </>
          )}

          {pastEvents.length > 0 && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", padding: "16px 0 8px", fontFamily: fonts.body }}>Минулі</p>
              {pastEvents.map(event => (
                <EventRow
                  key={event.event_id}
                  event={event}
                  isSelected={selectedEventId === event.event_id}
                  participants={selectedEventId === event.event_id ? participants : []}
                  loadingParticipants={loadingParticipants && selectedEventId === event.event_id}
                  onToggleParticipants={() => loadParticipants(event.event_id)}
                  onNavigate={onNavigate}
                  isPast
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, isSelected, participants, loadingParticipants, onToggleParticipants, onNavigate, isPast }) {
  return (
    <div style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
        {/* Date badge */}
        <div style={{ width: 44, flexShrink: 0, textAlign: "center", background: isPast ? colors.borderLight : "#eff6ff", borderRadius: radius.md, padding: "6px 4px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: isPast ? colors.textMuted : colors.primary, lineHeight: 1 }}>{getDay(event.start_datetime)}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: isPast ? colors.textMuted : "#93c5fd", textTransform: "uppercase" }}>{getMonthAbbr(event.start_datetime)}</div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: isPast ? colors.textSecondary : colors.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: fonts.body }}>
            {event.title}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {event.location && <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>📍 {event.location}</span>}
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>🕐 {formatTime(event.start_datetime)}</span>
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>👥 {event.participants_count ?? 0} учасників</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={onToggleParticipants}
            style={{ padding: "6px 14px", borderRadius: radius.md, fontSize: 12, fontWeight: 600, border: `1.5px solid ${isSelected ? colors.primary : colors.border}`, background: isSelected ? "#eff6ff" : "none", color: isSelected ? colors.primary : colors.textSecondary, cursor: "pointer", fontFamily: fonts.body }}
          >
            👥 Учасники
          </button>
        </div>
      </div>

      {/* Participants list */}
      {isSelected && (
        <div style={{ padding: "0 0 16px 58px" }}>
          {loadingParticipants && <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>Завантаження...</p>}
          {!loadingParticipants && participants.length === 0 && (
            <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>Немає зареєстрованих учасників</p>
          )}
          {!loadingParticipants && participants.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {participants.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: colors.primary, flexShrink: 0 }}>
                    {(p.full_name || p.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: fonts.body, marginBottom: 1 }}>{p.full_name || "—"}</p>
                    <p style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{p.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}