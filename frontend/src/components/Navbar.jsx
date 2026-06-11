export function Navbar({ user, onLogin, onRegister, onLogout, view, onViewChange }) {
  if (!user) {
    return (
      <div style={{
        background: "rgba(238,242,251,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(226,232,240,0.5)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1200, margin: "0 auto", padding: "14px 24px", gap: 12,
        }}>
          <button onClick={() => onViewChange("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>✦</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>Осередок</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onLogin} style={{ padding: "8px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155", cursor: "pointer" }}>Увійти</button>
            <button onClick={onRegister} style={{ padding: "8px 20px", borderRadius: 99, fontSize: 13, fontWeight: 700, border: "none", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}>Реєстрація</button>
          </div>
        </nav>
      </div>
    );
  }

  const navItems = [
    { label: "Події", key: "events" },
    { label: "Організації", key: "organizations" },
  ];

  if (user.role === "admin") {
    navItems.push({ label: "Адмін-панель", key: "admin" });
  }

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #e8edf5", position: "sticky", top: 0, zIndex: 50 }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1200, margin: "0 auto", padding: "14px 24px", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <button onClick={() => onViewChange("home")} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg, #2563eb, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>✦</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif" }}>Осередок</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => onViewChange(item.key)}
                style={{
                  padding: "7px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600,
                  background: "none", border: "none", cursor: "pointer",
                  color: view === item.key ? "#2563eb" : "#64748b",
                  borderBottom: view === item.key ? "2px solid #2563eb" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (view !== item.key) e.currentTarget.style.color = "#0f172a"; }}
                onMouseLeave={e => { if (view !== item.key) e.currentTarget.style.color = "#64748b"; }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{user.email}</span>
          <button
            onClick={() => onViewChange("profile")}  
            style={{ padding: "8px 20px", borderRadius: 99, fontSize: 13, fontWeight: 700, border: "none", background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#fff", cursor: "pointer", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }}
          >
            Мій профіль
          </button>
          <button onClick={onLogout} style={{ padding: "8px 16px", borderRadius: 99, fontSize: 13, fontWeight: 600, border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", cursor: "pointer" }}>Вийти</button>
        </div>
      </nav>
    </div>
  );
}