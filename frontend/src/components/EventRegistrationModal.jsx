import { IconCalendar, IconCheck, IconMapPin, IconUsers, IconX } from "./ui/Icons";
import { colors, fonts, radius, shadows } from "../theme/tokens";

function formatEventDates(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const months = [
    "січня", "лютого", "березня", "квітня", "травня", "червня",
    "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
  ];
  let dateStr;
  if (e && s.getMonth() === e.getMonth()) {
    dateStr = `${s.getDate()}–${e.getDate()} ${months[s.getMonth()]}`;
  } else if (e) {
    dateStr = `${s.getDate()} ${months[s.getMonth()]} – ${e.getDate()} ${months[e.getMonth()]}`;
  } else {
    dateStr = `${s.getDate()} ${months[s.getMonth()]}`;
  }
  const timeStart = s.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  const timeEnd = e?.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  return timeEnd ? `${dateStr} · ${timeStart} – ${timeEnd}` : `${dateStr} · ${timeStart}`;
}

function getInitials(name, email) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() || "?";
}

function sectionLabel(text) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 10,
        fontFamily: fonts.body,
      }}
    >
      {text}
    </p>
  );
}

function innerCard(children) {
  return (
    <div
      style={{
        background: "#FAF8F5",
        borderRadius: radius.lg,
        padding: 16,
        border: `1px solid ${colors.borderLight}`,
      }}
    >
      {children}
    </div>
  );
}

export default function EventRegistrationModal({
  event,
  profile,
  user,
  onClose,
  onConfirm,
  submitting,
  error,
}) {
  const participants = event.participants_count ?? 0;
  const max = event.max_participants;
  const remaining = max != null ? Math.max(0, max - participants) : null;
  const fillPct = max ? Math.min(100, (participants / max) * 100) : 0;
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Користувач";
  const email = profile?.email || user?.email;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: colors.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          width: "100%",
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: shadows.modal,
          padding: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.md,
                background: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconCalendar size={22} color={colors.white} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 4 }}>
                Реєстрація на подію
              </h2>
              <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
                {event.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: `1px solid ${colors.border}`,
              background: colors.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <IconX size={14} color={colors.textMuted} />
          </button>
        </div>

        {sectionLabel("Ваш профіль")}
        {innerCard(
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: colors.primaryLight,
                color: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              {getInitials(profile?.full_name, email)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: colors.text, fontFamily: fonts.body }}>
                {displayName}
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body }}>{email}</div>
            </div>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: colors.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconCheck size={14} color={colors.white} />
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          {sectionLabel("Деталі події")}
          {innerCard(
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {event.start_datetime && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
                  <IconCalendar size={16} color={colors.primary} />
                  {formatEventDates(event.start_datetime, event.end_datetime)}
                </div>
              )}
              {event.location && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
                  <span style={{ flexShrink: 0, marginTop: 2 }}>
                    <IconMapPin size={16} color={colors.primary} />
                  </span>
                  {event.location}
                </div>
              )}
              {max != null && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: colors.text, fontFamily: fonts.body }}>
                  <IconUsers size={16} color={colors.primary} />
                  до {max} учасників
                </div>
              )}
            </div>
          )}
        </div>

        {max != null && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
                fontSize: 13,
                fontFamily: fonts.body,
              }}
            >
              <span style={{ fontWeight: 600, color: colors.text }}>Залишилось місць</span>
              <span style={{ color: colors.textSecondary }}>
                {remaining} з {max}
              </span>
            </div>
            <div style={{ height: 8, borderRadius: radius.pill, background: colors.borderLight, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${fillPct}%`,
                  background: colors.primary,
                  borderRadius: radius.pill,
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: radius.md,
              background: colors.errorBg,
              color: colors.error,
              fontSize: 13,
              fontFamily: fonts.body,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting || (remaining !== null && remaining <= 0)}
          style={{
            width: "100%",
            marginTop: 24,
            padding: "14px 16px",
            borderRadius: radius.md,
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            background: submitting || (remaining !== null && remaining <= 0) ? colors.borderLight : colors.primary,
            color: submitting || (remaining !== null && remaining <= 0) ? colors.textMuted : colors.white,
            cursor: submitting || (remaining !== null && remaining <= 0) ? "not-allowed" : "pointer",
            fontFamily: fonts.body,
          }}
        >
          {submitting ? "Реєстрація..." : "Підтвердити участь"}
        </button>
      </div>
    </div>
  );
}
