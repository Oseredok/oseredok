import { useMemo, useState } from "react";
import EventCard from "../components/cards/EventCard";
import { filterEvents, getEventCategories, mockEvents } from "../data/mockEvents";
import { useDebounce } from "../hooks/useDebounce";
import { categoryColors, colors, fonts, radius } from "../theme/tokens";

export default function EventsPage({ onNavigateToEvent }) {
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Всі");
  const debouncedSearch = useDebounce(searchInput, 300);

  const categories = useMemo(() => ["Всі", ...getEventCategories(mockEvents)], []);

  const filteredEvents = useMemo(
    () => filterEvents(mockEvents, { search: debouncedSearch, category: activeCategory }),
    [debouncedSearch, activeCategory]
  );

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

      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ position: "relative" }}>
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
            placeholder="Пошук за назвою або організацією..."
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
      </div>

      <div
        style={{
          marginBottom: 20,
          fontSize: 13,
          color: colors.textMuted,
          fontWeight: 500,
          fontFamily: fonts.body,
        }}
      >
        {filteredEvents.length > 0
          ? `${filteredEvents.length} ${filteredEvents.length === 1 ? "подія" : filteredEvents.length < 5 ? "події" : "подій"}`
          : ""}
      </div>

      {filteredEvents.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 20px",
            animation: "fadeUp 0.4s ease both",
          }}
        >
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
          <p style={{ fontSize: 14, color: colors.textMuted, marginBottom: 24, fontFamily: fonts.body }}>
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

      {filteredEvents.length > 0 && (
        <div className="cards-grid">
          {filteredEvents.map((event, i) => (
            <EventCard key={event.event_id} event={event} idx={i} onNavigate={onNavigateToEvent} />
          ))}
        </div>
      )}
    </div>
  );
}
