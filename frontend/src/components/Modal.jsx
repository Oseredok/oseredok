import { useEffect, useRef, useState } from "react";
import { API } from "../api";
import { colors, fonts, radius, shadows } from "../theme/tokens";
import Field from "./Field";

export default function Modal({ page, onClose, onSuccess, onSwitchPage }) {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 80);
    setForm({ email: "", password: "", confirm: "" });
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
        body: JSON.stringify({ email: form.email, password: form.password }),
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

  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: colors.overlay,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 420,
          boxShadow: shadows.modal,
          animation: "slideUp 0.25s ease",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: colors.text,
              fontFamily: fonts.heading,
              marginBottom: 6,
            }}
          >
            {page === "login" ? "Вхід до Осередку" : "Реєстрація"}
          </h2>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
            {page === "login"
              ? "Увійди у свій акаунт"
              : "Приєднуйся до спільноти НаУКМА"}
          </p>
        </div>

        <Field
          field="email"
          label="Email"
          inputRef={emailRef}
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          onKeyDown={onKeyDown}
        />
        <Field
          field="password"
          label="Пароль"
          type="password"
          form={form}
          setForm={setForm}
          errors={errors}
          setErrors={setErrors}
          onKeyDown={onKeyDown}
        />
        {page === "register" && (
          <Field
            field="confirm"
            label="Підтвердження паролю"
            type="password"
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
            onKeyDown={onKeyDown}
          />
        )}

        {serverMsg && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: radius.sm,
              background: colors.errorBg,
              border: `1px solid ${colors.error}40`,
              color: colors.error,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {serverMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: radius.md,
            fontSize: 15,
            fontWeight: 700,
            border: "none",
            background: isValid && !loading ? colors.primary : colors.borderLight,
            color: isValid && !loading ? colors.white : colors.textMuted,
            cursor: isValid && !loading ? "pointer" : "not-allowed",
            transition: "all 0.15s",
            marginBottom: 16,
            fontFamily: fonts.body,
            boxShadow: isValid && !loading ? "0 2px 8px rgba(0,82,204,0.25)" : "none",
          }}
        >
          {loading ? "Зачекай..." : page === "login" ? "Увійти" : "Зареєструватись"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: colors.textSecondary,
            fontFamily: fonts.body,
          }}
        >
          {page === "login" ? "Ще немає акаунту?" : "Вже є акаунт?"}{" "}
          <button
            type="button"
            onClick={() => onSwitchPage(page === "login" ? "register" : "login")}
            style={{
              background: "none",
              border: "none",
              color: colors.primary,
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 13,
              padding: 0,
            }}
          >
            {page === "login" ? "Зареєструватись" : "Увійти"}
          </button>
        </p>
      </div>
    </div>
  );
}
