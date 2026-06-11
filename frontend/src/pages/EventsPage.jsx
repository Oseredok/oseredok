import { useEffect, useState } from "react";
import { API } from "../api";
import EventCard from "../components/cards/EventCard";
import SkeletonCard from "../components/cards/SkeletonCard";
import FilterDropdown from "../components/FilterDropdown";
import SearchField from "../components/SearchField";
import { useDebounce } from "../hooks/useDebounce";
import { categoryColors, colors, fonts, radius } from "../theme/tokens";

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
          <SearchField
            value={searchInput}
            onChange={setSearchInput}
            placeholder="Пошук за назвою..."
          />

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
