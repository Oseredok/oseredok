import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Modal } from "./components/Modal";
import { HomePage } from "./pages/HomePage";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { OrgDetailPage } from "./pages/OrgDetailPage";

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
        body { font-family: 'Manrope', sans-serif; background: #f0f6ff; color: #0f172a; min-height: 100vh; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) scale(0.97); } to { opacity:1; transform:none; } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .orgs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 900px) { .orgs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .orgs-grid { grid-template-columns: 1fr; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f0f6ff; }
        ::-webkit-scrollbar-thumb { background: #c7d7f5; border-radius: 3px; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -120, right: -120, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #bfdbfe 0%, transparent 70%)", opacity: 0.6 }} />
        <div style={{ position: "absolute", bottom: -80, left: -80, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #dbeafe 0%, transparent 70%)", opacity: 0.5 }} />
      </div>

      <Navbar
        view={view}
        setView={(v) => { setView(v); if (v === "organizations") setSelectedOrg(null); }}
        user={user}
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
        onLogout={logout}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        {view === "home" && (
          <HomePage
            orgsCount={orgsCount}
            onViewOrgs={() => setView("organizations")}
            onRegister={() => setPage("register")}
            user={user}
          />
        )}
        {view === "organizations" && (
          <OrganizationsPage onNavigateToOrg={navigateToOrg} />
        )}
        {view === "org-detail" && selectedOrg && (
          <OrgDetailPage org={selectedOrg} onBack={() => setView("organizations")} />
        )}
      </div>

      {page && (
        <Modal
          page={page}
          onClose={() => setPage(null)}
          onSuccess={(userData) => { if (userData) setUser(userData); }}
        />
      )}
    </>
  );
}