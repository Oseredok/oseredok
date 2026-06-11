import { useCallback, useEffect, useMemo, useState } from "react";
import { API } from "../api";
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "../components/admin/AdminIcons";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
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

export function AdminPage({ user, onCreateOrg, onEditOrg, onNavigateToOrg }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Всі");
  const [filterStatus, setFilterStatus] = useState("Всі");
  const [message, setMessage] = useState("");

  const fetchOrganizations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/organizations`);
      const data = await res.json();
      setOrganizations(data);
    } catch {
      setMessage("Не вдалося завантажити організації");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const filtered = useMemo(() => {
    return organizations.filter((org) => {
      const matchSearch =
        !search ||
        org.name?.toLowerCase().includes(search.toLowerCase()) ||
        org.handle?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === "Всі" || org.category === filterCategory;
      const matchStatus = filterStatus === "Всі" || (org.status || "active") === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
  }, [organizations, search, filterCategory, filterStatus]);

  const categories = useMemo(
    () => ["Всі", ...new Set(organizations.map((o) => o.category).filter(Boolean))],
    [organizations]
  );

  const stats = useMemo(
    () => ({
      total: organizations.length,
      active: organizations.filter((o) => (o.status || "active") === "active").length,
      inactive: organizations.filter((o) => o.status === "inactive").length,
    }),
    [organizations]
  );

  const toggleStatus = async (org) => {
    const newStatus = (org.status || "active") === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API}/organizations/${org.organization_id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrganizations();
    } catch {
      setMessage("Помилка зміни статусу");
    }
  };

  const handleDelete = async (org) => {
    if (!window.confirm(`Видалити організацію «${org.name}»? Цю дію не можна скасувати.`)) return;
    try {
      const res = await fetch(`${API}/organizations/${org.organization_id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) fetchOrganizations();
      else setMessage("Не вдалося видалити");
    } catch {
      setMessage("Немає зв'язку з сервером");
    }
  };

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

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: colors.textMuted, fontFamily: fonts.body }}>
        Завантаження...
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 6 }}>
            Адмін-панель
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
            Керування організаціями · {user?.email}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={fetchOrganizations}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 16px",
              borderRadius: radius.md,
              fontSize: 13,
              fontWeight: 600,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textSecondary,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconRefresh size={16} />
            Оновити
          </button>
          <button
            type="button"
            onClick={onCreateOrg}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              borderRadius: radius.md,
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              background: colors.primary,
              color: colors.white,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconPlus size={16} color={colors.white} />
            Додати організацію
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }} className="admin-stats">
        {[
          { label: "Всього", value: stats.total, color: colors.primary },
          { label: "Активних", value: stats.active, color: colors.success },
          { label: "Неактивних", value: stats.inactive, color: colors.textMuted },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: colors.surface,
              borderRadius: radius.lg,
              padding: 20,
              border: `1px solid ${colors.borderLight}`,
              boxShadow: shadows.sm,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: fonts.heading }}>{s.value}</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, fontFamily: fonts.body }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: colors.surface,
          borderRadius: radius.lg,
          padding: 16,
          marginBottom: 20,
          border: `1px solid ${colors.borderLight}`,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Пошук за назвою або handle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "Всі" ? "Усі категорії" : c}
            </option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
          <option value="Всі">Усі статуси</option>
          <option value="active">Активні</option>
          <option value="inactive">Неактивні</option>
        </select>
      </div>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: radius.md,
            background: colors.errorBg,
            color: colors.error,
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          background: colors.surface,
          borderRadius: radius.xl,
          border: `1px solid ${colors.borderLight}`,
          boxShadow: shadows.sm,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${colors.borderLight}`,
            fontWeight: 700,
            fontSize: 16,
            fontFamily: fonts.heading,
            color: colors.text,
          }}
        >
          Організації ({filtered.length})
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: colors.textMuted, fontFamily: fonts.body }}>
            Організацій не знайдено
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: fonts.body, fontSize: 14 }}>
              <thead>
                <tr style={{ background: colors.bg, textAlign: "left" }}>
                  {["Організація", "Категорія", "Факультет", "Контакт", "Статус", "Дії"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        fontWeight: 600,
                        color: colors.textSecondary,
                        fontSize: 12,
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => {
                  const active = (org.status || "active") === "active";
                  const catColor = categoryColors[org.category] || colors.primary;
                  return (
                    <tr key={org.organization_id} style={{ borderTop: `1px solid ${colors.borderLight}` }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, color: colors.text }}>{org.name}</div>
                        {org.handle && <div style={{ fontSize: 12, color: colors.textMuted }}>@{org.handle}</div>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {org.category ? (
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: radius.pill,
                              fontSize: 11,
                              fontWeight: 700,
                              background: catColor + "18",
                              color: catColor,
                            }}
                          >
                            {org.category}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", color: colors.textSecondary }}>{org.faculty || "—"}</td>
                      <td style={{ padding: "14px 16px", color: colors.textSecondary, fontSize: 13 }}>
                        {org.contact_email || org.phone || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button
                          type="button"
                          onClick={() => toggleStatus(org)}
                          style={{
                            padding: "4px 10px",
                            borderRadius: radius.pill,
                            fontSize: 11,
                            fontWeight: 700,
                            border: "none",
                            background: active ? colors.successBg : colors.borderLight,
                            color: active ? colors.success : colors.textMuted,
                            cursor: "pointer",
                          }}
                        >
                          {active ? "Активна" : "Неактивна"}
                        </button>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            type="button"
                            style={iconActionBtn(colors.primary, colors.primaryLight)}
                            onClick={() => onEditOrg?.(org)}
                            title="Керувати"
                          >
                            <IconEdit size={16} color={colors.primary} />
                          </button>
                          <button
                            type="button"
                            style={iconActionBtn()}
                            onClick={() => onNavigateToOrg?.(org)}
                            title="Переглянути"
                          >
                            <IconEye size={16} />
                          </button>
                          <button
                            type="button"
                            style={iconActionBtn(colors.error, colors.errorBg)}
                            onClick={() => handleDelete(org)}
                            title="Видалити"
                          >
                            <IconTrash size={16} color={colors.error} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
