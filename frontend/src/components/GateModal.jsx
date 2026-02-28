import React from "react";
import { useNavigate } from "react-router-dom";

export default function GateModal({ open, type = "login", onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  const isPremium = type === "premium";

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          {isPremium ? "🔒 Premium Required" : "🔐 Login Required"}
        </h2>

        <p style={styles.text}>
          {isPremium
            ? "Free limit over. Buy Premium to continue."
            : "Free limit over. Login to continue."}
        </p>

        <div style={styles.btnRow}>
          {!isPremium && (
            <button
              style={{ ...styles.btn, ...styles.primary }}
              onClick={() => {
                onClose?.();
                navigate("/login");
              }}
            >
              Go to Login
            </button>
          )}

          {isPremium && (
            <button
              style={{ ...styles.btn, ...styles.primary }}
              onClick={() => {
                // later: navigate("/pricing")
                onClose?.();
                alert("Premium page later connect pannalam ✅");
              }}
            >
              Upgrade Premium
            </button>
          )}

          <button style={{ ...styles.btn, ...styles.secondary }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 420,
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    backdropFilter: "blur(18px)",
    borderRadius: 16,
    padding: 22,
    color: "white",
    boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
  },
  title: { margin: 0, marginBottom: 10, fontSize: 22, fontWeight: 800 },
  text: { margin: 0, marginBottom: 18, opacity: 0.9, lineHeight: 1.4 },
  btnRow: { display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" },
  btn: {
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  primary: { background: "linear-gradient(135deg,#00f5ff,#ff00c8)", color: "#0b0f14" },
  secondary: { background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.25)" },
};