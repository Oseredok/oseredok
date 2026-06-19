import { createContext, useCallback, useContext, useState } from "react";
import { colors, fonts, radius, shadows } from "../theme/tokens";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      {/* Контейнер тостів */}
      <div style={{
        position: "fixed", bottom: 24, right: 24,
        display: "flex", flexDirection: "column", gap: 10,
        zIndex: 9999, pointerEvents: "none",
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "14px 18px",
              borderRadius: radius.lg,
              background: t.type === "success" ? "#16a34a" : t.type === "error" ? "#dc2626" : colors.primary,
              color: "#fff",
              fontSize: 14, fontWeight: 600,
              fontFamily: fonts.body,
              boxShadow: shadows.md,
              animation: "fadeUp 0.3s ease both",
              pointerEvents: "auto",
              minWidth: 220, maxWidth: 360,
            }}
          >
            <span style={{ fontSize: 16 }}>
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}