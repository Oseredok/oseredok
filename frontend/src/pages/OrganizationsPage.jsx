import { useEffect, useState } from "react";
import { API } from "../api";
import OrgCard from "../components/cards/OrgCard";
import SkeletonCard from "../components/cards/SkeletonCard";
import SearchField from "../components/SearchField";
import { useDebounce } from "../hooks/useDebounce";
import { categoryColors, colors, fonts, radius } from "../theme/tokens";

export default function OrganizationsPage({ onNavigateToOrg }) {
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [activeCategory, setActiveCategory] = useState("Всі");
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (activeCategory !== "Всі") params.set("category", activeCategory);

    const url = `${API}/organizations${params.toString() ? "?" + params.toString() : ""}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setAllOrgs(data);
        setLoading(false);
        setHasLoaded(true);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
        setHasLoaded(true);
      });
  }, [debouncedSearch, activeCategory]);

  const [allCategories, setAllCategories] = useState([]);
  useEffect(() => {
    fetch(`${API}/organizations`)
      .then((r) => r.json())
      .then((data) => {
        const cats = [...new Set(data.map((o) => o.category).filter(Boolean))];
        setAllCategories(cats);
      })
      .catch(() => {});
  }, []);

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
          Організації
        </h1>
        <p style={{ fontSize: 15, color: colors.textSecondary, fontFamily: fonts.body }}>
          Знайди студентську організацію за інтересами
        </p>
      </div>

      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", gap: 16 }}>
        <SearchField
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Пошук за назвою..."
        />

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

      {!loading && (
        <div
          style={{
            marginBottom: 20,
            fontSize: 13,
            color: colors.textMuted,
            fontWeight: 500,
            fontFamily: fonts.body,
          }}
        >
          {allOrgs.length > 0
            ? `${allOrgs.length} ${allOrgs.length === 1 ? "організація" : allOrgs.length < 5 ? "організації" : "організацій"}`
            : ""}
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
        <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease both" }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: colors.text,
              marginBottom: 8,
              fontFamily: fonts.heading,
            }}
          >
            Не вдалося завантажити організації
          </h3>
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: fonts.body }}>
            Перевір чи запущений бекенд на{" "}
            <code style={{ background: colors.borderLight, padding: "2px 6px", borderRadius: 4 }}>
              http://127.0.0.1:8000
            </code>
          </p>
        </div>
      )}

      {!loading && !error && hasLoaded && allOrgs.length === 0 && (
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
            Організацій не знайдено
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
              transition: "all 0.15s",
              fontFamily: fonts.body,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.primary;
              e.currentTarget.style.color = colors.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.surface;
              e.currentTarget.style.color = colors.primary;
            }}
          >
            Скинути фільтри
          </button>
        </div>
      )}

      {!loading && allOrgs.length > 0 && (
        <div className="cards-grid">
          {allOrgs.map((org, i) => (
            <OrgCard key={org.organization_id} org={org} idx={i} onNavigate={onNavigateToOrg} />
          ))}
        </div>
      )}
    </div>
  );
}
