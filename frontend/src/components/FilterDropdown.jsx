import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp } from "./ui/Icons";
import { categoryColors, colors, fonts, radius } from "../theme/tokens";

export default function FilterDropdown({ categories, activeCategory, onChange, label = "Категорія" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const options = ["Всі", ...categories.filter((c) => c !== "Всі")];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 16px",
          borderRadius: radius.md,
          fontSize: 13,
          fontWeight: 600,
          border: `1px solid ${activeCategory !== "Всі" ? colors.primary : colors.border}`,
          background: activeCategory !== "Всі" ? colors.primaryLight : colors.surface,
          color: activeCategory !== "Всі" ? colors.primary : colors.textSecondary,
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: fonts.body,
          height: "100%",
        }}
      >
        {activeCategory === "Всі" ? label : activeCategory}
        {open ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: colors.surface,
            borderRadius: radius.lg,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 8px 24px rgba(9,30,66,0.12)",
            zIndex: 100,
            minWidth: 180,
            overflow: "hidden",
          }}
        >
          {options.map((cat) => {
            const isActive = cat === activeCategory;
            const color =
              cat === "Всі" ? colors.primary : categoryColors[cat] || categoryColors.default;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onChange(cat);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  textAlign: "left",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? colors.primaryLight : "transparent",
                  color: isActive ? color : colors.text,
                  border: "none",
                  cursor: "pointer",
                  borderLeft: isActive ? `3px solid ${color}` : "3px solid transparent",
                  fontFamily: fonts.body,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
