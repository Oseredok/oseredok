import { useEffect, useState, useRef, useCallback } from "react";

const API = "http://127.0.0.1:8000";

// ── debounce hook ──
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── animate number counting up ──
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

function CategoryPill({ cat, small }) {
  const color = categoryColors[cat] || categoryColors.default;
  return (
    <span style={{
      display: "inline-block",
      padding: small ? "2px 10px" : "3px 12px",
      borderRadius: 99,
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      background: color + "18",
      color,
      border: `1px solid ${color}40`,
      whiteSpace: "nowrap",
    }}>{cat}</span>
  );
}

// ── Skeleton card ──
function SkeletonCard() {
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e8edf5",
      borderRadius: 18,
      padding: "28px 28px",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
        <div style={{ width: 70, height: 20, borderRadius: 99, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      </div>
      <div style={{ width: "65%", height: 18, borderRadius: 6, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginBottom: 10 }} />
      <div style={{ width: "100%", height: 13, borderRadius: 6, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", marginBottom: 7 }} />
      <div style={{ width: "80%", height: 13, borderRadius: 6, background: "linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
    </div>
  );
}

// ── Org card ──
function OrgCard({ org, idx, onNavigate }) {
  const [hovered, setHovered] = useState(false);
  const color = categoryColors[org.category] || categoryColors.default;
  const initial = org.name[0]?.toUpperCase() || "?";

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(org)}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onNavigate(org)}
      style={{
        background: "#fff",
        border: hovered ? `1.5px solid ${color}` : "1.5px solid #e8edf5",
        borderRadius: 16,
        padding: "28px 28px 24px",
        transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
        cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered
          ? `0 8px 32px ${color}20`
          : "0 1px 4px rgba(0,0,0,0.05)",
        animationDelay: `${idx * 60}ms`,
        animation: "fadeUp 0.45s ease both",
        display: "flex",
        flexDirection: "column",
        outline: "none",
      }}
    >
      {/* Top row: logo + category */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: org.logo_url
            ? `url(${org.logo_url}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color} 0%, ${color}bb 100%)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, fontWeight: 800, color: "#fff",
          fontFamily: "'Playfair Display', serif",
          boxShadow: `0 4px 14px ${color}35`,
        }}>
          {!org.logo_url && initial}
        </div>
        {org.category && <CategoryPill cat={org.category} small />}
      </div>

      {/* Name */}
      <h3 style={{
        margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#0f172a",
        fontFamily: "'Playfair Display', serif", lineHeight: 1.3,
      }}>
        {org.name}
      </h3>

      {/* Description — 2 lines max */}
      <p style={{
        margin: "0 0 20px", fontSize: 14, color: "#64748b", lineHeight: 1.65,
        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        overflow: "hidden", flexGrow: 1,
      }}>
        {org.description || "Студентська організація НаУКМА"}
      </p>

      {/* Arrow link */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 12, fontWeight: 700,
        color: hovered ? color : "#94a3b8",
        letterSpacing: "0.06em", textTransform: "uppercase",
        transition: "color 0.2s",
        borderTop: "1px solid #f1f5f9",
        paddingTop: 16,
      }}>
        Детальніше
        <span style={{
          display: "inline-block",
          transform: hovered ? "translateX(5px)" : "translateX(0)",
          transition: "transform 0.2s",
        }}>→</span>
      </div>
    </div>
  );
}

// ── Auth Field ──
function Field({ field, label, type = "text", inputRef, form, setForm, errors, setErrors, onKeyDown }) {
  const placeholders = {
    email: "ім'я@ukma.edu.ua",
    password: "мінімум 8 символів",
    confirm: "повторіть пароль",
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

// ── Auth Modal ──
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
            onClick={() => onSuccess === undefined ? onClose() : null}
            style={{ background: "none", border: "none", color: "#1a56db", fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0 }}
          >
            {page === "login" ? "Зареєструватись" : "Увійти"}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Organization Detail Page ──
function OrgDetailPage({ org, onBack }) {
  const color = categoryColors[org.category] || categoryColors.default;
  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "9px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
          border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155",
          cursor: "pointer", marginBottom: 32, transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.color = "#1a56db"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
      >
        ← Назад до організацій
      </button>

      <div style={{
        background: "#fff", borderRadius: 24, padding: "40px",
        border: "1.5px solid #e8edf5",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, flexShrink: 0,
            background: org.logo_url
              ? `url(${org.logo_url}) center/cover no-repeat`
              : `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff",
            fontFamily: "'Playfair Display', serif",
            boxShadow: `0 8px 24px ${color}30`,
          }}>
            {!org.logo_url && org.name[0]}
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
              {org.name}
            </h1>
            {org.category && <CategoryPill cat={org.category} />}
          </div>
        </div>

        {org.description && (
          <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.8, marginBottom: 24 }}>
            {org.description}
          </p>
        )}

        {org.contact_email && (
          <a
            href={`mailto:${org.contact_email}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: color + "12", color, border: `1.5px solid ${color}30`,
              textDecoration: "none", transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = color + "22"}
            onMouseLeave={e => e.currentTarget.style.background = color + "12"}
          >
            ✉ {org.contact_email}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Organizations List Page ──
function OrganizationsPage({ onNavigateToOrg }) {
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // розрізняємо "ще не було запиту" від "запит завершено"
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Всі");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch with search + category params
  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (activeCategory !== "Всі") params.set("category", activeCategory);

    const url = `${API}/organizations${params.toString() ? "?" + params.toString() : ""}`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setAllOrgs(data); setLoading(false); setHasLoaded(true); })
      .catch(() => { setError(true); setLoading(false); setHasLoaded(true); });
  }, [debouncedSearch, activeCategory]);

  // Fetch all orgs once to get all categories for filter buttons
  const [allCategories, setAllCategories] = useState([]);
  useEffect(() => {
    fetch(`${API}/organizations`)
      .then(r => r.json())
      .then(data => {
        const cats = [...new Set(data.map(o => o.category).filter(Boolean))];
        setAllCategories(cats);
      })
      .catch(() => {});
  }, []);

  const categories = ["Всі", ...allCategories];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "#0f172a",
          fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em",
          marginBottom: 8, textAlign: "left",
        }}>
          Організації
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", textAlign: "left" }}>
          Знайди студентську організацію за інтересами
        </p>
      </div>

      {/* Search + filter bar */}
      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Search input */}
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "#94a3b8", fontSize: 16, pointerEvents: "none",
          }}>
            ⌕
          </div>
          <input
            type="text"
            placeholder="Пошук за назвою..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{
              width: "100%", padding: "12px 16px 12px 42px",
              borderRadius: 14, fontSize: 14, fontFamily: "inherit",
              border: "1.5px solid #e2e8f0", background: "#fff",
              color: "#0f172a", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
            onFocus={e => {
              e.target.style.borderColor = "#1a56db";
              e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.1)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
            }}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#94a3b8", cursor: "pointer",
                fontSize: 16, padding: 4, lineHeight: 1,
              }}
            >✕</button>
          )}
        </div>

        {/* Category filter pills */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map(cat => {
              const isActive = cat === activeCategory;
              const color = cat === "Всі" ? "#1a56db" : (categoryColors[cat] || categoryColors.default);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                    letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer",
                    transition: "all 0.15s",
                    border: isActive ? `1.5px solid ${color}` : "1.5px solid #e2e8f0",
                    background: isActive ? color : "#fff",
                    color: isActive ? "#fff" : "#64748b",
                    boxShadow: isActive ? `0 4px 12px ${color}30` : "none",
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <div style={{ marginBottom: 20, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          {allOrgs.length > 0
            ? `${allOrgs.length} ${allOrgs.length === 1 ? "організація" : allOrgs.length < 5 ? "організації" : "організацій"}`
            : ""}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="orgs-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease both" }}>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
            Не вдалося завантажити організації
          </h3>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
            Перевір чи запущений бекенд на <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>http://127.0.0.1:8000</code>
          </p>
        </div>
      )}

      {/* Empty state — тільки якщо запит завершено успішно але результатів немає */}
      {!loading && !error && hasLoaded && allOrgs.length === 0 && (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          animation: "fadeUp 0.4s ease both",
        }}>

          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
            Організацій не знайдено
          </h3>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
            Спробуй інший запит або очисти фільтри
          </p>
          <button
            onClick={() => { setSearchInput(""); setActiveCategory("Всі"); }}
            style={{
              padding: "10px 24px", borderRadius: 99, fontSize: 13, fontWeight: 700,
              border: "1.5px solid #1a56db", background: "#fff", color: "#1a56db",
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a56db"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a56db"; }}
          >
            Скинути фільтри
          </button>
        </div>
      )}

      {/* Cards grid */}
      {!loading && allOrgs.length > 0 && (
        <div className="orgs-grid">
          {allOrgs.map((org, i) => (
            <OrgCard key={org.organization_id} org={org} idx={i} onNavigate={onNavigateToOrg} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [page, setPage] = useState(null); // null | "login" | "register"
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    return token && email ? { token, email } : null;
  });
  const [view, setView] = useState("home"); // "home" | "organizations" | "org-detail"
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgsCount, setOrgsCount] = useState(0);
  const orgCount = useCount(orgsCount);

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then(r => r.json())
      .then(d => setOrgsCount(d.length))
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
  };

  const handleSuccess = (userData) => {
    if (userData) setUser(userData);
  };

  const navigateToOrg = (org) => {
    setSelectedOrg(org);
    setView("org-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .orgs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .orgs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .orgs-grid { grid-template-columns: 1fr; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f6ff; }
        ::-webkit-scrollbar-thumb { background: #c7d7f5; border-radius: 3px; }
      `}</style>

      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)", opacity: 0.6 }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)", opacity: 0.5 }} />
      </div>

      {/* NAVBAR — sticky, full width */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(240,246,255,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226,232,240,0.6)",
      }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1200, margin: "0 auto", padding: "16px 24px",
          flexWrap: "wrap", gap: 12,
        }}>
          <button
            onClick={() => setView("home")}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #1a56db, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, animation: "float 3s ease-in-out infinite",
            }}>✦</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}>
              Осередок
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Nav link to organizations */}
            <button
              onClick={() => { setView("organizations"); setSelectedOrg(null); }}
              style={{
                padding: "9px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: view === "organizations" || view === "org-detail" ? "1.5px solid #1a56db" : "1.5px solid #e2e8f0",
                background: view === "organizations" || view === "org-detail" ? "#dbeafe" : "#fff",
                color: view === "organizations" || view === "org-detail" ? "#1a56db" : "#334155",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              Організації
            </button>

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
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.color = "#1a56db"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
                >Вийти</button>
              </>
            ) : (
              <>
                <button onClick={() => setPage("login")} style={{
                  padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                  border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.color = "#1a56db"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
                >Увійти</button>
                <button onClick={() => setPage("register")} style={{
                  padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                  border: "none", background: "linear-gradient(135deg, #1a56db, #3b82f6)",
                  color: "#fff", cursor: "pointer", transition: "all 0.15s",
                  boxShadow: "0 4px 14px rgba(26,86,219,0.3)",
                }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >Реєстрація</button>
              </>
            )}
          </div>
        </nav>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ── HOME VIEW ── */}
        {view === "home" && (
          <>
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

              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
                <button
                  onClick={() => setView("organizations")}
                  style={{
                    padding: "13px 28px", borderRadius: 99, fontSize: 15, fontWeight: 700,
                    border: "none", background: "linear-gradient(135deg, #1a56db, #3b82f6)",
                    color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.3)",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  Переглянути організації →
                </button>
              </div>

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

            {!user && (
              <div style={{
                textAlign: "center", padding: "48px 40px",
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
                  onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a56db"; }}
                >
                  Приєднатись безкоштовно →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ORGANIZATIONS LIST VIEW ── */}
        {view === "organizations" && (
          <OrganizationsPage onNavigateToOrg={navigateToOrg} />
        )}

        {/* ── ORG DETAIL VIEW ── */}
        {view === "org-detail" && selectedOrg && (
          <OrgDetailPage
            org={selectedOrg}
            onBack={() => setView("organizations")}
          />
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