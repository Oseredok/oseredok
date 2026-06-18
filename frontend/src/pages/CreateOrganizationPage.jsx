import { useEffect, useState } from "react";
import { API } from "../api";
import OrganizationFormFields from "../components/admin/OrganizationFormFields";
import LogoUploadField from "../components/LogoUploadField";
import { IconBuilding, IconCheck, IconX } from "../components/admin/AdminIcons";
import { useDebounce } from "../hooks/useDebounce";
<<<<<<< HEAD
=======
import { fileToDataUrl } from "../utils/orgForm";
>>>>>>> 9121a50eb1eb6c16876595166dbb2da42ba37f96
import { roleLabel } from "../utils/roles";
import { colors, fonts, radius } from "../theme/tokens";

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
};

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export function CreateOrganizationPage({ onCancel, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [ownerResults, setOwnerResults] = useState([]);
  const debouncedOwnerSearch = useDebounce(ownerSearch, 300);

  useEffect(() => {
    if (!debouncedOwnerSearch.trim() || selectedOwner) {
      setOwnerResults([]);
      return;
    }
    fetch(`${API}/users/search?q=${encodeURIComponent(debouncedOwnerSearch)}`, {
      headers: authHeaders(),
    })
      .then((r) => (r.ok ? r.json() : []))
      .then(setOwnerResults)
      .catch(() => setOwnerResults([]));
  }, [debouncedOwnerSearch, selectedOwner]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOwner) {
      setMessage("Оберіть власника організації");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const payload = { ...form, owner_id: selectedOwner.user_id };
<<<<<<< HEAD
      if (logoPreview) payload.logo_url = logoPreview;
=======
      if (logoFile) payload.logo_url = await fileToDataUrl(logoFile);
>>>>>>> 9121a50eb1eb6c16876595166dbb2da42ba37f96

      const res = await fetch(`${API}/organizations`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.status === 201) {
        onSuccess?.();
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

  return (
    <div style={{ animation: "fadeUp 0.5s ease both", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 28 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: radius.md,
            background: colors.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.primary,
            flexShrink: 0,
          }}
        >
          <IconBuilding size={24} color={colors.primary} />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: colors.text, fontFamily: fonts.heading, marginBottom: 6 }}>
            Нова організація
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
            Заповніть інформацію про нову сошку
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <LogoUploadField
          preview={logoPreview}
          fileName={logoFile?.name}
          onChange={(file) => {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
          }}
          onRemove={() => {
            setLogoFile(null);
            setLogoPreview(null);
          }}
        />

        <OrganizationFormFields
          form={form}
          setForm={setForm}
          showOwner
          ownerSearch={ownerSearch}
          setOwnerSearch={(v) => {
            setOwnerSearch(v);
            setSelectedOwner(null);
          }}
          selectedOwner={selectedOwner}
          setSelectedOwner={setSelectedOwner}
        />

        {ownerResults.length > 0 && !selectedOwner && (
          <div style={{ marginTop: -12, marginBottom: 20 }}>
            {ownerResults.map((u) => (
              <button
                key={u.user_id}
                type="button"
                onClick={() => {
                  setSelectedOwner(u);
                  setOwnerSearch(u.full_name || u.email);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  width: "100%",
                  padding: 14,
                  marginBottom: 8,
                  borderRadius: radius.md,
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: colors.primaryLight,
                    color: colors.primary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {(u.full_name || u.email)[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{u.full_name || u.email}</div>
                  <div style={{ fontSize: 13, color: colors.textSecondary }}>
                    {u.email} · {roleLabel(u.role)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {message && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: radius.md,
              background: message.includes("успіш") ? colors.successBg : colors.errorBg,
              color: message.includes("успіш") ? colors.success : colors.error,
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {message}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 20px",
              borderRadius: radius.md,
              fontSize: 14,
              fontWeight: 600,
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.textSecondary,
              cursor: "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconX size={16} />
            Скасувати
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: radius.md,
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              background: submitting ? colors.borderLight : colors.primary,
              color: submitting ? colors.textMuted : colors.white,
              cursor: submitting ? "not-allowed" : "pointer",
              fontFamily: fonts.body,
            }}
          >
            <IconCheck size={16} color={submitting ? colors.textMuted : colors.white} />
            {submitting ? "Збереження..." : "Зберегти організацію"}
          </button>
        </div>
      </form>
    </div>
  );
}
