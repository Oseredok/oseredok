import { useEffect, useState } from "react";
import { API } from "./api";
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import { AdminPage } from "./pages/AdminPage";
import { AdminOrgEditPage } from "./pages/AdminOrgEditPage";
import { CreateEventPage } from "./pages/CreateEventPage";
import { CreateOrganizationPage } from "./pages/CreateOrganizationPage";
import { OrganizerPanelPage } from "./pages/OrganizerPanelPage";
import EventDetailPage from "./pages/EventDetailPage";
import EventsPage from "./pages/EventsPage";
import HomePage from "./pages/HomePage";
import OrgDetailPage from "./pages/OrgDetailPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import ProfilePage from "./pages/ProfilePage";
import { OrgDashboardPage } from "./pages/OrgDashboardPage";
import { canCreateEvent, isAdmin, isOrganizer } from "./utils/roles";
import { layout } from "./theme/tokens";
import { ToastProvider, useToast } from "./context/ToastContext";

function AppInner() {
  const showToast = useToast();
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUser((u) =>
            u
              ? { ...u, userId: data.userId, full_name: data.full_name, role: data.role }
              : { token, email: data.email, userId: data.userId, full_name: data.full_name, role: data.role }
          );
        }
      })
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    setView("home");
    showToast("Ви вийшли з акаунту", "info");
  };

  const handleSuccess = (userData) => {
    if (!userData) return;
    setUser(userData);
    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${userData.token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setUser((u) => ({ ...u, userId: data.userId, full_name: data.full_name, role: data.role }));
        }
      })
      .catch(() => {});
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
    } else if (target === "admin") {
      setView("admin");
      setSelectedOrg(null);
    } else if (target === "admin-create-org") {
      setView("admin-create-org");
    } else if (target === "admin-edit-org") {
      if (item) setSelectedOrg(item);
      setView("admin-edit-org");
    } else if (target === "organizer") {
      setView("organizer");
      setSelectedOrg(null);
    } else if (target === "organizer-edit-org") {
      if (item) setSelectedOrg(item);
      setView("organizer-edit-org");
    } else if (target === "create-event") {
      setView("create-event");
    } else if (target === "org-dashboard") {
      setView("org-dashboard");
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
          <OrgDetailPage
            org={selectedOrg}
            onBack={() => navigate(user ? "organizations" : "home")}
            onNavigateToEvent={navigateToEvent}
          />
        )}

        {view === "events" && (
          <EventsPage
            user={user}
            onNavigateToEvent={navigateToEvent}
            onViewChange={navigate}
          />
        )}

        {view === "event-detail" && selectedEvent && (
          <EventDetailPage
            event={selectedEvent}
            user={user}
            onBack={() => navigate("events")}
            onOpenAuth={setPage}
            onNavigateToOrg={navigateToOrg}
          />
        )}

        {view === "profile" && (
          <ProfilePage user={user} onNavigateToEvent={navigateToEvent} onNavigate={navigate} />
        )}

        {view === "admin" && isAdmin(user?.role) && (
          <AdminPage
            user={user}
            onCreateOrg={() => navigate("admin-create-org")}
            onEditOrg={(org) => navigate("admin-edit-org", org)}
            onNavigateToOrg={navigateToOrg}
          />
        )}

        {view === "admin-create-org" && isAdmin(user?.role) && (
          <CreateOrganizationPage
            onCancel={() => navigate("admin")}
            onSuccess={() => navigate("admin")}
          />
        )}

        {view === "admin-edit-org" && isAdmin(user?.role) && selectedOrg && (
          <AdminOrgEditPage
            org={selectedOrg}
            isAdminMode
            onBack={() => navigate("admin")}
            onCreateEvent={() => navigate("create-event")}
            onNavigateToEvent={navigateToEvent}
          />
        )}

        {view === "organizer" && isOrganizer(user?.role) && (
          <OrganizerPanelPage user={user} onEditOrg={(org) => navigate("organizer-edit-org", org)} />
        )}

        {view === "organizer-edit-org" && isOrganizer(user?.role) && selectedOrg && (
          <AdminOrgEditPage
            org={selectedOrg}
            isAdminMode={false}
            onBack={() => navigate("organizer")}
            onCreateEvent={() => navigate("create-event")}
            onNavigateToEvent={navigateToEvent}
          />
        )}

        {view === "create-event" && canCreateEvent(user?.role) && (
          <CreateEventPage user={user} onSuccess={() => navigate("events")} />
        )}

        {view === "org-dashboard" && user?.role === "org_owner" && (
          <OrgDashboardPage
            user={user}
            onNavigate={navigate}
            onNavigateToEvent={navigateToEvent}
          />
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

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}