import { useEffect, useState, useRef } from "react";

const API = "http://127.0.0.1:8000";

// ── tiny hook: animate number counting up ──
function useCount(target, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target]);
  return val;
}

const categoryColors = {
  Debates: "#1a56db",
  IT: "#0e9f6e",
  Art: "#7e3af2",
  Science: "#ff5a1f",
  Sport: "#e3a008",
  default: "#1a56db",
};

function CategoryPill({ cat }) {
  const color = categoryColors[cat] || categoryColors.default;
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 12px",
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      background: color + "18",
      color,
      border: `1px solid ${color}40`,
    }}>{cat}</span>
  );
}

function OrgCard({ org, idx }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#f0f6ff" : "#fff",
        border: hovered ? "1.5px solid #1a56db" : "1.5px solid #e8edf5",
        borderRadius: 18,
        padding: "28px 32px",
        transition: "all 0.22s cubic-bezier(.4,0,.2,1)",
        cursor: "default",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered
          ? "0 12px 40px rgba(26,86,219,0.13)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        animationDelay: `${idx * 80}ms`,
        animation: "fadeUp 0.5s ease both",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 12,
          background: "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>
          {org.name[0]}
        </div>
        {org.category && <CategoryPill cat={org.category} />}
      </div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
        {org.name}
      </h3>
      <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
        {org.description || "Студентська організація НаУКМА"}
      </p>
    </div>
  );
}

function Modal({ page, onClose, onSuccess }) {
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
        setServerMsg("Помилка сервера, спробуйте пізніше");
      }
    } catch {
      setServerMsg("Не вдалося з'єднатися з сервером");
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && isValid) handleSubmit(); };

  const Field = ({ field, label, type = "text", inputRef }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        placeholder={type === "email" ? "ім'я@ukma.edu.ua" : "••••••••"}
        value={form[field]}
        onChange={(e) => {
          setForm(f => ({ ...f, [field]: e.target.value }));
          if (errors[field]) setErrors(er => ({ ...er, [field]: "" }));
        }}
        onKeyDown={handleKey}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
          border: errors[field] ? "1.5px solid #ef4444" : "1.5px solid #e2e8f0",
          outline: "none", boxSizing: "border-box",
          background: "#f8fafc", color: "#0f172a",
          transition: "border-color 0.15s",
          fontFamily: "inherit",
        }}
        onFocus={e => e.target.style.borderColor = errors[field] ? "#ef4444" : "#1a56db"}
        onBlur={e => e.target.style.borderColor = errors[field] ? "#ef4444" : "#e2e8f0"}
      />
      {errors[field] && <p style={{ margin: "5px 0 0", fontSize: 12, color: "#ef4444" }}>{errors[field]}</p>}
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
        justifyContent: "center", zIndex: 100, animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, padding: "40px 44px",
          width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
          animation: "slideUp 0.25s cubic-bezier(.4,0,.2,1)",
          position: "relative",
        }}
      >
        <button onClick={onClose} style={{
          position: "absolute", top: 18, right: 20,
          background: "none", border: "none", fontSize: 20,
          cursor: "pointer", color: "#94a3b8", lineHeight: 1,
        }}>✕</button>

        <div style={{ marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, marginBottom: 16,
            background: "linear-gradient(135deg, #1a56db, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 22 }}>{page === "register" ? "✦" : "→"}</span>
          </div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
            {page === "register" ? "Реєстрація" : "Вхід"}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>
            {page === "register" ? "Приєднуйся до спільноти НаУКМА" : "З поверненням до Осередку"}
          </p>
        </div>

        <Field field="email" label="Email" type="email" inputRef={emailRef} />
        <Field field="password" label="Пароль" type="password" />
        {page === "register" && <Field field="confirm" label="Підтвердження паролю" type="password" />}

        {serverMsg && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#dc2626" }}>{serverMsg}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, fontSize: 15,
            fontWeight: 700, border: "none", cursor: isValid && !loading ? "pointer" : "not-allowed",
            background: isValid && !loading
              ? "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)"
              : "#e2e8f0",
            color: isValid && !loading ? "#fff" : "#94a3b8",
            transition: "all 0.18s",
            transform: isValid && !loading ? "none" : "none",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={e => { if (isValid && !loading) e.target.style.transform = "scale(1.01)"; }}
          onMouseLeave={e => e.target.style.transform = "none"}
        >
          {loading ? "Завантаження..." : page === "register" ? "Зареєструватись" : "Увійти"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(null);
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    const e = localStorage.getItem("email");
    return t ? { token: t, email: e } : null;
  });
  const orgCount = useCount(organizations.length, 1000);

  useEffect(() => {
    fetch(`${API}/organizations`).then(r => r.json()).then(setOrganizations).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  const handleSuccess = (userData) => {
    if (userData) setUser(userData);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Manrope:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Manrope', sans-serif; background: #f0f6ff; color: #0f172a; min-height: 100vh; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #f0f6ff; } ::-webkit-scrollbar-thumb { background: #c7d7f5; border-radius: 3px; }
      `}</style>

      {/* HERO BACKGROUND */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)", opacity: 0.6 }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)", opacity: 0.5 }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* NAVBAR */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "24px 0 0", marginBottom: 60,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #1a56db, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, animation: "float 3s ease-in-out infinite",
            }}>✦</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}>
              Осередок
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {user ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#fff", borderRadius: 99, border: "1.5px solid #e2e8f0" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #1a56db, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                    {user.email[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{user.email}</span>
                </div>
                <button onClick={logout} style={{
                  padding: "9px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                  border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#1a56db"; e.target.style.color = "#1a56db"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.color = "#64748b"; }}
                >Вийти</button>
              </>
            ) : (
              <>
                <button onClick={() => setPage("login")} style={{
                  padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                  border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.target.style.borderColor = "#1a56db"; e.target.style.color = "#1a56db"; }}
                  onMouseLeave={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.color = "#334155"; }}
                >Увійти</button>
                <button onClick={() => setPage("register")} style={{
                  padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                  border: "none", background: "linear-gradient(135deg, #1a56db, #3b82f6)",
                  color: "#fff", cursor: "pointer", transition: "all 0.15s",
                  boxShadow: "0 4px 14px rgba(26,86,219,0.3)",
                }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.target.style.transform = "none"}
                >Реєстрація</button>
              </>
            )}
          </div>
        </nav>

        {/* HERO */}
        <div style={{ textAlign: "center", marginBottom: 64, animation: "fadeUp 0.6s ease both" }}>
          <div style={{
            display: "inline-block", padding: "5px 16px", borderRadius: 99,
            background: "#dbeafe", color: "#1a56db", fontSize: 12,
            fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            marginBottom: 20,
          }}>
            НаУКМА · Студентська спільнота
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 62px)", fontWeight: 800, lineHeight: 1.1,
            fontFamily: "'Playfair Display', serif", color: "#0f172a",
            letterSpacing: "-0.03em", marginBottom: 18,
          }}>
            Знайди своє<br />
            <span style={{ background: "linear-gradient(135deg, #1a56db, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              місце в університеті
            </span>
          </h1>
          <p style={{ fontSize: 17, color: "#64748b", maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.7 }}>
            Платформа для пошуку студентських організацій та реєстрації на події НаУКМА
          </p>

          {/* STATS */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              { label: "організацій", value: orgCount },
              { label: "активних членів", value: "200+" },
              { label: "подій на рік", value: "50+" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1a56db", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>
            Організації
          </h2>
          <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{organizations.length} знайдено</span>
        </div>

        {/* CARDS GRID */}
        {organizations.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>○</div>
            <p>Завантаження організацій...</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {organizations.map((org, i) => <OrgCard key={org.organization_id} org={org} idx={i} />)}
          </div>
        )}

        {/* CTA */}
        {!user && (
          <div style={{
            marginTop: 64, textAlign: "center", padding: "48px 40px",
            background: "linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)",
            borderRadius: 24, color: "#fff", animation: "fadeUp 0.6s ease 0.3s both",
          }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>
              Готовий долучитись?
            </h3>
            <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 24 }}>
              Зареєструйся і знаходь події та організації за інтересами
            </p>
            <button onClick={() => setPage("register")} style={{
              padding: "13px 32px", borderRadius: 99, fontSize: 15, fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.5)", background: "#fff",
              color: "#1a56db", cursor: "pointer", transition: "all 0.18s",
            }}
              onMouseEnter={e => { e.target.style.background = "transparent"; e.target.style.color = "#fff"; }}
              onMouseLeave={e => { e.target.style.background = "#fff"; e.target.style.color = "#1a56db"; }}
            >
              Приєднатись безкоштовно →
            </button>
          </div>
        )}
      </div>

      {page && (
        <Modal
          page={page}
          onClose={() => setPage(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}