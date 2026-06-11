import { useEffect, useMemo, useState } from "react";
import { API } from "../api";
import OrgCard from "../components/cards/OrgCard";
import EventCard from "../components/cards/EventCard";
import SkeletonCard from "../components/cards/SkeletonCard";
import FilterDropdown from "../components/FilterDropdown";
import SearchField from "../components/SearchField";
import { IconArrowRight } from "../components/ui/Icons";
import { useCount } from "../hooks/useCount";
import { useDebounce } from "../hooks/useDebounce";
import { colors, fonts, radius } from "../theme/tokens";

function tabBtn(active) {
  return {
    padding: "11px 24px",
    borderRadius: radius.md,
    fontSize: 14,
    fontWeight: 700,
    border: active ? "none" : `1.5px solid ${colors.border}`,
    background: active ? colors.primary : colors.surface,
    color: active ? colors.white : colors.textSecondary,
    cursor: "pointer",
    fontFamily: fonts.body,
    whiteSpace: "nowrap",
    flexShrink: 0,
    boxShadow: active ? "0 2px 8px rgba(0,82,204,0.2)" : "none",
    transition: "all 0.15s",
  };
}

export default function HomePage({ user, orgCount, onNavigate, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState("organizations");
  const [organizations, setOrganizations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Всі");
  const debouncedSearch = useDebounce(searchInput, 300);
  const animatedCount = useCount(orgCount);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (activeCategory !== "Всі") params.set("category", activeCategory);

    const orgUrl = `${API}/organizations${params.toString() ? "?" + params.toString() : ""}`;
    const eventUrl = `${API}/events${params.toString() ? "?" + params.toString() : ""}`;

    Promise.all([
      fetch(orgUrl).then((r) => (r.ok ? r.json() : [])),
      fetch(eventUrl).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([orgs, evts]) => {
        setOrganizations(orgs);
        setEvents(evts);
      })
      .catch(() => {
        setOrganizations([]);
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, activeCategory]);

  const categories = useMemo(() => {
    const source = activeTab === "organizations" ? organizations : events;
    return [...new Set(source.map((item) => item.category).filter(Boolean))];
  }, [activeTab, organizations, events]);

  const items = activeTab === "organizations" ? organizations : events;

  return (
    <div>
      <section
        style={{
          textAlign: "center",
          marginBottom: 40,
          padding: "32px 0 0",
          animation: "fadeUp 0.6s ease both",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "5px 16px",
            borderRadius: radius.pill,
            background: colors.primaryLight,
            color: colors.primary,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 20,
            fontFamily: fonts.body,
          }}
        >
          НаУКМА · Студентська спільнота
        </div>

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 800,
            lineHeight: 1.12,
            fontFamily: fonts.heading,
            color: colors.text,
            letterSpacing: "-0.03em",
            margin: "0 auto 16px",
            maxWidth: 720,
          }}
        >
          Знайди своє
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, #4C9AFF)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            місце в університеті
          </span>
        </h1>

        <p
          style={{
            fontSize: 17,
            color: colors.textSecondary,
            maxWidth: 520,
            margin: "0 auto 32px",
            lineHeight: 1.7,
            fontFamily: fonts.body,
          }}
        >
          Платформа для пошуку студентських організацій та реєстрації на події НаУКМА
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 40,
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "організацій", value: animatedCount },
            { label: "активних членів", value: "200+" },
            { label: "подій на рік", value: "50+" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: colors.primary, fontFamily: fonts.heading }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13, color: colors.textMuted, fontWeight: 500, fontFamily: fonts.body }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ animation: "fadeUp 0.6s ease 0.15s both" }}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 12,
            marginBottom: 28,
          }}
          className="home-nav-bar"
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("organizations");
              setActiveCategory("Всі");
            }}
            style={tabBtn(activeTab === "organizations")}
          >
            Організації
          </button>

          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "stretch",
              gap: 10,
              minWidth: 0,
            }}
          >
            <SearchField
              value={searchInput}
              onChange={setSearchInput}
              placeholder={activeTab === "organizations" ? "Пошук організацій..." : "Пошук подій..."}
            />
            <FilterDropdown
              categories={categories}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab("events");
              setActiveCategory("Всі");
            }}
            style={tabBtn(activeTab === "events")}
          >
            Події
          </button>
        </div>

        {loading ? (
          <div className="cards-grid">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 20px",
              color: colors.textMuted,
              fontFamily: fonts.body,
            }}
          >
            {activeTab === "organizations" ? "Організацій не знайдено" : "Подій не знайдено"}
          </div>
        ) : (
          <div className="cards-grid">
            {activeTab === "organizations"
              ? organizations.map((org, i) => (
                  <OrgCard
                    key={org.organization_id}
                    org={org}
                    idx={i}
                    onNavigate={() => onNavigate("organizations", org)}
                  />
                ))
              : events.map((event, i) => (
                  <EventCard
                    key={event.event_id}
                    event={{ ...event, org_name: event.org_name || event.organization_name }}
                    idx={i}
                    onNavigate={() => onNavigate("events", event)}
                  />
                ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <button
            type="button"
            onClick={() => onNavigate(activeTab === "organizations" ? "organizations" : "events")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              color: colors.primary,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            {activeTab === "organizations" ? "Всі організації" : "Всі події"}
            <IconArrowRight size={16} color={colors.primary} />
          </button>
        </div>
      </section>

      {!user && (
        <section
          style={{
            textAlign: "center",
            padding: "40px 32px",
            background: colors.primary,
            borderRadius: radius.xl,
            color: colors.white,
            marginTop: 48,
            animation: "fadeUp 0.6s ease 0.3s both",
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, fontFamily: fonts.heading }}>
            Готовий долучитись?
          </h3>
          <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 24, fontFamily: fonts.body }}>
            Зареєструйся і знаходь події та організації за інтересами
          </p>
          <button
            type="button"
            onClick={() => onOpenAuth("register")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              borderRadius: radius.md,
              fontSize: 15,
              fontWeight: 700,
              border: "2px solid rgba(255,255,255,0.5)",
              background: colors.white,
              color: colors.primary,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            Приєднатись безкоштовно
            <IconArrowRight size={16} color={colors.primary} />
          </button>
        </section>
      )}
    </div>
  );
}
