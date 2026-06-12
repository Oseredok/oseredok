import { useCallback, useEffect, useRef, useState } from "react";
import { API } from "../api";
import OrganizationFormFields from "../components/admin/OrganizationFormFields";
import {
  IconBuilding,
  IconCheck,
  IconEdit,
  IconPlus,
  IconTrash,
  IconUpload,
  IconX,
} from "../components/admin/AdminIcons";
import { IconArrowLeft } from "../components/ui/Icons";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function formatEventDate(iso) {
  if (!iso) return { day: "—", month: "" };
  const d = new Date(iso);
  const months = ["СІЧ", "ЛЮТ", "БЕР", "КВІТ", "ТРАВ", "ЧЕР", "ЛИП", "СЕР", "ВЕР", "ЖОВ", "ЛИС", "ГРУ"];
  return { day: d.getDate(), month: months[d.getMonth()] };
}

function formatEventTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

function eventStatusLabel(event) {
  const now = Date.now();
  const start = event.start_datetime ? new Date(event.start_datetime).getTime() : 0;
  if (start > now) return { label: "Заплановано", color: colors.primary, bg: colors.primaryLight };
  return { label: "Активна", color: colors.success, bg: colors.successBg };
}

export function AdminOrgEditPage({ org, onBack, onCreateEvent, onNavigateToEvent }) {
  const [form, setForm] = useState({
    name: org.name || "",
    handle: org.handle || "",
    description: org.description || "",
    category: org.category || "",
    faculty: org.faculty || "",
    contact_email: org.contact_email || "",
    phone: org.phone || "",
    instagram: org.instagram || "",
    telegram: org.telegram || "",
    status: org.status || "active",
  });
  const [events, setEvents] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(org.logo_url || null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/events?organization_id=${org.organization_id}`);
      const data = await res.json();
      setEvents(data);
    } catch {
      setEvents([]);
    }
  }, [org.organization_id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setForm((f) => ({ ...f, logo_url: null }));
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const payload = { ...form };
    if (logoPreview && !logoFile) payload.logo_url = logoPreview;
    else if (logoFile) payload.logo_url = logoPreview;

    try {
      const res = await fetch(`${API}/organizations/${org.organization_id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("Зміни збережено");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.detail || "Помилка при оновленні");
      }
    } catch {
      setMessage("Немає зв'язку з сервером");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Видалити подію «${event.title}»?`)) return;
    setMessage("Видалення подій поки не підтримується API");
  };

  const active = (form.status || "active") === "active";
  const catColor = categoryColors[form.category] || colors.primary;
  const initials = form.name?.slice(0, 2).toUpperCase() || "OR";

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          color: colors.textSecondary,
          fontSize: 14,
          cursor: "pointer",
          marginBottom: 20,
          fontFamily: fonts.body,
          padding: 0,
        }}
      >
        <IconArrowLeft size={16} />
        Назад до списку
      </button>

      {/* Org summary card */}
      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`,
          padding: 24,
          marginBottom: 24,
          boxShadow: shadows.sm,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: radius.lg,
            background: logoPreview ? "transparent" : colors.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {logoPreview ? (
            <img src={logoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 800, color: colors.primary }}>{initials}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 4 }}>
            {form.name || org.name}
          </h1>
          {form.handle && (
            <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 10 }}>@{form.handle}</div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: radius.pill,
                fontSize: 12,
                fontWeight: 600,
                background: active ? colors.successBg : colors.borderLight,
                color: active ? colors.success : colors.textMuted,
              }}
            >
              {active ? (
                <>
                  <IconCheck size={12} color={colors.success} />
                  Активна
                </>
              ) : (
                "Неактивна"
              )}
            </span>
            {form.category && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: radius.pill,
                  fontSize: 12,
                  fontWeight: 600,
                  background: catColor + "18",
                  color: catColor,
                }}
              >
                {form.category}
              </span>
            )}
            {form.faculty && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: radius.pill,
                  fontSize: 12,
                  fontWeight: 600,
                  background: colors.bg,
                  color: colors.textSecondary,
                }}
              >
                {form.faculty}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => document.getElementById("edit-form")?.scrollIntoView({ behavior: "smooth" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: radius.md,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconEdit size={14} />
            Редагувати
          </button>
          <button
            type="button"
            onClick={() => onCreateEvent?.(org)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: radius.md,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              background: colors.primary,
              color: colors.white,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconPlus size={14} color={colors.white} />
            Створити подію
          </button>
        </div>
      </div>

      {/* Events section */}
      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`,
          marginBottom: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 24px",
            borderBottom: `1px solid ${colors.borderLight}`,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: fonts.heading, color: colors.text, margin: 0 }}>
            Події організації
          </h2>
          <button
            type="button"
            onClick={() => onCreateEvent?.(org)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              borderRadius: radius.md,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${colors.primaryMuted}`,
              background: colors.primaryLight,
              color: colors.primary,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconPlus size={14} color={colors.primary} />
            Нова подія
          </button>
        </div>

        {events.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textMuted, fontFamily: fonts.body }}>
            Подій ще немає
          </div>
        ) : (
          events.map((event) => {
            const { day, month } = formatEventDate(event.start_datetime);
            const status = eventStatusLabel(event);
            return (
              <div
                key={event.event_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 24px",
                  borderBottom: `1px solid ${colors.borderLight}`,
                }}
              >
                <div style={{ textAlign: "center", minWidth: 48 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: colors.text, lineHeight: 1 }}>{day}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted }}>{month}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: colors.text, marginBottom: 4 }}>{event.title}</div>
                  <div style={{ fontSize: 13, color: colors.textSecondary }}>
                    {formatEventTime(event.start_datetime)}
                    {event.location ? ` · ${event.location}` : ""}
                    {event.max_participants != null
                      ? ` · ${event.participants_count ?? 0}/${event.max_participants}`
                      : ""}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: radius.pill,
                    fontSize: 11,
                    fontWeight: 700,
                    background: status.bg,
                    color: status.color,
                    whiteSpace: "nowrap",
                  }}
                >
                  {status.label}
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={() => onNavigateToEvent?.(event)}
                    style={iconBtnStyle}
                    title="Редагувати"
                  >
                    <IconEdit size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event)}
                    style={{ ...iconBtnStyle, color: colors.error }}
                    title="Видалити"
                  >
                    <IconTrash size={16} color={colors.error} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Logo upload */}
      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: fonts.heading, color: colors.text, marginBottom: 16 }}>
          Лого організації
        </h2>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) {
              setLogoFile(file);
              setLogoPreview(URL.createObjectURL(file));
            }
          }}
          style={{
            border: `2px dashed ${colors.border}`,
            borderRadius: radius.lg,
            padding: 40,
            textAlign: "center",
            cursor: "pointer",
            background: colors.bg,
          }}
        >
          <div style={{ color: colors.textMuted, marginBottom: 12 }}>
            <IconUpload size={36} color={colors.textMuted} />
          </div>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
            Перетягніть файл сюди або натисніть для завантаження
          </p>
          <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>PNG, JPG до 2 МБ</p>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
        </div>
        {logoFile && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: radius.md,
              background: colors.bg,
              fontSize: 13,
            }}
          >
            <IconBuilding size={16} color={colors.textMuted} />
            <span style={{ flex: 1 }}>{logoFile.name}</span>
            <button type="button" onClick={removeLogo} style={{ background: "none", border: "none", cursor: "pointer", color: colors.error }}>
              <IconX size={16} color={colors.error} />
            </button>
          </div>
        )}
      </div>

      {/* Edit form */}
      <div id="edit-form">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.md,
              background: colors.primaryLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBuilding size={20} color={colors.primary} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: fonts.heading, color: colors.text, margin: 0 }}>
            Редагування організації
          </h2>
        </div>

        <form onSubmit={handleSubmit}>
          <OrganizationFormFields form={form} setForm={setForm} showStatus />

          {message && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: radius.md,
                background: message.includes("збережено") ? colors.successBg : colors.errorBg,
                color: message.includes("збережено") ? colors.success : colors.error,
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              {message}
            </div>
          )}

          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 20px",
                borderRadius: radius.md,
                fontSize: 14,
                fontWeight: 600,
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.textSecondary,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              <IconX size={16} />
              Скасувати
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 24px",
                borderRadius: radius.md,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                background: submitting ? colors.borderLight : colors.primary,
                color: submitting ? colors.textMuted : colors.white,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: fonts.body,
              }}
            >
              <IconCheck size={16} color={submitting ? colors.textMuted : colors.white} />
              {submitting ? "Збереження..." : "Зберегти зміни"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: `1px solid ${colors.border}`,
  background: colors.surface,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: colors.textSecondary,
};
