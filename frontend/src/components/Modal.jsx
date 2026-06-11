import { useState, useEffect, useRef } from "react";
import { Field } from "./Field";

const API = "http://127.0.0.1:8000";

export function Modal({ page, onPageChange, onClose, onSuccess }) {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", full_name: "" });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 80);
    setForm({ email: "", password: "", confirm: "", full_name: "" });
    setErrors({});
    setServerMsg("");
  }, [page]);

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Некоректний email";
    else if (page === "register" && !form.email.endsWith("@ukma.edu.ua"))
      e.email = "Потрібен email @ukma.edu.ua";
    if (form.password.length < 8) e.password = "Мінімум 8 символів";
    if (page === "register" && form.password !== form.confirm)
      e.confirm = "Паролі не збігаються";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isValid =
    form.email.length > 3 &&
    form.password.length >= 8 &&
    (page === "login" || form.confirm === form.password);

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setServerMsg("");
    const endpoint = page === "register" ? "/auth/register" : "/auth/login";
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          ...(page === "register" && { full_name: form.full_name }),
        }),
      });
      const data = await res.json();
      if (res.status === 201 || res.status === 200) {
        if (page === "login") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("email", data.email);
          onSuccess({ token: data.token, email: data.email });
        } else {
          onSuccess(null);
        }
        onClose();
      } else if (res.status === 409) {
        setServerMsg("Цей email вже зареєстровано");
      } else if (res.status === 401) {
        setServerMsg("Невірний email або пароль");
      } else {
        setServerMsg("Щось пішло не так, спробуй пізніше");
      }
    } catch {
      setServerMsg("Немає зв'язку з сервером");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, padding: "40px 36px",
          width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
          animation: "slideUp 0.25s ease",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>
            {page === "login" ? "Вхід до Осередку" : "Реєстрація"}
          </h2>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            {page === "login" ? "Увійди у свій акаунт" : "Приєднуйся до спільноти НаУКМА"}
          </p>
        </div>

        {page === "register" && (
          <Field field="full_name" label="Ім'я та прізвище" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onKeyDown={onKeyDown} />
        )}
        <Field field="email" label="Email" inputRef={emailRef} form={form} setForm={setForm} errors={errors} setErrors={setErrors} onKeyDown={onKeyDown} />
        <Field field="password" label="Пароль" type="password" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onKeyDown={onKeyDown} />
        {page === "register" && (
          <Field field="confirm" label="Підтвердження паролю" type="password" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onKeyDown={onKeyDown} />
        )}

        {serverMsg && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
            {serverMsg}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            border: "none", background: isValid && !loading ? "linear-gradient(135deg, #1a56db, #3b82f6)" : "#e2e8f0",
            color: isValid && !loading ? "#fff" : "#94a3b8",
            cursor: isValid && !loading ? "pointer" : "not-allowed",
            transition: "all 0.15s", marginBottom: 16,
            boxShadow: isValid && !loading ? "0 4px 14px rgba(26,86,219,0.3)" : "none",
          }}
        >
          {loading ? "Зачекай..." : page === "login" ? "Увійти" : "Зареєструватись"}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#64748b" }}>
          {page === "login" ? "Ще немає акаунту?" : "Вже є акаунт?"}{" "}
          <button
            onClick={() => onPageChange?.(page === "login" ? "register" : "login")}
            style={{ background: "none", border: "none", color: "#1a56db", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0 }}
          >
            {page === "login" ? "Зареєструватись" : "Увійти"}
          </button>
        </p>
      </div>
    </div>
  );
}