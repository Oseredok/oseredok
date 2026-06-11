import { IconSearch, IconX } from "./ui/Icons";
import { colors, fonts, radius } from "../theme/tokens";

export default function SearchField({ value, onChange, placeholder = "Пошук..." }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span
        style={{
          position: "absolute",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          color: colors.textMuted,
          display: "flex",
          pointerEvents: "none",
        }}
      >
        <IconSearch size={16} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 40px 11px 42px",
          borderRadius: radius.md,
          fontSize: 14,
          fontFamily: fonts.body,
          border: `1px solid ${colors.border}`,
          background: colors.surface,
          color: colors.text,
          outline: "none",
          boxSizing: "border-box",
          boxShadow: "0 1px 2px rgba(9,30,66,0.06)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.primary;
          e.target.style.boxShadow = "0 0 0 3px rgba(0,82,204,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.border;
          e.target.style.boxShadow = "0 1px 2px rgba(9,30,66,0.06)";
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: colors.textMuted,
            cursor: "pointer",
            padding: 4,
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconX size={16} />
        </button>
      )}
    </div>
  );
}
