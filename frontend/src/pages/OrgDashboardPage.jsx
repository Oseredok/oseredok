import { useEffect, useState } from "react";
import { API } from "../api";
import { IconEdit, IconCheck } from "../components/admin/AdminIcons";
import { IconX } from "../components/ui/Icons";
import OrganizationFormFields from "../components/admin/OrganizationFormFields";
import LogoUploadField from "../components/LogoUploadField";
import { emptyForm, fileToDataUrl } from "../utils/orgForm";
import { parseApiError, validateEventDatetimes } from "../utils/eventForm";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";
import { useToast } from "../context/ToastContext";

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

function OrgLogo({ logoUrl, initials, catColor }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logoUrl) && !failed;
  return (
    <div style={{
      width: 56, height: 56, borderRadius: radius.lg, overflow: "hidden",
      background: showImage ? "transparent" : colors.primaryLight,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {showImage ? (
        <img src={logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setFailed(true)} />
      ) : (
        <span style={{ fontWeight: 800, color: catColor || colors.primary }}>{initials}</span>
      )}
    </div>
  );
}

export function OrgDashboardPage({ user, onNavigate }) {
  const showToast = useToast();
  const [org, setOrg] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [form, setForm] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventEditForm, setEventEditForm] = useState({});

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/users/me/organization`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(orgData => {
        if (orgData) {
          setOrg(orgData);
          setForm(emptyForm(orgData));
          setLogoPreview(orgData.logo_url || null);
          return fetch(`${API}/events?organization_id=${orgData.organization_id}`).then(r => r.json());
        }
        return [];
      })
      .then(eventsData => setEvents(Array.isArray(eventsData) ? eventsData : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const loadParticipants = (eventId) => {
    if (selectedEventId === eventId) { setSelectedEventId(null); return; }
    setSelectedEventId(eventId);
    setLoadingParticipants(true);
    fetch(`${API}/events/${eventId}/participants`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => setParticipants([]))
      .finally(() => setLoadingParticipants(false));
  };

  const handleSubmitOrg = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form };
      delete payload.status;
      if (logoFile) payload.logo_url = await fileToDataUrl(logoFile);
      else if (logoRemoved) payload.logo_url = null;

      const res = await fetch(`${API}/organizations/${org.organization_id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrg(updated);
        setForm(emptyForm(updated));
        setLogoPreview(updated.logo_url || null);
        setLogoFile(null);
        setLogoRemoved(false);
        setIsEditingOrg(false);
        showToast("Організацію оновлено", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.detail || "Помилка при оновленні", "error");
      }
    } catch {
      showToast("Немає зв'язку з сервером", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEditOrg = () => {
    setForm(emptyForm(org));
    setLogoPreview(org.logo_url || null);
    setLogoFile(null);
    setLogoRemoved(false);
    setIsEditingOrg(false);
  };

  const handleSaveEvent = async (eventId) => {
    const current = events.find((e) => e.event_id === eventId);
    const start = eventEditForm.start_datetime ?? current?.start_datetime?.slice(0, 16);
    const end = eventEditForm.end_datetime ?? current?.end_datetime?.slice(0, 16);

    const validationError = validateEventDatetimes(start, end || start);
    if (validationError && current && new Date(current.start_datetime) >= new Date()) {
      showToast(validationError, "error");
      return;
    }

    try {
      const res = await fetch(`${API}/events/${eventId}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(eventEditForm),
      });

      if (res.ok) {
        const updated = await res.json();
        setEvents((prev) => prev.map((e) => (e.event_id === eventId ? { ...e, ...updated } : e)));
        setEditingEventId(null);
        showToast("Подію збережено", "success");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(parseApiError(data, "Помилка збереження події"), "error");
      }
    } catch {
      showToast("Помилка збереження події", "error");
    }
  };

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.start_datetime) >= now);
  const pastEvents = events.filter(e => new Date(e.start_datetime) < now);
  const catColor = categoryColors[org?.category] || colors.primary;
  const initials = org?.name?.slice(0, 2).toUpperCase() || "OR";

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80, color: colors.textMuted, fontFamily: fonts.body }}>
      Завантаження...
    </div>
  );

  if (!org) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: colors.textMuted, fontSize: 16, marginBottom: 16, fontFamily: fonts.body }}>
        Вас не прив'язано до жодної організації
      </p>
      <p style={{ color: colors.textMuted, fontSize: 14, fontFamily: fonts.body }}>
        Зверніться до адміністратора
      </p>
    </div>
  );

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 6 }}>
          Панель організатора
        </h1>
        <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
          Керування вашою організацією · {user?.email}
        </p>
      </div>

      <div style={{
        background: colors.surface, borderRadius: radius.xl,
        border: `1px solid ${colors.borderLight}`, boxShadow: shadows.sm,
        marginBottom: 12, padding: 20,
        display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
      }}>
        <OrgLogo logoUrl={org.logo_url} initials={initials} catColor={catColor} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, fontFamily: fonts.heading }}>{org.name}</div>
          {org.handle && <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>@{org.handle}</div>}
          {org.category && (
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: radius.pill, fontSize: 11, fontWeight: 700, background: catColor + "18", color: catColor }}>
              {org.category}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsEditingOrg(prev => !prev)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: radius.md, fontSize: 14, fontWeight: 700, border: "none",
            background: isEditingOrg ? colors.borderLight : colors.primary,
            color: isEditingOrg ? colors.textSecondary : colors.white,
            cursor: "pointer", fontFamily: fonts.body,
          }}
        >
          {isEditingOrg ? <><IconX size={14} color={colors.textSecondary} />Закрити</> : <><IconEdit size={14} color={colors.white} />Редагувати</>}
        </button>
      </div>

      {isEditingOrg && (
        <div style={{
          background: colors.surface, borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`, boxShadow: shadows.sm,
          padding: 20, marginBottom: 24, animation: "fadeUp 0.25s ease both",
        }}>
          <form onSubmit={handleSubmitOrg}>
            <LogoUploadField
              preview={logoPreview}
              fileName={logoFile?.name}
              onChange={(file) => { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); setLogoRemoved(false); }}
              onRemove={() => { setLogoFile(null); setLogoPreview(null); setLogoRemoved(true); }}
              label="Аватар / лого організації"
            />
            <OrganizationFormFields form={form} setForm={setForm} showStatus={false} />
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" disabled={submitting} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: radius.md, fontSize: 14, fontWeight: 700, border: "none",
                background: submitting ? colors.borderLight : colors.primary,
                color: submitting ? colors.textMuted : colors.white,
                cursor: submitting ? "not-allowed" : "pointer", fontFamily: fonts.body,
              }}>
                <IconCheck size={16} color={submitting ? colors.textMuted : colors.white} />
                {submitting ? "Збереження..." : "Зберегти зміни"}
              </button>
              <button type="button" onClick={handleCancelEditOrg} style={{
                padding: "12px 24px", borderRadius: radius.md, fontSize: 14, fontWeight: 700,
                border: `1px solid ${colors.border}`, background: "none", color: colors.textSecondary,
                cursor: "pointer", fontFamily: fonts.body,
              }}>
                Скасувати
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{
        background: colors.surface, borderRadius: radius.xl,
        border: `1px solid ${colors.borderLight}`, boxShadow: shadows.sm,
        overflow: "hidden", marginBottom: 24,
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, fontFamily: fonts.heading }}>Події</div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2, fontFamily: fonts.body }}>{events.length} подій загалом</div>
          </div>
          <button type="button" onClick={() => onNavigate("create-event")} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "10px 18px", borderRadius: radius.md, fontSize: 14, fontWeight: 700,
            border: "none", background: colors.primary, color: colors.white, cursor: "pointer", fontFamily: fonts.body,
          }}>
            + Нова подія
          </button>
        </div>

        <div style={{ padding: "8px 20px 20px" }}>
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
                  isEditing={editingEventId === event.event_id}
                  editForm={eventEditForm}
                  setEditForm={setEventEditForm}
                  onStartEdit={() => {
                    setEditingEventId(event.event_id);
                    setSelectedEventId(null);
                    setEventEditForm({ title: event.title || "", description: event.description || "", location: event.location || "", start_datetime: event.start_datetime?.slice(0, 16) || "", max_participants: event.max_participants || "" });
                  }}
                  onCancelEdit={() => setEditingEventId(null)}
                  onSaveEdit={() => handleSaveEvent(event.event_id)}
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
                  isEditing={editingEventId === event.event_id}
                  editForm={eventEditForm}
                  setEditForm={setEventEditForm}
                  onStartEdit={() => {
                    setEditingEventId(event.event_id);
                    setSelectedEventId(null);
                    setEventEditForm({ title: event.title || "", description: event.description || "", location: event.location || "", start_datetime: event.start_datetime?.slice(0, 16) || "", max_participants: event.max_participants || "" });
                  }}
                  onCancelEdit={() => setEditingEventId(null)}
                  onSaveEdit={() => handleSaveEvent(event.event_id)}
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

function EventRow({ event, isSelected, participants, loadingParticipants, onToggleParticipants, isPast, isEditing, editForm, setEditForm, onStartEdit, onCancelEdit, onSaveEdit }) {
  return (
    <div style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0" }}>
        <div style={{ width: 44, flexShrink: 0, textAlign: "center", background: isPast ? colors.borderLight : "#eff6ff", borderRadius: radius.md, padding: "6px 4px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: isPast ? colors.textMuted : colors.primary, lineHeight: 1 }}>{getDay(event.start_datetime)}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: isPast ? colors.textMuted : "#93c5fd", textTransform: "uppercase" }}>{getMonthAbbr(event.start_datetime)}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: isPast ? colors.textSecondary : colors.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: fonts.body }}>
            {event.title}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {event.location && <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{event.location}</span>}
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{formatTime(event.start_datetime)}</span>
            <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: fonts.body }}>{event.participants_count ?? 0} учасників</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button type="button" onClick={onStartEdit} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: radius.md, fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${isEditing ? colors.primary : colors.border}`,
            background: isEditing ? colors.primaryLight : "none",
            color: isEditing ? colors.primary : colors.textSecondary,
            cursor: "pointer", fontFamily: fonts.body,
          }}>
            <IconEdit size={12} color={isEditing ? colors.primary : colors.textSecondary} />
            Редагувати
          </button>
          <button type="button" onClick={onToggleParticipants} style={{
            padding: "6px 14px", borderRadius: radius.md, fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${isSelected ? colors.primary : colors.border}`,
            background: isSelected ? colors.primaryLight : "none",
            color: isSelected ? colors.primary : colors.textSecondary,
            cursor: "pointer", fontFamily: fonts.body,
          }}>
            Учасники
          </button>
        </div>
      </div>

      {isEditing && (
        <div style={{ padding: "0 0 20px 58px" }}>
          <div style={{ background: "#f8fafc", borderRadius: radius.md, padding: 20, border: `1px solid ${colors.borderLight}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {[{ label: "Назва", key: "title" }, { label: "Місце", key: "location" }].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>{label}</label>
                  <input value={editForm[key] || ""} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>Дата і час</label>
                <input type="datetime-local" value={editForm.start_datetime || ""} onChange={e => setEditForm(f => ({ ...f, start_datetime: e.target.value }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>Макс. учасників</label>
                <input type="number" value={editForm.max_participants || ""} onChange={e => setEditForm(f => ({ ...f, max_participants: e.target.value ? parseInt(e.target.value) : null }))}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6, fontFamily: fonts.body }}>Опис</label>
              <textarea value={editForm.description || ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3}
                style={{ width: "100%", padding: "8px 12px", borderRadius: radius.md, fontSize: 14, border: `1.5px solid ${colors.border}`, outline: "none", fontFamily: fonts.body, resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={onSaveEdit} style={{ padding: "9px 20px", borderRadius: radius.md, fontSize: 13, fontWeight: 700, border: "none", background: colors.primary, color: colors.white, cursor: "pointer", fontFamily: fonts.body }}>Зберегти</button>
              <button type="button" onClick={onCancelEdit} style={{ padding: "9px 20px", borderRadius: radius.md, fontSize: 13, fontWeight: 600, border: `1px solid ${colors.border}`, background: "none", color: colors.textSecondary, cursor: "pointer", fontFamily: fonts.body }}>Скасувати</button>
            </div>
          </div>
        </div>
      )}

      {isSelected && !isEditing && (
        <div style={{ padding: "0 0 16px 58px" }}>
          {loadingParticipants && <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>Завантаження...</p>}
          {!loadingParticipants && participants.length === 0 && <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>Немає зареєстрованих учасників</p>}
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