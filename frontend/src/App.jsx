import { useEffect, useState } from "react";
import { API } from "./api";
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import EventDetailPage from "./pages/EventDetailPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import OrgDetailPage from "./pages/OrgDetailPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ProfilePage from "./pages/ProfilePage";
import { layout } from "./theme/tokens";

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
      .then((r) => r.json())
      .then((d) => setOrgsCount(d.length))
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    if (view === "profile") setView("home");
  };

  const handleSuccess = (userData) => {
    if (userData) setUser(userData);
  };

  const navigate = (target, item = null) => {
    if (target === "home") {
      setView("home");
      setSelectedOrg(null);
      setSelectedEvent(null);
    } else if (target === "organizations") {
      if (item) {
        setSelectedOrg(item);
        setView("org-detail");
      } else {
        setView("organizations");
        setSelectedOrg(null);
      }
    } else if (target === "events") {
      if (item) {
        setSelectedEvent(item);
        setView("event-detail");
      } else {
        setView("events");
        setSelectedEvent(null);
      }
    } else if (target === "profile") {
      setView("profile");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Navbar
        view={view}
        user={user}
        onNavigate={navigate}
        onOpenAuth={setPage}
        onLogout={logout}
      />

      <main
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: layout.maxWidth,
          margin: "0 auto",
          padding: "32px 24px 80px",
        }}
      >
        {view === "home" && (
          <HomePage
            user={user}
            orgCount={orgsCount}
            onNavigate={navigate}
            onOpenAuth={setPage}
          />
        )}

        {view === "organizations" && (
          <OrganizationsPage onNavigateToOrg={navigateToOrg} />
        )}

        {view === "org-detail" && selectedOrg && (
          <OrgDetailPage org={selectedOrg} onBack={() => navigate("organizations")} />
        )}

        {view === "events" && (
          <EventsPage onNavigateToEvent={navigateToEvent} />
        )}

        {view === "event-detail" && selectedEvent && (
          <EventDetailPage
            event={selectedEvent}
            user={user}
            onBack={() => navigate("events")}
            onOpenAuth={setPage}
          />
        )}

        {view === "profile" && (
          <ProfilePage user={user} onNavigateToEvent={navigateToEvent} />
        )}
      </main>

      {page && (
        <Modal
          page={page}
          onClose={() => setPage(null)}
          onSuccess={handleSuccess}
          onSwitchPage={setPage}
        />
      )}
    </>
  );
}
