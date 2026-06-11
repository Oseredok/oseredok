import { useState, useEffect } from "react";

const API = "http://127.0.0.1:8000";

export function AdminPage({ user }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const res = await fetch(`${API}/organizations`);
      const data = await res.json();
      setOrganizations(data);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API}/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 201) {
        setMessage("Організацію успішно створено!");
        setFormData({
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
        });
        setShowCreateForm(false);
        fetchOrganizations();
      } else if (res.status === 403) {
        setMessage("Тільки адміністратор може створювати організації");
      } else if (res.status === 409) {
        setMessage("Такий handle вже зайнято");
      } else {
        setMessage("Помилка при створенні організації");
      }
    } catch (error) {
      setMessage("Немає зв'язку з сервером");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "#94a3b8", fontSize: 15 }}>
        Завантаження...
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
            Адмін-панель
          </h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>Керування організаціями</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: "12px 24px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}
        >
          + Додати організацію
        </button>
      </div>

      {/* Organizations List */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>
          Всі організації ({organizations.length})
        </h2>
        {organizations.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 14 }}>
            Організацій ще немає
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {organizations.map((org) => (
              <div
                key={org.organization_id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderRadius: 12,
                  border: "1.5px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 18,
                    }}
                  >
                    {org.logo_url ? (
                      <img src={org.logo_url} alt="" style={{ width: "100%", height: "100%", borderRadius: 12, objectFit: "cover" }} />
                    ) : (
                      org.name?.[0] || "О"
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{org.name}</div>
                    <div style={{ fontSize: 13, color: "#64748b" }}>{org.category || "Без категорії"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#16a34a" }}>
                    Активна
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Organization Modal */}
      {showCreateForm && (
        <div
          onClick={() => setShowCreateForm(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(15,23,42,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "28px 28px 24px",
              width: "100%",
              maxWidth: 500,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
              animation: "slideUp 0.25s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                  Нова організація
                </h2>
                <p style={{ fontSize: 13, color: "#64748b" }}>Заповніть дані організації</p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1, padding: 2 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Назва *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="Назва організації"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Handle (URL-ідентифікатор)
                </label>
                <input
                  type="text"
                  name="handle"
                  value={formData.handle}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="it-club"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Опис
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    resize: "vertical",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="Опис діяльності організації"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Категорія
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    background: "#fff",
                  }}
                >
                  <option value="">Оберіть категорію</option>
                  <option value="IT">IT</option>
                  <option value="Наука">Наука</option>
                  <option value="Спорт">Спорт</option>
                  <option value="Мистецтво">Мистецтво</option>
                  <option value="Громадська діяльність">Громадська діяльність</option>
                  <option value="Інше">Інше</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Факультет
                </label>
                <input
                  type="text"
                  name="faculty"
                  value={formData.faculty}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="Факультет інформатики"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Email контакту
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="contact@org.com"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Телефон
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="+380 99 123 4567"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Instagram
                </label>
                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="@organization"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Telegram
                </label>
                <input
                  type="text"
                  name="telegram"
                  value={formData.telegram}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="@organization"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Веб-сайт
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 10,
                    border: "1.5px solid #e2e8f0",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.15s",
                  }}
                  placeholder="https://organization.com"
                />
              </div>

              {message && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    background: message.includes("успішно") ? "#f0fdf4" : "#fef2f2",
                    border: message.includes("успішно") ? "1px solid #bbf7d0" : "1px solid #fecaca",
                    color: message.includes("успішно") ? "#16a34a" : "#dc2626",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  border: "none",
                  background: submitting ? "#e2e8f0" : "linear-gradient(135deg, #2563eb, #3b82f6)",
                  color: submitting ? "#94a3b8" : "#fff",
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: submitting ? "none" : "0 4px 14px rgba(37,99,235,0.3)",
                  transition: "all 0.15s",
                }}
              >
                {submitting ? "Створення..." : "Створити організацію"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
