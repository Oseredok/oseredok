import { colors, fonts, radius, shadows } from "../theme/tokens";

const placeholders = {
  email: "ім'я@ukma.edu.ua",
  password: "мінімум 8 символів",
  confirm: "повторіть пароль",
};

export default function Field({
  field,
  label,
  type = "text",
  inputRef,
  form,
  setForm,
  errors,
  setErrors,
  onKeyDown,
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: colors.textSecondary,
          marginBottom: 6,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontFamily: fonts.body,
        }}
      >
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholders[field] || ""}
        value={form[field]}
        onChange={(e) => {
          setForm((f) => ({ ...f, [field]: e.target.value }));
          if (errors[field]) setErrors((er) => ({ ...er, [field]: "" }));
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: radius.md,
          fontSize: 15,
          border: errors[field]
            ? `1.5px solid ${colors.error}`
            : `1.5px solid ${colors.border}`,
          outline: "none",
          boxSizing: "border-box",
          background: colors.bg,
          color: colors.text,
          transition: "border-color 0.15s",
          fontFamily: fonts.body,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = errors[field] ? colors.error : colors.primary;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = errors[field] ? colors.error : colors.border;
        }}
      />
      {errors[field] && (
        <p style={{ margin: "5px 0 0", fontSize: 12, color: colors.error }}>
          {errors[field]}
        </p>
      )}
    </div>
  );
}
