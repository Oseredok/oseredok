import { categoryColors } from "../constants/categoryColors";
import { CategoryPill } from "../components/CategoryPill";

export function OrgDetailPage({ org, onBack }) {
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
        border: "1.5px solid #e8edf5", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, flexShrink: 0,
            background: org.logo_url
              ? "url(" + org.logo_url + ") center/cover no-repeat"
              : "linear-gradient(135deg, " + color + " 0%, " + color + "99 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800, color: "#fff",
            fontFamily: "'Playfair Display', serif",
            boxShadow: "0 8px 24px " + color + "30",
          }}>
            {!org.logo_url && org.name[0]}
          </div>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 800, color: "#0f172a",
              fontFamily: "'Playfair Display', serif", marginBottom: 8,
            }}>
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
            href={"mailto:" + org.contact_email}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
              background: color + "12", color: color,
              border: "1.5px solid " + color + "30",
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