export function Field({ field, label, type = "text", inputRef, form, setForm, errors, setErrors, onKeyDown }) {
  const placeholders = {
    email: "ім'я@ukma.edu.ua",
    password: "мінімум 8 символів",
    confirm: "повторіть пароль",
    full_name: "Ім'я Прізвище",
  };
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600, color: "#475569",
        marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase",
      }}>{label}</label>
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholders[field] || ""}
        value={form[field]}
        onChange={(e) => {
          setForm(f => ({ ...f, [field]: e.target.value }));
          if (errors[field]) setErrors(er => ({ ...er, [field]: "" }));
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
        spellCheck={false}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
          border: errors[field] ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
          outline: "none", boxSizing: "border-box",
          background: "#f8fafc", color: "#0f172a",
          transition: "border-color 0.15s", fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = errors[field] ? "#ef4444" : "#1a56db"}
        onBlur={e => e.target.style.borderColor = errors[field] ? "#ef4444" : "#e2e8f0"}
      />
      {errors[field] && <p style={{ margin: "5px 0 0", fontSize: 12, color: "#ef4444" }}>{errors[field]}</p>}
    </div>
  );
}