import { useRef } from "react";
import { IconUpload, IconX } from "./admin/AdminIcons";
import { colors, fonts, radius } from "../theme/tokens";

export default function LogoUploadField({ preview, fileName, onChange, onRemove, label = "Аватар організації" }) {
  const fileRef = useRef(null);

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: radius.xl,
        border: `1px solid ${colors.borderLight}`,
        padding: 24,
        marginBottom: 20,
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: fonts.heading, color: colors.text, marginBottom: 4 }}>
        {label}
      </h2>
      <p style={{ fontSize: 13, color: colors.textMuted, fontFamily: fonts.body, marginBottom: 16 }}>
        Завантажте логотип або аватар організації
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        {preview && (
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: radius.lg,
              overflow: "hidden",
              border: `1px solid ${colors.border}`,
              flexShrink: 0,
            }}
          >
            <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}

        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) onChange(file);
          }}
          style={{
            flex: 1,
            minWidth: 200,
            border: `2px dashed ${colors.border}`,
            borderRadius: radius.lg,
            padding: preview ? 24 : 32,
            textAlign: "center",
            cursor: "pointer",
            background: colors.bg,
          }}
        >
          <div style={{ color: colors.textMuted, marginBottom: 8 }}>
            <IconUpload size={28} color={colors.textMuted} />
          </div>
          <p style={{ fontSize: 14, color: colors.textSecondary, fontFamily: fonts.body, margin: 0 }}>
            Перетягніть файл або натисніть для завантаження
          </p>
          <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 6 }}>PNG, JPG до 2 МБ</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file);
            }}
          />
        </div>
      </div>

      {fileName && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: radius.md,
            background: colors.bg,
            fontSize: 13,
            fontFamily: fonts.body,
          }}
        >
          <span style={{ flex: 1, color: colors.textSecondary }}>{fileName}</span>
          <button
            type="button"
            onClick={onRemove}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}
          >
            <IconX size={16} color={colors.error} />
          </button>
        </div>
      )}
    </div>
  );
}
