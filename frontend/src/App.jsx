import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Modal } from "./components/Modal";
import { OrganizationsPage } from "./pages/OrganizationsPage";
import { HomePage } from "./pages/HomePage";


import { OrgDetailPage } from "./pages/OrgDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailPage } from "./pages/Eventdetailpage";
import { ProfilePage } from "./pages/ProfilePage";

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
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const navigateToEvent = (event) => {
    setSelectedEvent(event);
    setView("event-detail");
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
          <HomePage
            orgsCount={orgsCount}
            onViewOrgs={() => setView("events")}
            onRegister={() => setPage("register")}
          />
        )}

        {view === "organizations" && (
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
            onNavigateToEvent={navigateToEvent}
          />
        )}

        {view === "event-detail" && selectedEvent && (
          <EventDetailPage
            event={selectedEvent}
            onBack={() => setView("events")}
            user={user}
            onLoginRequired={() => setPage("login")}
            onNavigateToOrg={navigateToOrg}
          />
        )}

        {view === "profile" && (
          <ProfilePage
            user={user}
            onViewChange={setView}
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
          onPageChange={setPage}
          onClose={() => setPage(null)}
          onSuccess={(userData) => { if (userData) setUser(userData); setView("events"); }}
        />
      )}
    </>
  );
}