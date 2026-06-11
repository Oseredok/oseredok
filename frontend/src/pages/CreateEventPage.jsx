import { useState, useEffect } from "react";
import { API } from "../api";
import { colors, fonts, radius } from "../theme/tokens";

export function CreateEventPage({ user, onSuccess }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    organization_id: "",
    title: "",
    description: "",
    location: "",
    start_datetime: "",
    end_datetime: "",
    max_participants: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/users/me/organizations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setOrganizations(Array.isArray(data) ? data : []);
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
      const res = await fetch(`${API}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        }),
      });

      if (res.status === 201) {
        setMessage("Подію успішно створено!");
        setFormData({
          organization_id: "",
          title: "",
          description: "",
          location: "",
          start_datetime: "",
          end_datetime: "",
          max_participants: "",
        });
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else if (res.status === 404) {
        setMessage("Організацію не знайдено");
      } else {
        setMessage("Помилка при створенні події");
      }
    } catch (error) {
      setMessage("Немає зв'язку з сервером");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: colors.textMuted, fontFamily: fonts.body }}>
        Завантаження...
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 80, animation: "fadeUp 0.5s ease both" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 8 }}>
          Немає доступних організацій
        </h2>
        <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
          Створення подій доступне лише для організацій, до яких ви привʼязані як організатор.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
          Створити подію
        </h1>
        <p style={{ fontSize: 14, color: "#64748b" }}>Заповніть деталі нової події</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", maxWidth: 600 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Організація *
            </label>
            <select
              name="organization_id"
              value={formData.organization_id}
              onChange={handleInputChange}
              required
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
              <option value="">Оберіть організацію</option>
              {organizations.map((org) => (
                <option key={org.organization_id} value={org.organization_id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Назва події *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
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
              placeholder="Назва події"
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
              rows={4}
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
              placeholder="Детальний опис події"
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Локація *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
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
              placeholder="Актова зала, корпус А"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Дата та час початку *
              </label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
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
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                Дата та час закінчення *
              </label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
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
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Максимальна кількість учасників
            </label>
            <input
              type="number"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleInputChange}
              min="1"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #e2e8f0",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              placeholder="120"
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
            {submitting ? "Створення..." : "Створити подію"}
          </button>
        </form>
      </div>
    </div>
  );
}
