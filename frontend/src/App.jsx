import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Modal } from "./components/Modal";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { OrgDetailPage } from "./pages/OrgDetailPage";
import { EventsPage } from "./pages/EventsPage";

const API = "http://127.0.0.1:8000";

export default function App() {
  const [page, setPage] = useState(null);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    return token && email ? { token, email } : null;
  });
  const [view, setView] = useState("home");
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [orgsCount, setOrgsCount] = useState(0);

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
    setView("home");
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
        body { font-family: 'Manrope', sans-serif; background: #eef2fb; color: #0f172a; min-height: 100vh; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .orgs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px) { .orgs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .orgs-grid { grid-template-columns: 1fr; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #eef2fb; }
        ::-webkit-scrollbar-thumb { background: #c7d7f5; border-radius: 3px; }
      `}</style>

      <Navbar
        user={user}
        view={view}
        onViewChange={setView}
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
        onLogout={logout}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Головна */}
        {view === "home" && (
          <div style={{ animation: "fadeUp 0.6s ease both" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{
                display: "inline-block", padding: "5px 16px", borderRadius: 99,
                background: "#dbeafe", color: "#2563eb", fontSize: 12,
                fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                marginBottom: 20,
              }}>
                НаУКМА · Студентська спільнота
              </div>
              <h1 style={{
                fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.1,
                fontFamily: "'Playfair Display', serif", color: "#0f172a",
                letterSpacing: "-0.03em", marginBottom: 16,
              }}>
                Знайди своє<br />
                <span style={{ background: "linear-gradient(135deg, #2563eb, #60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  місце в університеті
                </span>
              </h1>
              <p style={{ fontSize: 16, color: "#64748b", maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.7 }}>
                Платформа для пошуку студентських організацій та реєстрації на події НаУКМА
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", marginBottom: 48 }}>
                {[
                  { label: "організацій", value: orgsCount },
                  { label: "активних членів", value: "200+" },
                  { label: "подій на рік", value: "50+" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 30, fontWeight: 800, color: "#2563eb", fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Заклик */}
            <div style={{
              background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
              borderRadius: 24, padding: "48px 40px", textAlign: "center", color: "#fff",
            }}>
              <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, fontFamily: "'Playfair Display', serif" }}>
                Не пропусти найближчі події
              </h3>
              <p style={{ fontSize: 15, opacity: 0.85, marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>
                Реєструйся на воркшопи, хакатони та зустрічі студентських організацій НаУКМА
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => setView("events")}
                  style={{
                    padding: "13px 28px", borderRadius: 99, fontSize: 14, fontWeight: 700,
                    border: "2px solid rgba(255,255,255,0.5)", background: "#fff",
                    color: "#2563eb", cursor: "pointer", transition: "all 0.18s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = "#2563eb"; }}
                >
                  Переглянути події →
                </button>
                {!user && (
                  <button
                    onClick={() => setPage("register")}
                    style={{
                      padding: "13px 28px", borderRadius: 99, fontSize: 14, fontWeight: 700,
                      border: "2px solid rgba(255,255,255,0.3)", background: "transparent",
                      color: "#fff", cursor: "pointer", transition: "all 0.18s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.7)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}
                  >
                    Зареєструватись
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {(view === "organizations") && (
          <OrganizationsPage
            onNavigateToOrg={navigateToOrg}
            activeTab={view}
            onTabChange={setView}
            user={user}
          />
        )}
        {view === "events" && (
         <EventsPage
          onTabChange={setView}
          user={user}
         />
        )}

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
          onSuccess={(userData) => { if (userData) setUser(userData); setView("events"); }}
        />
      )}
    </>
  );
}