import { useCallback, useEffect, useState } from "react";
import { API } from "../api";
import EventRegistrationModal from "../components/EventRegistrationModal";
import {
  IconArrowLeft,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUsers,
} from "../components/ui/Icons";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

function formatDateLong(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("uk-UA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateRange(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const datePart = s.toLocaleDateString("uk-UA", { day: "numeric", month: "long" });
  const timeStart = s.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  if (e) {
    const timeEnd = e.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    return `${datePart}, ${timeStart} — ${timeEnd}`;
  }
  return `${datePart}, ${timeStart}`;
}

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

function infoBlock({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: radius.md,
          background: colors.primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: colors.primary,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 4,
            fontFamily: fonts.body,
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body, lineHeight: 1.4 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function EventDetailPage({ event: initialEvent, user, onBack, onOpenAuth, onNavigateToOrg }) {
  const [event, setEvent] = useState(initialEvent);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [modalError, setModalError] = useState("");

  const orgName = event.organization_name || event.org_name;
  const participants = event.participants_count ?? 0;
  const maxParticipants = event.max_participants;
  const isFull = maxParticipants != null && participants >= maxParticipants;
  const progressPct = maxParticipants ? Math.min(100, (participants / maxParticipants) * 100) : 0;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const eventRes = await fetch(`${API}/events/${initialEvent.event_id}`);
      if (eventRes.ok) {
        const data = await eventRes.json();
        setEvent(data);
      }

      const token = localStorage.getItem("token");
      if (token) {
        const [regRes, profileRes] = await Promise.all([
          fetch(`${API}/users/me/registrations`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (regRes.ok) {
          const regs = await regRes.json();
          setRegistered(regs.some((r) => r.event?.event_id === initialEvent.event_id));
        }
        if (profileRes.ok) {
          setProfile(await profileRes.json());
        }
      } else {
        setRegistered(false);
      }
    } catch {
      setMessage("Не вдалося завантажити дані події");
    } finally {
      setLoading(false);
    }
  }, [initialEvent.event_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRegister = async () => {
    if (!user) {
      onOpenAuth?.("login");
      return;
    }
    setSubmitting(true);
    setMessage("");
    setModalError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/events/${event.event_id}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRegistered(true);
        setShowRegisterModal(false);
        setMessage("Ви успішно зареєстровані на подію");
        const updated = await fetch(`${API}/events/${event.event_id}`).then((r) => r.json());
        setEvent(updated);
      } else {
        const data = await res.json().catch(() => ({}));
        const err = data.detail || "Не вдалося зареєструватись";
        setModalError(err);
        setMessage(err);
      }
    } catch {
      const err = "Немає зв'язку з сервером";
      setModalError(err);
      setMessage(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openRegisterModal = () => {
    if (!user) {
      onOpenAuth?.("login");
      return;
    }
    setModalError("");
    setShowRegisterModal(true);
  };

  const handleCancel = async () => {
    setSubmitting(true);
    setMessage("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/events/${event.event_id}/register`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRegistered(false);
        setMessage("Реєстрацію скасовано");
        const updated = await fetch(`${API}/events/${event.event_id}`).then((r) => r.json());
        setEvent(updated);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.detail || "Не вдалося скасувати реєстрацію");
      }
    } catch {
      setMessage("Немає зв'язку з сервером");
    } finally {
      setSubmitting(false);
    }
  };

  const color = categoryColors[event.category] || categoryColors.default;

  return (
    <div style={{ animation: "fadeUp 0.4s ease both", maxWidth: 860, margin: "0 auto" }}>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 18px",
          borderRadius: radius.pill,
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.textSecondary,
          cursor: "pointer",
          marginBottom: 24,
          fontFamily: fonts.body,
        }}
      >
        <IconArrowLeft size={16} />
        Назад до подій
      </button>

      {/* Main info card */}
      <div style={cardStyle()}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: colors.text,
            fontFamily: fonts.heading,
            marginBottom: 24,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {event.title}
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 20,
            marginBottom: 28,
            paddingBottom: 28,
            borderBottom: `1px solid ${colors.borderLight}`,
          }}
        >
          {infoBlock({
            icon: <IconClock size={18} color={colors.primary} />,
            label: "Дата та час",
            value: formatDateRange(event.start_datetime, event.end_datetime),
          })}
          {event.location &&
            infoBlock({
              icon: <IconMapPin size={18} color={colors.primary} />,
              label: "Місце",
              value: event.location,
            })}
          {maxParticipants != null &&
            infoBlock({
              icon: <IconUsers size={18} color={colors.primary} />,
              label: "Учасники",
              value: `до ${maxParticipants} осіб`,
            })}
          {infoBlock({
            icon: <IconCalendar size={18} color={colors.primary} />,
            label: "Формат",
            value: "Офлайн",
          })}
        </div>

        <h2
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: colors.text,
            fontFamily: fonts.heading,
            marginBottom: 12,
          }}
        >
          Про подію
        </h2>
        <p
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            lineHeight: 1.75,
            fontFamily: fonts.body,
            margin: 0,
          }}
        >
          {event.description || "Опис події буде додано найближчим часом."}
        </p>
      </div>

      {/* Registration card */}
      <div style={cardStyle()}>
        {maxParticipants != null && (
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                fontSize: 13,
                fontFamily: fonts.body,
              }}
            >
              <span style={{ fontWeight: 600, color: colors.text }}>Зареєстровано</span>
              <span style={{ color: colors.textSecondary }}>
                {participants} / {maxParticipants} місць
              </span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: radius.pill,
                background: colors.borderLight,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: colors.primary,
                  borderRadius: radius.pill,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
          {event.start_datetime && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
              <IconClock size={16} color={colors.primary} />
              {formatDateLong(event.start_datetime)}
            </div>
          )}
          {event.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
              <IconMapPin size={16} color={colors.primary} />
              {event.location}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
            <IconCalendar size={16} color={colors.primary} />
            Участь безкоштовна
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: radius.md,
              marginBottom: 16,
              fontSize: 13,
              fontFamily: fonts.body,
              background: message.includes("успіш") || message.includes("скасовано")
                ? colors.successBg
                : colors.errorBg,
              color: message.includes("успіш") || message.includes("скасовано")
                ? colors.success
                : colors.error,
            }}
          >
            {message}
          </div>
        )}

        {!user ? (
          <button
            type="button"
            onClick={() => onOpenAuth("login")}
            style={primaryBtn()}
          >
            Увійти для реєстрації
          </button>
        ) : registered ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting || loading}
            style={secondaryBtn(submitting || loading)}
          >
            {submitting ? "Скасування..." : "Скасувати реєстрацію"}
          </button>
        ) : (
          <button
            type="button"
            onClick={openRegisterModal}
            disabled={loading || isFull}
            style={primaryBtn(loading || isFull)}
          >
            {isFull ? "Місця закінчилися" : "Зареєструватись на подію"}
          </button>
        )}
      </div>

      {showRegisterModal && (
        <EventRegistrationModal
          event={event}
          profile={profile}
          user={user}
          onClose={() => setShowRegisterModal(false)}
          onConfirm={handleRegister}
          submitting={submitting}
          error={modalError}
        />
      )}

      {/* Organizer card */}
      {orgName && (
        <div style={cardStyle()}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              marginBottom: 16,
            }}
          >
            Організатор
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: radius.md,
                background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.white,
                fontWeight: 800,
                fontSize: 18,
                fontFamily: fonts.heading,
              }}
            >
              {orgName[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.text, fontFamily: fonts.body }}>
                {orgName}
              </div>
              <div style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body }}>
                Студентська організація НаУКМА
              </div>
            </div>
          </div>
          {event.organization_id && onNavigateToOrg && (
            <button
              type="button"
              onClick={() =>
                onNavigateToOrg({
                  organization_id: event.organization_id,
                  name: orgName,
                  category: event.category,
                })
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: radius.md,
                fontSize: 14,
                fontWeight: 700,
                border: `1.5px solid ${colors.border}`,
                background: colors.surface,
                color: colors.primary,
                cursor: "pointer",
                fontFamily: fonts.body,
              }}
            >
              Переглянути організацію
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function primaryBtn(disabled = false) {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    border: "none",
    background: disabled ? colors.borderLight : colors.primary,
    color: disabled ? colors.textMuted : colors.white,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: fonts.body,
  };
}

function secondaryBtn(disabled = false) {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    border: `1.5px solid ${colors.border}`,
    background: colors.surface,
    color: disabled ? colors.textMuted : colors.textSecondary,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: fonts.body,
  };
}
