import React, { useEffect } from "react";

/**
 * ModalOverlay
 * - Edge-to-edge friendly modal shell (no max-width clamp, no overflow hidden)
 * - Click outside or press ESC to close.
 *
 * Props:
 *  open: boolean
 *  onClose: () => void
 *  children: ReactNode  (put your popup inside)
 */
export default function ModalOverlay({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 28, // keeps modal off the viewport edges
      }}
    >
      {/* IMPORTANT: no maxWidth and no overflow hidden here */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "none",
          overflow: "visible",
          animation: "modalIn .18s ease-out",
        }}
      >
        {children}
      </div>

      {/* tiny inline keyframes so no css file is required */}
      <style>{`
        @keyframes modalIn {
          from { transform: translateY(6px); opacity: .0 }
          to   { transform: translateY(0);   opacity: 1 }
        }
      `}</style>
    </div>
  );
}
