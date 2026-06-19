import { useCallback, useEffect, useMemo, useState } from "react";
import { API } from "../api";
import { roleLabel } from "../utils/roles";
import {
  IconCalendar,
  IconChevronRight,
  IconClock,
  IconEdit,
  IconMapPin,
  IconUser,
} from "../components/ui/Icons";
import { colors, fonts, radius, shadows } from "../theme/tokens";
import { useToast } from "../context/ToastContext";

const MONTHS = ["СІЧ", "ЛЮТ", "БЕР", "КВІТ", "ТРАВ", "ЧЕР", "ЛИП", "СЕР", "ВЕР", "ЖОВ", "ЛИС", "ГРУ"];

function cardStyle() {
  return {
    background: colors.surface,
    borderRadius: radius.xl,
    border: `1px solid ${colors.borderLight}`,
    boxShadow: shadows.sm,
    padding: 28,
    marginBottom: 20,
  };
}

function splitName(fullName) {
  if (!fullName?.trim()) return { first: "—", last: "—" };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "—" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function getInitials(fullName, email) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() || "?";
}

function formatEventTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

function DataRow({ label, value, muted = false }) {
  return (
    <div style={{ padding: "14px 0" }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
          fontFamily: fonts.body,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: muted ? colors.textMuted : colors.text,
          fontFamily: fonts.body,
        }}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function ProfilePage({ user, onNavigateToEvent, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsTab, setEventsTab] = useState("upcoming");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", faculty: "" });
  const [saving, setSaving] = useState(false);
  const showToast = useToast();

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const [profileRes, regsRes] = await Promise.all([
        fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/users/me/registrations`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
        setEditForm({ full_name: data.full_name || "", faculty: data.faculty || "" });
      }
      if (regsRes.ok) {
        setRegistrations(await regsRes.json());
      }
    } catch {
      showToast("Не вдалося завантажити профіль", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user, fetchProfile]);

  const { first, last } = splitName(profile?.full_name);
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Користувач";
  const initials = getInitials(profile?.full_name, user?.email);

  const filteredEvents = useMemo(() => {
    const now = Date.now();
    return registrations.filter(({ event }) => {
      const start = event.start_datetime ? new Date(event.start_datetime).getTime() : 0;
      return eventsTab === "upcoming" ? start >= now : start < now;
    });
  }, [registrations, eventsTab]);

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditing(false);
        showToast("Зміни збережено", "success");
      } else {
        showToast("Не вдалося зберегти", "error");
      }
    } catch {
      showToast("Немає зв'язку з сервером", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <p style={{ fontSize: 16, color: colors.textSecondary, fontFamily: fonts.body }}>
          Увійди, щоб переглянути профіль
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: colors.textMuted, fontFamily: fonts.body }}>
        Завантаження...
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 860, margin: "0 auto" }}>
      {/* User summary */}
      <div style={{ ...cardStyle(), display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: colors.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: colors.primary,
            fontWeight: 800,
            flexShrink: 0,
            fontFamily: fonts.heading,
          }}
        >
          {initials}
        </div>
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: colors.text,
              marginBottom: 4,
              fontFamily: fonts.heading,
            }}
          >
            {displayName}
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
            {profile?.email || user.email}
          </p>
        </div>
      </div>

      {/* Personal data */}
      <div style={cardStyle()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 4 }}>
              Особисті дані
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, margin: 0 }}>
              Ваша основна інформація в системі
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: radius.md,
                fontSize: 13,
                fontWeight: 600,
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.textSecondary,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              <IconEdit size={14} />
              Редагувати
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditForm({ full_name: profile?.full_name || "", faculty: profile?.faculty || "" });
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: radius.md,
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.textSecondary,
                  cursor: "pointer",
                  fontFamily: fonts.body,
                }}
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "8px 14px",
                  borderRadius: radius.md,
                  fontSize: 13,
                  fontWeight: 700,
                  border: "none",
                  background: saving ? colors.borderLight : colors.primary,
                  color: colors.white,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: fonts.body,
                }}
              >
                {saving ? "Збереження..." : "Зберегти"}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Повне ім'я</label>
              <input
                value={editForm.full_name}
                onChange={(e) => setEditForm((f) => ({ ...f, full_name: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Факультет</label>
              <input
                value={editForm.faculty}
                onChange={(e) => setEditForm((f) => ({ ...f, faculty: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 32px",
              borderTop: `1px solid ${colors.borderLight}`,
            }}
          >
            <DataRow label="Ім'я" value={first} />
            <DataRow label="Прізвище" value={last} />
            <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${colors.borderLight}` }} />
            <DataRow label="Email" value={profile?.email || user.email} />
            <DataRow label="Роль" value={roleLabel(profile?.role)} muted />
            <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${colors.borderLight}` }} />
            <DataRow label="Факультет" value={profile?.faculty} />
            <DataRow label="Рік навчання" value="—" muted />
          </div>
        )}

        {message && (
          <p
            style={{
              marginTop: 16,
              fontSize: 13,
              color: message.includes("збережено") ? colors.success : colors.error,
              fontFamily: fonts.body,
            }}
          >
            {message}
          </p>
        )}
      </div>

      {/* My events */}
      <div style={cardStyle()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 4 }}>
              Мої події
            </h2>
            <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, margin: 0 }}>
              Зареєстровані та відвідані заходи
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 4,
              background: colors.borderLight,
              borderRadius: radius.md,
              padding: 4,
            }}
          >
            {[
              { id: "upcoming", label: "Майбутні" },
              { id: "past", label: "Минулі" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setEventsTab(id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: radius.sm,
                  fontSize: 13,
                  fontWeight: eventsTab === id ? 700 : 500,
                  border: "none",
                  background: eventsTab === id ? colors.surface : "transparent",
                  color: eventsTab === id ? colors.text : colors.textSecondary,
                  cursor: "pointer",
                  boxShadow: eventsTab === id ? shadows.sm : "none",
                  fontFamily: fonts.body,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", color: colors.textMuted, fontFamily: fonts.body }}>
            {eventsTab === "upcoming"
              ? "Немає майбутніх подій"
              : "Немає минулих подій"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredEvents.map(({ event }) => {
              const d = event.start_datetime ? new Date(event.start_datetime) : null;
              return (
                <button
                  key={event.event_id}
                  type="button"
                  onClick={() => onNavigateToEvent?.(event)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 18px",
                    borderRadius: radius.lg,
                    border: `1px solid ${colors.borderLight}`,
                    background: colors.surface,
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                    transition: "border-color 0.15s",
                    fontFamily: fonts.body,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primaryMuted;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.borderLight;
                  }}
                >
                  <div style={{ textAlign: "center", minWidth: 44, flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: colors.primary, lineHeight: 1 }}>
                      {d ? d.getDate() : "—"}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: colors.primary }}>
                      {d ? MONTHS[d.getMonth()] : ""}
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: colors.text,
                        marginBottom: 8,
                      }}
                    >
                      {event.title}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px" }}>
                      {event.location && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: colors.textSecondary }}>
                          <IconMapPin size={13} color={colors.textMuted} />
                          {event.location}
                        </span>
                      )}
                      {event.start_datetime && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: colors.textSecondary }}>
                          <IconClock size={13} color={colors.textMuted} />
                          {formatEventTime(event.start_datetime)}
                        </span>
                      )}
                      {event.organization_name && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: colors.textSecondary }}>
                          <IconUser size={13} color={colors.textMuted} />
                          {event.organization_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <IconChevronRight size={18} color={colors.textMuted} />
                </button>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button
            type="button"
            onClick={() => onNavigate?.("events")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: radius.md,
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              background: colors.primary,
              color: colors.white,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconCalendar size={16} color={colors.white} />
            Переглянути всі події
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: 6,
  fontFamily: fonts.body,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  fontFamily: fonts.body,
  boxSizing: "border-box",
};
