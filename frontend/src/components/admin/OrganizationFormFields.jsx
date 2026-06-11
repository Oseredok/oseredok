import { colors, fonts, radius } from "../../theme/tokens";
import { IconInfo, IconLink, IconUser, IconSearch, IconCheck } from "./AdminIcons";

export const ORG_CATEGORIES = [
  "Технології та IT",
  "IT",
  "Debates",
  "Art",
  "Science",
  "Sport",
  "Наука",
  "Спорт",
  "Мистецтво",
  "Громадська діяльність",
  "Інше",
];

export const FACULTIES = [
  "Факультет Інформатики",
  "Факультет Економіки",
  "Факультет Гуманітарних наук",
  "Факультет Правничих наук",
  "Інше",
];

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: colors.text,
  marginBottom: 6,
  fontFamily: fonts.body,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: fonts.body,
  background: colors.surface,
};

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: radius.xl,
        border: `1px solid ${colors.borderLight}`,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: radius.md,
            background: colors.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.primary,
            flexShrink: 0,
          }}
        >
          <Icon size={20} color={colors.primary} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.text, fontFamily: fonts.heading, marginBottom: 4 }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function PrefixInput({ prefix, ...props }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <span
        style={{
          padding: "11px 12px",
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRight: "none",
          borderRadius: `${radius.md}px 0 0 ${radius.md}px`,
          color: colors.textMuted,
          fontSize: 14,
          fontFamily: fonts.body,
        }}
      >
        {prefix}
      </span>
      <input
        {...props}
        style={{ ...inputStyle, borderRadius: `0 ${radius.md}px ${radius.md}px 0`, flex: 1 }}
      />
    </div>
  );
}

export default function OrganizationFormFields({
  form,
  setForm,
  showStatus = false,
  showOwner = false,
  ownerSearch = "",
  setOwnerSearch,
  selectedOwner,
  setSelectedOwner,
}) {
  const descLen = form.description?.length || 0;

  return (
    <>
      <SectionCard icon={IconInfo} title="Основна інформація" subtitle="Назва, опис та контакти організації">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Назва організації *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Наприклад: IT Club НаУКМА"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Унікальний хендл *</label>
            <PrefixInput
              prefix="@"
              required
              value={form.handle}
              onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value.replace(/^@/, "") }))}
              placeholder="itclub_ukma"
            />
            <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 6, fontFamily: fonts.body }}>
              Тільки латинські літери, цифри та підкреслення
            </p>
          </div>

          <div>
            <label style={labelStyle}>Опис *</label>
            <textarea
              required
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value.slice(0, 500) }))}
              placeholder="Розкажіть про організацію..."
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <div style={{ textAlign: "right", fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              {descLen} / 500
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle}>Категорія *</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Оберіть категорію</option>
                {ORG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Факультет / підрозділ</label>
              <select
                value={form.faculty}
                onChange={(e) => setForm((f) => ({ ...f, faculty: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Оберіть або залиште порожнім</option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {showStatus && (
            <div>
              <label style={labelStyle}>Статус</label>
              <select
                value={form.status || "active"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="active">Активна</option>
                <option value="inactive">Неактивна</option>
              </select>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard icon={IconLink} title="Контакти та соціальні мережі" subtitle="Необов'язково, але допомагає учасникам знайти вас">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={labelStyle}>Email організації</label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
              placeholder="club@ukma.edu.ua"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Телефон</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+380 00 000 00 00"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Telegram</label>
            <PrefixInput
              prefix="t.me/"
              value={form.telegram}
              onChange={(e) => setForm((f) => ({ ...f, telegram: e.target.value }))}
              placeholder="itclub_ukma"
            />
          </div>
          <div>
            <label style={labelStyle}>Instagram</label>
            <PrefixInput
              prefix="@"
              value={form.instagram}
              onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value.replace(/^@/, "") }))}
              placeholder="itclub_ukma"
            />
          </div>
        </div>
      </SectionCard>

      {showOwner && (
        <SectionCard icon={IconUser} title="Власник сошки *" subtitle="Призначте відповідального користувача платформи">
          <div style={{ position: "relative", marginBottom: 12 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textMuted }}>
              <IconSearch size={16} />
            </span>
            <input
              value={ownerSearch}
              onChange={(e) => setOwnerSearch?.(e.target.value)}
              placeholder="Пошук за іменем або email"
              style={{ ...inputStyle, paddingLeft: 40 }}
            />
          </div>
          {selectedOwner && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 14,
                borderRadius: radius.md,
                border: `2px solid ${colors.primary}`,
                background: colors.primaryLight,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: colors.primary,
                  color: colors.white,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {selectedOwner.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{selectedOwner.name}</div>
                <div style={{ fontSize: 13, color: colors.textSecondary }}>{selectedOwner.email}</div>
              </div>
              <span style={{ color: colors.primary }}><IconCheck size={20} color={colors.primary} /></span>
            </div>
          )}
          <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 12, fontFamily: fonts.body }}>
            Власник зможе керувати організацією та її подіями. Роль буде оновлено автоматично.
          </p>
        </SectionCard>
      )}
    </>
  );
}
