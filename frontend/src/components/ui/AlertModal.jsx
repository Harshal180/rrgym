// src/components/ui/AlertModal.jsx
import { useEffect } from "react";
import { createPortal } from "react-dom";

const ICONS = {
  warning: (
    <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
      <path d="M12 2L2 20h20L12 2z" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="#f59e0b" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
      <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.15" stroke="#ef4444" strokeWidth="1.5" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
      <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.15" stroke="#22c55e" strokeWidth="1.5" />
      <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5" />
      <path d="M12 11v5" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="#3b82f6" />
    </svg>
  ),
};

const COLORS = {
  warning: { border: "#f59e0b", btn: "#f59e0b", btnHover: "#d97706" },
  error:   { border: "#ef4444", btn: "#ef4444", btnHover: "#dc2626" },
  success: { border: "#22c55e", btn: "#22c55e", btnHover: "#16a34a" },
  info:    { border: "#3b82f6", btn: "#3b82f6", btnHover: "#2563eb" },
};

const AlertModal = ({ open, type = "info", title, message, onClose }) => {
  const color = COLORS[type];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111827",
          border: `1px solid ${color.border}`,
          borderTop: `4px solid ${color.border}`,
          borderRadius: "16px",
          padding: "36px 40px",
          minWidth: "340px", maxWidth: "440px", width: "90%",
          boxShadow: `0 0 40px ${color.border}33, 0 20px 60px rgba(0,0,0,0.5)`,
          animation: "popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "16px" }}>{ICONS[type]}</div>

        {title && (
          <div style={{ color: "white", fontSize: "20px", fontWeight: "700", marginBottom: "10px", letterSpacing: "-0.3px" }}>
            {title}
          </div>
        )}

        <div style={{ color: "#9ca3af", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
          {message}
        </div>

        <button
          onClick={onClose}
          style={{
            background: color.btn, color: "white", border: "none",
            borderRadius: "8px", padding: "10px 32px",
            fontSize: "15px", fontWeight: "600", cursor: "pointer",
            transition: "background 0.2s", width: "100%",
          }}
          onMouseEnter={(e) => (e.target.style.background = color.btnHover)}
          onMouseLeave={(e) => (e.target.style.background = color.btn)}
        >
          OK
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn  {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default AlertModal;
