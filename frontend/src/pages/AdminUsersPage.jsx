import { useEffect, useRef, useState } from "react";
import { API } from "../api";
import {
  IconPlus,
  IconRefresh,
  IconTrash,
} from "../components/admin/AdminIcons";
import { colors, fonts, radius, shadows } from "../theme/tokens";

const ROLES = ["student", "organizer", "org_owner", "admin"];

const roleLabels = {
  student: "Студент",
  organizer: "Організатор",
  org_owner: "Власник орг.",
  admin: "Адмін",
};

const roleColors = {
  student: { bg: "#F0F4FF", color: "#3B6EE8" },
  organizer: { bg: "#F0FDF4", color: "#16A34A" },
  org_owner: { bg: "#FFF7ED", color: "#EA580C" },
  admin: { bg: "#FEF2F2", color: "#DC2626" },
};

function RoleBadge({ role }) {
  const c = roleColors[role] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: radius.pill,
        fontSize: 11,
        fontWeight: 700,
        background: c.bg,
        color: c.color,
        fontFamily: fonts.body,
        letterSpacing: "0.03em",
      }}
    >
      {roleLabels[role] || role}
    </span>
  );
}

function iconActionBtn(color = colors.textSecondary, bg = colors.surface) {
  return {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    background: bg,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color,
  };
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: fonts.body,
  background: colors.surface,
};

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: 6,
  fontFamily: fonts.body,
};

// ── Modal ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          boxShadow: shadows.lg,
          width: "100%",
          maxWidth: 480,
          padding: 32,
          animation: "fadeUp 0.2s ease both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, margin: 0 }}>
            {title}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textMuted, padding: 4 }}>
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Create user modal ──────────────────────────────────────────
function CreateUserModal({ onClose, onSuccess, token }) {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "student", faculty: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.email || !form.password) return setError("Email та пароль обов'язкові");
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Помилка");
      }
      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const btnPrimary = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: radius.md, fontSize: 14, fontWeight: 700,
    background: colors.primary, color: colors.white, border: "none", cursor: "pointer", fontFamily: fonts.body,
  };
  const btnSecondary = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: radius.md, fontSize: 14, fontWeight: 600,
    background: colors.surface, color: colors.textSecondary,
    border: `1px solid ${colors.border}`, cursor: "pointer", fontFamily: fonts.body,
  };

  return (
    <Modal title="Створити користувача" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Email *</label>
          <input style={inputStyle} placeholder="user@ukma.edu.ua" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Пароль *</label>
          <input style={inputStyle} type="password" placeholder="••••••••" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Повне ім'я</label>
          <input style={inputStyle} placeholder="Іван Іваненко" value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Факультет</label>
          <input style={inputStyle} placeholder="ФІ" value={form.faculty}
            onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
        </div>
        <div>
          <label style={labelStyle}>Роль</label>
          <select style={inputStyle} value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
          </select>
        </div>
        {error && <p style={{ color: colors.error, fontSize: 13, fontFamily: fonts.body, margin: 0 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <button style={btnSecondary} onClick={onClose}>Скасувати</button>
          <button style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handle} disabled={loading}>
            {loading ? "Створення..." : "Створити"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main page ──────────────────────────────────────────────────

export default function AdminUsersPage({ user, onRef }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem("token");

  const load = () => {
    setLoading(true);
    fetch(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((u) => setUsers(Array.isArray(u) ? u : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    onRef?.({ load, openCreate: () => setShowCreate(true) });
  }, []);

  useEffect(load, []);

  const deleteUser = async (userId) => {
    try {
      await fetch(`${API}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.user_id !== userId));
      setConfirmDelete(null);
    } catch {}
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "admin").length,
    organizers: users.filter((u) => u.role === "organizer" || u.role === "org_owner").length,
    students: users.filter((u) => u.role === "student").length,
  };

  const btnPrimary = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 20px", borderRadius: radius.md, fontSize: 14, fontWeight: 700,
    background: colors.primary, color: colors.white, border: "none", cursor: "pointer", fontFamily: fonts.body,
  };
  const btnSecondary = {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "10px 16px", borderRadius: radius.md, fontSize: 13, fontWeight: 600,
    background: colors.surface, color: colors.textSecondary,
    border: `1px solid ${colors.border}`, cursor: "pointer", fontFamily: fonts.body,
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }} className="admin-stats">
        {[
          { label: "Всього", value: stats.total, color: colors.primary },
          { label: "Адміни", value: stats.admins, color: colors.error },
          { label: "Організатори", value: stats.organizers, color: "#EA580C" },
          { label: "Студенти", value: stats.students, color: colors.success },
        ].map((s) => (
          <div key={s.label} style={{
            background: colors.surface,
            borderRadius: radius.lg,
            padding: 20,
            border: `1px solid ${colors.borderLight}`,
            boxShadow: shadows.sm,
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: fonts.heading }}>{s.value}</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: colors.surface,
        borderRadius: radius.lg,
        padding: 16,
        marginBottom: 20,
        border: `1px solid ${colors.borderLight}`,
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <input
          type="text"
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
          placeholder="Пошук за ім'ям або email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select style={{ ...inputStyle, width: "auto" }} value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">Усі ролі</option>
          {ROLES.map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: colors.surface,
        borderRadius: radius.xl,
        border: `1px solid ${colors.borderLight}`,
        boxShadow: shadows.sm,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: `1px solid ${colors.borderLight}`,
          fontWeight: 700,
          fontSize: 16,
          fontFamily: fonts.heading,
          color: colors.text,
        }}>
          Користувачі ({filtered.length})
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: colors.textMuted, fontFamily: fonts.body }}>
            Завантаження...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: colors.textMuted, fontFamily: fonts.body }}>
            Користувачів не знайдено
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.body, fontSize: 14 }}>
              <thead>
                <tr style={{ background: colors.bg, textAlign: "left" }}>
                  {["Користувач", "Email", "Факультет", "Роль", "Дії"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: colors.textSecondary,
                      fontSize: 12,
                      textTransform: "uppercase",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.user_id} style={{ borderTop: `1px solid ${colors.borderLight}` }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: colors.primary + "22", color: colors.primary,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 700, fontFamily: fonts.body, flexShrink: 0,
                        }}>
                          {u.full_name?.[0]?.toUpperCase() || u.email[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: colors.text, fontFamily: fonts.body }}>
                          {u.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", color: colors.textSecondary, fontSize: 13 }}>{u.email}</td>
                    <td style={{ padding: "14px 16px", color: colors.textSecondary }}>{u.faculty || "—"}</td>
                    <td style={{ padding: "14px 16px" }}><RoleBadge role={u.role} /></td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        type="button"
                        style={iconActionBtn(colors.error, colors.errorBg)}
                        onClick={() => setConfirmDelete(u)}
                        title="Видалити"
                      >
                        <IconTrash size={16} color={colors.error} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateUserModal token={token} onClose={() => setShowCreate(false)}
          onSuccess={() => { setShowCreate(false); load(); }} />
      )}
      {confirmDelete && (
        <Modal title="Видалити користувача?" onClose={() => setConfirmDelete(null)}>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body, marginBottom: 24 }}>
            Ви впевнені, що хочете видалити <strong>{confirmDelete.full_name || confirmDelete.email}</strong>?
            Всі реєстрації та членства буде також видалено. Цю дію не можна скасувати.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={btnSecondary} onClick={() => setConfirmDelete(null)}>Скасувати</button>
            <button style={{ ...btnPrimary, background: colors.error }}
              onClick={() => deleteUser(confirmDelete.user_id)}>
              Видалити
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}