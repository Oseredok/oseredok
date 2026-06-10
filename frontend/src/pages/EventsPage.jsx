import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { EventCard } from "../components/EventCard";
import { SkeletonCard } from "../components/SkeletonCard";
import { categoryColors } from "../constants/categoryColors";

const API = "http://127.0.0.1:8000";

function FilterDropdown({ categories, activeCategory, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          border: "1.5px solid " + (activeCategory !== "Всі" ? "#2563eb" : "#e2e8f0"),
          background: activeCategory !== "Всі" ? "#eff6ff" : "#fff",
          color: activeCategory !== "Всі" ? "#2563eb" : "#64748b",
          cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        {activeCategory === "Всі" ? "Категорія" : activeCategory}
        <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100,
          minWidth: 180, overflow: "hidden",
        }}>
          {["Всі", ...categories].map(cat => {
            const isActive = cat === activeCategory;
            const color = cat === "Всі" ? "#2563eb" : (categoryColors[cat] || "#2563eb");
            return (
              <button
                key={cat}
                onClick={() => { onChange(cat); setOpen(false); }}
                style={{
                  width: "100%", padding: "10px 16px", textAlign: "left",
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  background: isActive ? "#eff6ff" : "transparent",
                  color: isActive ? color : "#334155",
                  border: "none", cursor: "pointer",
                  borderLeft: isActive ? "3px solid " + color : "3px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f8fafc"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function EventsPage({ onTabChange, user }) {
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Всі");
  const [allCategories, setAllCategories] = useState([]);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    fetch(`${API}/events`)
      .then(r => r.json())
      .then(data => {
        const cats = [...new Set(data.map(e => e.category).filter(Boolean))];
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

    fetch(`${API}/events${params.toString() ? "?" + params.toString() : ""}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setAllEvents(data); setLoading(false); setHasLoaded(true); })
      .catch(() => { setError(true); setLoading(false); setHasLoaded(true); });
  }, [debouncedSearch, activeCategory]);

  return (
    <div>
      {user && (
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            display: "inline-block", padding: "12px 48px", borderRadius: 99,
            background: "#dbeafe", color: "#2563eb", fontSize: 18, fontWeight: 700,
          }}>
            Усі події
          </div>
        </div>
      )}

      {user ? (
        <div style={{
          background: "#fff", borderRadius: 16, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 12,
          marginBottom: 32, flexWrap: "wrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}>
          <div style={{ position: "relative", minWidth: 200 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 15, pointerEvents: "none" }}>⌕</span>
            <input
              type="text"
              placeholder="Пошук за назвою..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                padding: "9px 32px 9px 36px", borderRadius: 10, fontSize: 13,
                border: "1.5px solid #e2e8f0", background: "#f8fafc",
                color: "#0f172a", outline: "none", fontFamily: "inherit",
                width: "100%", boxSizing: "border-box", transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }}>✕</button>
            )}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {["Всі", ...allCategories].map(cat => {
              const isActive = cat === activeCategory;
              const color = cat === "Всі" ? "#2563eb" : (categoryColors[cat] || "#2563eb");
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  padding: "7px 16px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                  border: "1.5px solid " + (isActive ? color : "#e2e8f0"),
                  background: isActive ? color : "#fff",
                  color: isActive ? "#fff" : "#64748b",
                  cursor: "pointer", transition: "all 0.15s",
                }}>{cat}</button>
              );
            })}
          </div>

          <FilterDropdown categories={allCategories} activeCategory={activeCategory} onChange={setActiveCategory} />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36, flexWrap: "wrap" }}>
          <button
            onClick={() => onTabChange("organizations")}
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800,
              fontFamily: "'Playfair Display', serif",
              color: "#94a3b8", background: "none", border: "none", cursor: "pointer",
              padding: "0 0 6px", borderBottom: "3px solid transparent", lineHeight: 1,
            }}
          >Організації</button>

          <div style={{ position: "relative", flex: 1, maxWidth: 340, minWidth: 180 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 15, pointerEvents: "none" }}>⌕</span>
            <input
              type="text"
              placeholder="Пошук за назвою..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{
                width: "100%", padding: "10px 36px 10px 38px",
                borderRadius: 12, fontSize: 13, fontFamily: "inherit",
                border: "1.5px solid #e2e8f0", background: "#fff",
                color: "#0f172a", outline: "none", boxSizing: "border-box",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#2563eb"}
              onBlur={e => e.target.style.borderColor = "#e2e8f0"}
            />
            {searchInput && (
              <button onClick={() => setSearchInput("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 14 }}>✕</button>
            )}
          </div>

          <FilterDropdown categories={allCategories} activeCategory={activeCategory} onChange={setActiveCategory} />

          <button
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800,
              fontFamily: "'Playfair Display', serif",
              color: "#2563eb", background: "none", border: "none", cursor: "pointer",
              padding: "0 0 6px", borderBottom: "3px solid #2563eb", lineHeight: 1, marginLeft: "auto",
            }}
          >Події</button>
        </div>
      )}

      {user && !loading && allEvents.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", display: "inline" }}>Найближчі події</h2>
          <span style={{ fontSize: 13, color: "#94a3b8", marginLeft: 10 }}>{allEvents.length} подій</span>
        </div>
      )}

      {loading && <div className="orgs-grid">{[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}</div>}

      {!loading && error && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Не вдалося завантажити події</h3>
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Перевір чи запущений бекенд</p>
        </div>
      )}

      {!loading && !error && hasLoaded && allEvents.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#334155", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Подій не знайдено</h3>
          <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 24 }}>Спробуй інший запит або очисти фільтри</p>
          <button onClick={() => { setSearchInput(""); setActiveCategory("Всі"); }} style={{ padding: "10px 24px", borderRadius: 99, fontSize: 13, fontWeight: 700, border: "1.5px solid #2563eb", background: "#fff", color: "#2563eb", cursor: "pointer" }}>Скинути фільтри</button>
        </div>
      )}

      {!loading && allEvents.length > 0 && (
        <div className="orgs-grid">
          {allEvents.map((event, i) => <EventCard key={event.event_id} event={event} idx={i} />)}
        </div>
      )}
    </div>
  );
}