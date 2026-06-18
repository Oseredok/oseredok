import { useCallback, useEffect, useState } from "react";
import { API } from "../api";
import { IconEdit } from "../components/admin/AdminIcons";
import { categoryColors, colors, fonts, radius, shadows } from "../theme/tokens";

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export function OrganizerPanelPage({ user, onEditOrg }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/me/organizations`, { headers: authHeaders() });
      const data = res.ok ? await res.json() : [];
      setOrganizations(Array.isArray(data) ? data : []);
    } catch {
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80, color: colors.textMuted, fontFamily: fonts.body }}>
        Завантаження...
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 6 }}>
          Панель організатора
        </h1>
        <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body }}>
          Керування вашими організаціями · {user?.email}
        </p>
      </div>

      {organizations.length === 0 ? (
        <div
          style={{
            background: colors.surface,
            borderRadius: radius.xl,
            border: `1px solid ${colors.borderLight}`,
            padding: 48,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 15, color: colors.textMuted, fontFamily: fonts.body }}>
            У вас ще немає організацій для керування
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {organizations.map((org) => {
            const catColor = categoryColors[org.category] || colors.primary;
            const initials = org.name?.slice(0, 2).toUpperCase() || "OR";
            return (
              <div
                key={org.organization_id}
                style={{
                  background: colors.surface,
                  borderRadius: radius.xl,
                  border: `1px solid ${colors.borderLight}`,
                  boxShadow: shadows.sm,
                  padding: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: radius.lg,
                    overflow: "hidden",
                    background: org.logo_url ? "transparent" : colors.primaryLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {org.logo_url ? (
                    <img src={org.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontWeight: 800, color: colors.primary }}>{initials}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: colors.text, fontFamily: fonts.heading }}>
                    {org.name}
                  </div>
                  {org.handle && (
                    <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>@{org.handle}</div>
                  )}
                  {org.category && (
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 8,
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
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onEditOrg?.(org)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
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
                  <IconEdit size={14} color={colors.white} />
                  Керувати
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
