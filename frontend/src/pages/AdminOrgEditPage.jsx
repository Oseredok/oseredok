import { useCallback, useEffect, useState } from "react";
import { API } from "../api";
import OrganizationFormFields from "../components/admin/OrganizationFormFields";
import LogoUploadField from "../components/LogoUploadField";
import {
  IconBuilding,
  IconCheck,
  IconEdit,
  IconPlus,
  IconTrash,
} from "../components/admin/AdminIcons";
import { IconArrowLeft, IconX } from "../components/ui/Icons";
import { emptyForm, fileToDataUrl } from "../utils/orgForm";
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

export function AdminOrgEditPage({
  org: initialOrg,
  isAdminMode = true,
  onBack,
  onCreateEvent,
  onNavigateToEvent,
}) {
  const [form, setForm] = useState(emptyForm(initialOrg));
  const [events, setEvents] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialOrg.logo_url || null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // стани редагування події
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventEditForm, setEventEditForm] = useState({});
  const [eventSaveMsg, setEventSaveMsg] = useState("");

  const orgId = initialOrg.organization_id;

  const fetchOrg = useCallback(async () => {
    setLoadingOrg(true);
    try {
      const res = await fetch(`${API}/organizations/${orgId}`);
      if (res.ok) {
        const data = await res.json();
        setForm(emptyForm(data));
        setLogoPreview(data.logo_url || null);
        setLogoRemoved(false);
        setLogoFile(null);
      }
    } catch {
      setMessage("Не вдалося завантажити організацію");
    } finally {
      setLoadingOrg(false);
    }
  }, [orgId]);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API}/events?organization_id=${orgId}`);
      const data = await res.json();
      setEvents(data);
    } catch {
      setEvents([]);
    }
  }, [orgId]);

  useEffect(() => {
    fetchOrg();
    fetchEvents();
  }, [fetchOrg, fetchEvents]);

  const handleLogoChange = (file) => {
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setLogoRemoved(false);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoRemoved(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const payload = { ...form };
      if (isAdminMode) {
        payload.status = form.status;
      } else {
        delete payload.status;
      }

      if (logoFile) {
        payload.logo_url = await fileToDataUrl(logoFile);
      } else if (logoRemoved) {
        payload.logo_url = null;
      }

      const res = await fetch(`${API}/organizations/${orgId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updated = await res.json();
        setForm(emptyForm(updated));
        setLogoPreview(updated.logo_url || null);
        setLogoFile(null);
        setLogoRemoved(false);
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

  const handleSaveEvent = async (eventId) => {
    try {
      const res = await fetch(`${API}/events/${eventId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(eventEditForm),
      });
      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) =>
          prev.map((e) => (e.event_id === eventId ? { ...e, ...updated } : e))
        );
        setEditingEventId(null);
        setEventSaveMsg("Збережено");
        setTimeout(() => setEventSaveMsg(""), 3000);
      }
    } catch {
      setEventSaveMsg("Помилка збереження");
      setTimeout(() => setEventSaveMsg(""), 3000);
    }
  };

  const active = (form.status || "active") === "active";
  const catColor = categoryColors[form.category] || colors.primary;
  const initials = form.name?.slice(0, 2).toUpperCase() || "OR";

  if (loadingOrg) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: colors.textMuted, fontFamily: fonts.body }}>
        Завантаження...
      </div>
    );
  }

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
        {isAdminMode ? "Назад до списку" : "Назад до панелі організатора"}
      </button>

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
            {form.name}
          </h1>
          {form.handle && <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 10 }}>@{form.handle}</div>}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isAdminMode && (
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
                {active ? "Активна" : "Неактивна"}
              </span>
            )}
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
            onClick={() => onCreateEvent?.({ ...initialOrg, ...form, organization_id: orgId })}
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

      {/* Події організації */}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {eventSaveMsg && (
              <span style={{ fontSize: 13, color: "#16a34a", fontFamily: fonts.body }}>✓ {eventSaveMsg}</span>
            )}
            <button
              type="button"
              onClick={() => onCreateEvent?.({ ...initialOrg, ...form, organization_id: orgId })}
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
        </div>

        {events.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textMuted, fontFamily: fonts.body }}>
            Подій ще немає
          </div>
        ) : (
          events.map((event) => {
            const { day, month } = formatEventDate(event.start_datetime);
            const status = eventStatusLabel(event);
            const isEditing = editingEventId === event.event_id;

            return (
              <div key={event.event_id} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
                {/* Рядок події */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 24px",
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
                      {event.max_participants != null ? ` · ${event.participants_count ?? 0}/${event.max_participants}` : ""}
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
                      onClick={() => {
                        if (isEditing) {
                          setEditingEventId(null);
                        } else {
                          setEditingEventId(event.event_id);
                          setEventEditForm({
                            title: event.title || "",
                            description: event.description || "",
                            location: event.location || "",
                            start_datetime: event.start_datetime?.slice(0, 16) || "",
                            max_participants: event.max_participants || "",
                          });
                        }
                      }}
                      style={{
                        ...iconBtnStyle,
                        borderColor: isEditing ? colors.primary : colors.border,
                        background: isEditing ? colors.primaryLight : colors.surface,
                        color: isEditing ? colors.primary : colors.textSecondary,
                      }}
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

                {/* Форма редагування події */}
                {isEditing && (
                  <div style={{ padding: "0 24px 20px 88px" }}>
                    <div style={{ background: "#f8fafc", borderRadius: radius.md, padding: 20, border: `1px solid ${colors.borderLight}` }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                        {[
                          { label: "Назва", key: "title" },
                          { label: "Місце", key: "location" },
                        ].map(({ label, key }) => (
                          <div key={key}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>
                              {label}
                            </label>
                            <input
                              value={eventEditForm[key] || ""}
                              onChange={(e) => setEventEditForm((f) => ({ ...f, [key]: e.target.value }))}
                              style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }}
                            />
                          </div>
                        ))}
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>
                            Дата і час
                          </label>
                          <input
                            type="datetime-local"
                            value={eventEditForm.start_datetime || ""}
                            onChange={(e) => setEventEditForm((f) => ({ ...f, start_datetime: e.target.value }))}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>
                            Макс. учасників
                          </label>
                          <input
                            type="number"
                            value={eventEditForm.max_participants || ""}
                            onChange={(e) => setEventEditForm((f) => ({ ...f, max_participants: e.target.value ? parseInt(e.target.value) : null }))}
                            style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }}
                          />
                        </div>
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>
                          Опис
                        </label>
                        <textarea
                          value={eventEditForm.description || ""}
                          onChange={(e) => setEventEditForm((f) => ({ ...f, description: e.target.value }))}
                          rows={3}
                          style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, resize: "vertical", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => handleSaveEvent(event.event_id)}
                          style={{ padding: "9px 20px", borderRadius: radius.md, fontSize: 13, fontWeight: 700, border: "none", background: colors.primary, color: colors.white, cursor: "pointer", fontFamily: fonts.body }}
                        >
                          Зберегти
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEventId(null)}
                          style={{ padding: "9px 20px", borderRadius: radius.md, fontSize: 13, fontWeight: 600, border: `1px solid ${colors.border}`, background: "none", color: colors.textSecondary, cursor: "pointer", fontFamily: fonts.body }}
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Форма редагування організації */}
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
          <LogoUploadField
            preview={logoPreview}
            fileName={logoFile?.name}
            onChange={handleLogoChange}
            onRemove={removeLogo}
            label="Аватар / лого організації"
          />

          <OrganizationFormFields form={form} setForm={setForm} showStatus={isAdminMode} />

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