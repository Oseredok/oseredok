import { useEffect, useRef, useState } from "react";
import { API } from "../api";
import EventCard from "../components/cards/EventCard";
import SkeletonCard from "../components/cards/SkeletonCard";
import { useDebounce } from "../hooks/useDebounce";
import { categoryColors, colors, fonts, radius } from "../theme/tokens";

function FilterDropdown({ categories, activeCategory, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderRadius: radius.md,
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${activeCategory !== "Всі" ? colors.primary : colors.border}`,
          background: activeCategory !== "Всі" ? colors.primaryLight : colors.surface,
          color: activeCategory !== "Всі" ? colors.primary : colors.textSecondary,
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: fonts.body,
        }}
      >
        {activeCategory === "Всі" ? "Категорія" : activeCategory}
        <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            background: colors.surface,
            borderRadius: radius.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 8px 24px rgba(9,30,66,0.12)",
            zIndex: 100,
            minWidth: 180,
            overflow: "hidden",
          }}
        >
          {["Всі", ...categories].map((cat) => {
            const isActive = cat === activeCategory;
            const color =
              cat === "Всі" ? colors.primary : categoryColors[cat] || categoryColors.default;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange(cat);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? colors.primaryLight : "transparent",
                  color: isActive ? color : colors.text,
                  border: "none",
                  cursor: "pointer",
                  borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
                  fontFamily: fonts.body,
                }}
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

export default function EventsPage({ user, onNavigateToEvent, onViewChange }) {
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
      .then((r) => r.json())
      .then((data) => {
        const cats = [...new Set(data.map((e) => e.category).filter(Boolean))];
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
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setAllEvents(data);
        setLoading(false);
        setHasLoaded(true);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
        setHasLoaded(true);
      });
  }, [debouncedSearch, activeCategory]);

  const categories = ["Всі", ...allCategories];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 36px)",
            fontWeight: 800,
            color: colors.text,
            fontFamily: fonts.heading,
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Події
        </h1>
        <p style={{ fontSize: 15, color: colors.textSecondary, fontFamily: fonts.body }}>
          Знайди цікаві події студентських організацій
        </p>
      </div>

      <div
        style={{
          marginBottom: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <div
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.textMuted,
                fontSize: 16,
                pointerEvents: "none",
              }}
            >
              ⌕
            </div>
            <input
              type="text"
              placeholder="Пошук за назвою..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: radius.md,
                fontSize: 14,
                fontFamily: fonts.body,
                border: `1px solid ${colors.border}`,
                background: colors.surface,
                color: colors.text,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
                boxShadow: "0 1px 2px rgba(9,30,66,0.06)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colors.primary;
                e.target.style.boxShadow = "0 0 0 3px rgba(0,82,204,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
                e.target.style.boxShadow = "0 1px 2px rgba(9,30,66,0.06)";
              }}
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: colors.textMuted,
                  cursor: "pointer",
                  fontSize: 16,
                  padding: 4,
                }}
              >
                ✕
              </button>
            )}
          </div>

          <FilterDropdown
            categories={allCategories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />

          {user && (
            <button
              type="button"
              onClick={() => onViewChange("create-event")}
              style={{
                padding: "10px 20px",
                borderRadius: radius.md,
                fontSize: 14,
                fontWeight: 700,
                border: "none",
                background: colors.primary,
                color: colors.white,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,82,204,0.25)",
                fontFamily: fonts.body,
                whiteSpace: "nowrap",
              }}
            >
              + Створити подію
            </button>
          )}
        </div>

        {categories.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((cat) => {
              const isActive = cat === activeCategory;
              const color =
                cat === "Всі" ? colors.primary : categoryColors[cat] || categoryColors.default;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: radius.pill,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    border: isActive ? `1.5px solid ${color}` : `1px solid ${colors.border}`,
                    background: isActive ? color : colors.surface,
                    color: isActive ? colors.white : colors.textSecondary,
                    fontFamily: fonts.body,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {!loading && allEvents.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            fontSize: 13,
            color: colors.textMuted,
            fontWeight: 500,
            fontFamily: fonts.body,
          }}
        >
          {allEvents.length}{" "}
          {allEvents.length === 1 ? "подія" : allEvents.length < 5 ? "події" : "подій"}
        </div>
      )}

      {loading && (
        <div className="cards-grid">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 8,
              fontFamily: fonts.heading,
            }}
          >
            Не вдалося завантажити події
          </h3>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body }}>
            Перевір чи запущений бекенд
          </p>
        </div>
      )}

      {!loading && !error && hasLoaded && allEvents.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 8,
              fontFamily: fonts.heading,
            }}
          >
            Подій не знайдено
          </h3>
          <p
            style={{
              fontSize: 14,
              color: colors.textMuted,
              marginBottom: 24,
              fontFamily: fonts.body,
            }}
          >
            Спробуй інший запит або очисти фільтри
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setActiveCategory("Всі");
            }}
            style={{
              padding: "10px 24px",
              borderRadius: radius.pill,
              fontSize: 13,
              fontWeight: 700,
              border: `1.5px solid ${colors.primary}`,
              background: colors.surface,
              color: colors.primary,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Скинути фільтри
          </button>
        </div>
      )}

      {!loading && allEvents.length > 0 && (
        <div className="cards-grid">
          {allEvents.map((event, i) => (
            <EventCard
              key={event.event_id}
              event={{
                ...event,
                org_name: event.org_name || event.organization_name,
              }}
              idx={i}
              onNavigate={onNavigateToEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
