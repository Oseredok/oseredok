import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { OrgCard } from "../components/OrgCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { categoryColors } from "../constants/categoryColors";

const API = "http://127.0.0.1:8000";

export function OrganizationsPage({ onNavigateToOrg }) {
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Всі");
  const [allCategories, setAllCategories] = useState([]);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then(r => r.json())
      .then(data => {
        const cats = [...new Set(data.map(o => o.category).filter(Boolean))];
        setAllCategories(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (activeCategory !== "Всі") params.set("category", activeCategory);

    fetch(`${API}/organizations${params.toString() ? "?" + params.toString() : ""}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setAllOrgs(data); setLoading(false); setHasLoaded(true); })
      .catch(() => { setError(true); setLoading(false); setHasLoaded(true); });
  }, [debouncedSearch, activeCategory]);

  const categories = ["Всі", ...allCategories];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, color: "#0f172a",
          fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em",
          marginBottom: 8,
        }}>
          Події
        </h1>
        <p style={{ fontSize: 15, color: "#64748b" }}>
          Знайди студентську організацію за інтересами
        </p>
      </div>

      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative" }}>
          <div style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: "#94a3b8", fontSize: 16, pointerEvents: "none",
          }}>⌕</div>
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
            onFocus={e => { e.target.style.borderColor = "#1a56db"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
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
                >{cat}</button>
              );
            })}
          </div>
        )}
      </div>

      {!loading && (
        <div style={{ marginBottom: 20, fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>
          {allOrgs.length > 0
            ? `${allOrgs.length} ${allOrgs.length === 1 ? "організація" : allOrgs.length < 5 ? "організації" : "організацій"}`
            : ""}
        </div>
      )}

      {loading && (
        <div className="orgs-grid">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>
            Не вдалося завантажити події
          </h3>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>
            Перевір чи запущений бекенд на <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>http://127.0.0.1:8000</code>
          </p>
        </div>
      )}

      {!loading && !error && hasLoaded && allOrgs.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
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
              cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a56db"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#1a56db"; }}
          >
            Скинути фільтри
          </button>
        </div>
      )}

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