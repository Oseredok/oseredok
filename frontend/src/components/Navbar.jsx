export function Navbar({ view, setView, user, onLogin, onRegister, onLogout }) {
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(240,246,255,0.85)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(226,232,240,0.6)",
    }}>
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        maxWidth: 1200, margin: "0 auto", padding: "16px 24px",
        flexWrap: "wrap", gap: 12,
      }}>
        <button
          onClick={() => setView("home")}
          style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #1a56db, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, animation: "float 3s ease-in-out infinite",
          }}>✦</div>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", letterSpacing: "-0.02em" }}>
            Осередок
          </span>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setView("organizations")}
            style={{
              padding: "9px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
              border: view === "organizations" || view === "org-detail" ? "1.5px solid #1a56db" : "1.5px solid #e2e8f0",
              background: view === "organizations" || view === "org-detail" ? "#dbeafe" : "#fff",
              color: view === "organizations" || view === "org-detail" ? "#1a56db" : "#334155",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            Події
          </button>

          {user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#fff", borderRadius: 99, border: "1.5px solid #e2e8f0" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #1a56db, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700 }}>
                  {user.email[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{user.email}</span>
              </div>
              <button onClick={onLogout} style={{
                padding: "9px 20px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b",
                cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.color = "#1a56db"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}
              >Вийти</button>
            </>
          ) : (
            <>
              <button onClick={onLogin} style={{
                padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 600,
                border: "1.5px solid #e2e8f0", background: "#fff", color: "#334155",
                cursor: "pointer", transition: "all 0.15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.color = "#1a56db"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
              >Увійти</button>
              <button onClick={onRegister} style={{
                padding: "9px 22px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                border: "none", background: "linear-gradient(135deg, #1a56db, #3b82f6)",
                color: "#fff", cursor: "pointer", transition: "all 0.15s",
                boxShadow: "0 4px 14px rgba(26,86,219,0.3)",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}
              >Реєстрація</button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}