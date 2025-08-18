"use client";

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OilBarCard from "./OilBarCard";

function cn(...parts) { return parts.filter(Boolean).join(" "); }

function AnimatedListItem({ children }) {
  const animations = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 30 },
  };
  return <motion.div {...animations} layout="position" className="w-full">{children}</motion.div>;
}

const AnimatedList = memo(function AnimatedList({ items, delay = 10000, maxVisible = 4, className }) {
  const [visible, setVisible] = useState([]);
  const idxRef = useRef(0);
  const flat = useMemo(() => items.slice(), [items]);

  useEffect(() => {
    if (!flat.length) return;
    const seed = [];
    for (let i = 0; i < Math.min(maxVisible, flat.length); i++) seed.unshift(flat[i]);
    setVisible(seed);
    idxRef.current = maxVisible;

    const id = setInterval(() => {
      setVisible(prev => {
        const next = flat[idxRef.current % flat.length];
        idxRef.current += 1;
        return [next, ...prev].slice(0, maxVisible);
      });
    }, delay);
    return () => clearInterval(id);
  }, [delay, maxVisible, flat]);

  return (
    <div className={cn("flex flex-col gap-3 w-full", className)}>
      <AnimatePresence initial={false}>
        {visible.map((item, i) => (
          <AnimatedListItem key={`${item.name}-${i}-${item.time}`}>
            <Notification {...item} />
          </AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
});


function Notification({ name, description, icon, color, time }) {
  const cardStyle = {
    background: "#fff",
    borderRadius: 10,
    padding: 8,                               // tighter padding
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
    minHeight: 48,                            // smaller height
  };

  const rowStyle = { display: "flex", alignItems: "center", gap: 8, minWidth: 0 };

  const iconStyle = {
    width: 26, height: 26,                    // much smaller icon pill
    borderRadius: 9999,
    backgroundColor: color,
    display: "flex", alignItems: "center", justifyContent: "center",
    flex: "0 0 26px",
  };

  const titleRowStyle = {
    display: "flex", alignItems: "center", gap: 6,
    fontWeight: 600, fontSize: 13, lineHeight: "18px",
    color: "#111827",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  };

  const dotStyle  = { color: "#9CA3AF" };
  const timeStyle = { color: "#6B7280", fontSize: 12 };
  const subStyle  = { marginTop: 1, fontSize: 11, color: "#6B7280" };

  return (
    <figure style={cardStyle}>
      <div style={rowStyle}>
        <div style={iconStyle}><span style={{ fontSize: 12 }}>{icon}</span></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={titleRowStyle}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
            <span style={dotStyle}>·</span>
            <span style={timeStyle}>{time}</span>
          </div>
          <p style={subStyle}>{description || "Magic UI"}</p>
        </div>
      </div>
    </figure>
  );
}




const baseNotifications = [
  { name: "New event",        description: "Magic UI", time: "2m ago",  icon: "🧪", color: "#1E86FF" },
  { name: "New message",      description: "Magic UI", time: "5m ago",  icon: "💬", color: "#FF3D71" },
  { name: "User signed up",   description: "Magic UI", time: "10m ago", icon: "👤", color: "#FFB800" },
  { name: "Payment received", description: "Magic UI", time: "15m ago", icon: "💸", color: "#00C9A7" },
];
const notifications = Array.from({ length: 10 }, () => baseNotifications).flat();

/* ========== Left/Right Grid with Bigger Chart ========== */
export default function CrudeStocksPopup() {
  const WRAP = { width: "100%", height: 600, padding: 16, boxSizing: "border-box" };
  const GRID = {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    columnGap: 28,
    width: "100%", height: "100%", minWidth: 0, minHeight: 0,
  };
  const COL = { display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 };
  const TITLE = { fontSize: 18, fontWeight: 600, marginBottom: 10 };
  const BODY = { flex: 1, minHeight: 0, minWidth: 0 };

  return (
    <div style={WRAP}>
      <div style={GRID}>
        {/* LEFT: Alerts (fixed narrow column) */}
        <section style={COL}>
          <h3 style={TITLE}>Live Alerts</h3>
          <div style={BODY}>
            <AnimatedList items={notifications} delay={10000} maxVisible={4} />
          </div>
        </section>

        {/* RIGHT: Chart (dominant space) */}
        <section style={COL}>
  <h3 style={TITLE}>U.S. Crude Stocks vs WTI (Weekly)</h3>

  {/* Centered, smaller chart box */}
  <div style={{ ...BODY, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
    <div style={{ width: 560, height: 380, maxWidth: "100%" }}>
      <OilBarCard weeks={12} title="Oil Snapshot (WTI vs. Stocks)" height={380} />
    </div>
  </div>
</section>

      </div>
    </div>
  );
}
