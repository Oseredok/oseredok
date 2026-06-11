import { useCallback, useEffect, useMemo, useState } from "react";
import { API } from "../api";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

const EMPTY_FORM = {
  name: "",
  handle: "",
  description: "",
  category: "",
  faculty: "",
  contact_email: "",
  phone: "",
  instagram: "",
  telegram: "",
  website: "",
  status: "active",
};

const CATEGORIES = ["IT", "Debates", "Art", "Science", "Sport", "Наука", "Спорт", "Мистецтво", "Громадська діяльність", "Інше"];

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

function OrgForm({ form, setForm, onSubmit, submitting, message, submitLabel }) {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[
        { name: "name", label: "Назва *", required: true },
        { name: "handle", label: "Handle (URL)" },
        { name: "faculty", label: "Факультет" },
        { name: "contact_email", label: "Email", type: "email" },
        { name: "phone", label: "Телефон" },
        { name: "instagram", label: "Instagram" },
        { name: "telegram", label: "Telegram" },
        { name: "website", label: "Веб-сайт" },
      ].map(({ name, label, type = "text", required }) => (
        <div key={name}>
          <label style={labelStyle}>{label}</label>
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
            required={required}
            style={inputStyle}
          />
        </div>
      ))}

      <div>
        <label style={labelStyle}>Опис</label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div>
        <label style={labelStyle}>Категорія</label>
        <select
          name="category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          style={{ ...inputStyle, background: colors.surface }}
        >
          <option value="">Оберіть категорію</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {form.status !== undefined && (
        <div>
          <label style={labelStyle}>Статус</label>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            style={{ ...inputStyle, background: colors.surface }}
          >
            <option value="active">Активна</option>
            <option value="inactive">Неактивна</option>
          </select>
        </div>
      )}

      {message && (
        <div style={{
          padding: "10px 14px",
          borderRadius: radius.sm,
          background: message.includes("успіш") || message.includes("оновлено") || message.includes("видалено")
            ? colors.successBg : colors.errorBg,
          color: message.includes("успіш") || message.includes("оновлено") || message.includes("видалено")
            ? colors.success : colors.error,
          fontSize: 13,
        }}>
          {message}
        </div>
      )}

      <button type="submit" disabled={submitting} style={primaryBtn(submitting)}>
        {submitting ? "Збереження..." : submitLabel}
      </button>
    </form>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: colors.textSecondary,
  marginBottom: 6,
  fontFamily: fonts.body,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: radius.md,
  border: `1px solid ${colors.border}`,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: fonts.body,
};

function primaryBtn(disabled) {
  return {
    width: "100%",
    padding: "12px",
    borderRadius: radius.md,
    fontSize: 15,
    fontWeight: 700,
    border: "none",
    background: disabled ? colors.borderLight : colors.primary,
    color: disabled ? colors.textMuted : colors.white,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: fonts.body,
  };
}

function actionBtn(variant = "default") {
  const styles = {
    default: { bg: colors.surface, color: colors.text, border: colors.border },
    primary: { bg: colors.primaryLight, color: colors.primary, border: colors.primaryMuted },
    danger: { bg: colors.errorBg, color: colors.error, border: colors.error + "40" },
    success: { bg: colors.successBg, color: colors.success, border: colors.success + "40" },
  };
  const s = styles[variant] || styles.default;
  return {
    padding: "6px 12px",
    borderRadius: radius.sm,
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${s.border}`,
    background: s.bg,
    color: s.color,
    cursor: "pointer",
    fontFamily: fonts.body,
  };
}

export function AdminPage({ user, onNavigateToOrg }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Всі");
  const [filterStatus, setFilterStatus] = useState("Всі");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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

  const stats = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((o) => (o.status || "active") === "active").length,
    inactive: organizations.filter((o) => o.status === "inactive").length,
  }), [organizations]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setMessage("");
    setModal("create");
  };

  const openEdit = (org) => {
    setForm({
      name: org.name || "",
      handle: org.handle || "",
      description: org.description || "",
      category: org.category || "",
      faculty: org.faculty || "",
      contact_email: org.contact_email || "",
      phone: org.phone || "",
      instagram: org.instagram || "",
      telegram: org.telegram || "",
      website: org.website || "",
      status: org.status || "active",
    });
    setEditingId(org.organization_id);
    setMessage("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setMessage("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/organizations`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (res.status === 201) {
        closeModal();
        fetchOrganizations();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.detail || "Помилка при створенні");
      }
    } catch {
      setMessage("Немає зв'язку з сервером");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/organizations/${editingId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (res.ok) {
        closeModal();
        fetchOrganizations();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.detail || "Помилка при оновленні");
      }
    } catch {
      setMessage("Немає зв'язку з сервером");
    } finally {
      setSubmitting(false);
    }
  };

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
          <button type="button" onClick={fetchOrganizations} style={actionBtn("default")}>
            ↻ Оновити
          </button>
          <button type="button" onClick={openCreate} style={{
            ...actionBtn("primary"),
            padding: "10px 20px",
            fontSize: 14,
            background: colors.primary,
            color: colors.white,
            border: "none",
          }}>
            + Додати організацію
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }} className="admin-stats">
        {[
          { label: "Всього", value: stats.total, color: colors.primary },
          { label: "Активних", value: stats.active, color: colors.success },
          { label: "Неактивних", value: stats.inactive, color: colors.textMuted },
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
          placeholder="Пошук за назвою або handle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
          {categories.map((c) => <option key={c} value={c}>{c === "Всі" ? "Усі категорії" : c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
          <option value="Всі">Усі статуси</option>
          <option value="active">Активні</option>
          <option value="inactive">Неактивні</option>
        </select>
      </div>

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
                    <th key={h} style={{ padding: "12px 16px", fontWeight: 600, color: colors.textSecondary, fontSize: 12, textTransform: "uppercase" }}>
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
                        {org.handle && (
                          <div style={{ fontSize: 12, color: colors.textMuted }}>@{org.handle}</div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        {org.category ? (
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: radius.pill,
                            fontSize: 11,
                            fontWeight: 700,
                            background: catColor + "18",
                            color: catColor,
                          }}>
                            {org.category}
                          </span>
                        ) : "—"}
                      </td>
                      <td style={{ padding: "14px 16px", color: colors.textSecondary }}>{org.faculty || "—"}</td>
                      <td style={{ padding: "14px 16px", color: colors.textSecondary, fontSize: 13 }}>
                        {org.contact_email || org.phone || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: radius.pill,
                          fontSize: 11,
                          fontWeight: 700,
                          background: active ? colors.successBg : colors.borderLight,
                          color: active ? colors.success : colors.textMuted,
                        }}>
                          {active ? "Активна" : "Неактивна"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button type="button" style={actionBtn("primary")} onClick={() => openEdit(org)}>Редагувати</button>
                          <button type="button" style={actionBtn("default")} onClick={() => onNavigateToOrg?.(org)}>Переглянути</button>
                          <button type="button" style={actionBtn(active ? "default" : "success")} onClick={() => toggleStatus(org)}>
                            {active ? "Деактивувати" : "Активувати"}
                          </button>
                          <button type="button" style={actionBtn("danger")} onClick={() => handleDelete(org)}>Видалити</button>
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

      {modal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: colors.overlay,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.surface,
              borderRadius: radius.xl,
              padding: 28,
              width: "100%",
              maxWidth: 520,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: shadows.modal,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: fonts.heading, color: colors.text }}>
                {modal === "create" ? "Нова організація" : "Редагування організації"}
              </h2>
              <button type="button" onClick={closeModal} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.textMuted }}>✕</button>
            </div>
            <OrgForm
              form={form}
              setForm={setForm}
              onSubmit={modal === "create" ? handleCreate : handleEdit}
              submitting={submitting}
              message={message}
              submitLabel={modal === "create" ? "Створити організацію" : "Зберегти зміни"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
