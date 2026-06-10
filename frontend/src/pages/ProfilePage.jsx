import { useState, useEffect } from "react";
 
const API = "http://127.0.0.1:8000";
 
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
}
 
function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}
 
function getDay(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).getDate();
}
 
function getMonthShort(dateStr) {
  if (!dateStr) return "";
  const months = ["ЛСЧ", "ЛТ", "БРЗ", "КВТ", "ТРВ", "ЧРВ", "ЛПН", "СРП", "ВРС", "ЖВТ", "ЛСТ", "ГРД"];
  return months[new Date(dateStr).getMonth()];
}
 
const MONTH_SHORT = ["СІЧ","ЛЮТ","БЕР","КВІ","ТРА","ЧЕР","ЛИП","СЕР","ВЕР","ЖОВ","ЛИС","ГРУ"];
function getMonthAbbr(dateStr) {
  if (!dateStr) return "";
  return MONTH_SHORT[new Date(dateStr).getMonth()];
}
 
const InfoField = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
    <span style={{ fontSize: 15, fontWeight: 600, color: "#0f172a" }}>{value || "—"}</span>
  </div>
);
 
export function ProfilePage({ user, onViewChange }) {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("upcoming");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", faculty: "", year: "" });
  const [saveMsg, setSaveMsg] = useState("");
 
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
 
    Promise.all([
      fetch(`${API}/users/me`, { headers }).then((r) => r.json()),
      fetch(`${API}/users/me/registrations`, { headers }).then((r) => r.json()),
    ])
      .then(([prof, regs]) => {
        setProfile(prof);
        setRegistrations(Array.isArray(regs) ? regs : []);
        setEditForm({
          full_name: prof.full_name || "",
          faculty: prof.faculty || "",
          year: prof.year || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);
 
  const now = new Date();
  const upcoming = registrations.filter((r) => new Date(r.event.start_datetime) >= now);
  const past = registrations.filter((r) => new Date(r.event.start_datetime) < now);
  const displayed = tab === "upcoming" ? upcoming : past;
 
  const [firstName, lastName] = (profile?.full_name || " ").split(" ");
  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "СТ";
 
  const roleLabel = profile?.role === "student" ? "Студент" : profile?.role || "Студент";
 
  if (!user) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "#94a3b8", fontSize: 16 }}>Увійдіть, щоб переглянути профіль</p>
    </div>
  );
 
  if (loading) return (
    <div style={{ textAlign: "center", padding: 80, color: "#94a3b8" }}>Завантаження...</div>
  );
 
  return (
    <div style={{ maxWidth: 780, margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
 
      {/* Profile Header Card */}
      <div style={{
        background: "#fff", borderRadius: 20, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
        border: "2px dashed #c7d7f5",
      }}>
        {/* Avatar row */}
        <div style={{ padding: "28px 32px 20px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 22, color: "#2563eb", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 2 }}>
              {profile?.full_name || user.email}
            </h2>
            <p style={{ fontSize: 13, color: "#94a3b8" }}>{profile?.email || user.email}</p>
          </div>
        </div>
 
        {/* Personal data section */}
        <div style={{ borderTop: "1.5px dashed #c7d7f5", padding: "20px 32px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Особисті дані</h3>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Ваша основна інформація в системі</p>
            </div>
            <button
              onClick={() => { setEditing(!editing); setSaveMsg(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "none", border: "1.5px solid #e2e8f0", borderRadius: 8,
                padding: "6px 12px", fontSize: 13, fontWeight: 600,
                color: "#2563eb", cursor: "pointer",
              }}
            >
              ✏️ {editing ? "Скасувати" : "Редагувати"}
            </button>
          </div>
 
          {editing ? (
            <EditForm
              form={editForm}
              setForm={setEditForm}
              email={profile?.email}
              role={roleLabel}
              onSave={() => {
                // In a real app, PATCH /users/me here
                setProfile((p) => ({ ...p, full_name: editForm.full_name }));
                setEditing(false);
                setSaveMsg("Збережено");
                setTimeout(() => setSaveMsg(""), 3000);
              }}
            />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 32px" }}>
              <InfoField label="Ім'я" value={firstName} />
              <InfoField label="Прізвище" value={lastName} />
              <InfoField label="Email" value={profile?.email} />
              <InfoField label="Роль" value={roleLabel} />
              <InfoField label="Факультет" value={profile?.faculty || "Факультет інформатики"} />
              <InfoField label="Рік навчання" value={profile?.year ? `${profile.year} курс` : "3 курс"} />
            </div>
          )}
 
          {saveMsg && (
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 13 }}>
              ✓ {saveMsg}
            </div>
          )}
        </div>
      </div>
 
      {/* Events Section */}
      <div style={{
        background: "#fff", borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "2px dashed #c7d7f5", overflow: "hidden",
      }}>
        <div style={{ padding: "24px 32px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Мої події</h3>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>Зареєстровані та відвідані заходи</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["upcoming", "past"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: "1.5px solid",
                    borderColor: tab === t ? "#2563eb" : "#e2e8f0",
                    background: tab === t ? "#eff6ff" : "#fff",
                    color: tab === t ? "#2563eb" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {t === "upcoming" ? "Майбутні" : "Минулі"}
                </button>
              ))}
            </div>
          </div>
        </div>
 
        <div style={{ padding: "0 32px 24px" }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 14 }}>
              {tab === "upcoming" ? "Немає майбутніх подій" : "Немає минулих подій"}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {displayed.map((reg) => (
                <EventRow key={reg.registration_id} reg={reg} />
              ))}
            </div>
          )}
 
          {registrations.length > 0 && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                onClick={() => onViewChange?.("events")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                  border: "none", background: "#eff6ff", color: "#2563eb", cursor: "pointer",
                }}
              >
                📋 Переглянути всі події
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 
function EventRow({ reg }) {
  const d = reg.event.start_datetime;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16,
      padding: "14px 0", borderBottom: "1px solid #f1f5f9",
    }}>
      {/* Date badge */}
      <div style={{
        width: 44, flexShrink: 0, textAlign: "center",
        background: "#eff6ff", borderRadius: 10, padding: "6px 4px",
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{getDay(d)}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.04em" }}>{getMonthAbbr(d)}</div>
      </div>
 
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {reg.event.title}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {reg.event.location && (
            <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
              📍 {reg.event.location}
            </span>
          )}
          {d && (
            <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
              🕐 {formatTime(d)}
            </span>
          )}
        </div>
      </div>
 
      <span style={{ color: "#cbd5e1", fontSize: 16, flexShrink: 0 }}>›</span>
    </div>
  );
}
 
function EditForm({ form, setForm, email, role, onSave }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px", marginBottom: 16 }}>
        {[
          { label: "Ім'я", key: "full_name", placeholder: "Іван" },
          { label: "Прізвище", key: "last_name", placeholder: "Петренко", disabled: true },
        ].map(({ label, key, placeholder, disabled }) => (
          <div key={key}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>{label}</label>
            <input
              value={key === "full_name" ? form.full_name : ""}
              onChange={(e) => !disabled && setForm((f) => ({ ...f, [key]: e.target.value }))}
              disabled={disabled}
              placeholder={placeholder}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14,
                border: "1.5px solid #e2e8f0", background: disabled ? "#f8fafc" : "#fff",
                color: disabled ? "#94a3b8" : "#0f172a", outline: "none",
              }}
            />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Email</label>
          <input value={email} disabled style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", outline: "none" }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Роль</label>
          <input value={role} disabled style={{ width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e2e8f0", background: "#f8fafc", color: "#94a3b8", outline: "none" }} />
        </div>
      </div>
      <button
        onClick={onSave}
        style={{
          padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700,
          border: "none", background: "linear-gradient(135deg, #1a56db, #3b82f6)",
          color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.25)",
        }}
      >
        Зберегти зміни
      </button>
    </div>
  );
}