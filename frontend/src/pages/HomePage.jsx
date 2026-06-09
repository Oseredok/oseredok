import { useCount } from "../hooks/useCount";

export function HomePage({ orgsCount, onViewOrgs, onRegister }) {
  const orgCount = useCount(orgsCount);

  return (
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
            onClick={onViewOrgs}
            style={{
              padding: "13px 28px", borderRadius: 99, fontSize: 15, fontWeight: 700,
              border: "none", background: "linear-gradient(135deg, #1a56db, #3b82f6)",
              color: "#fff", cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.3)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "none"}
          >
            Переглянути події →
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
        <button onClick={onRegister} style={{
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
    </>
  );
}