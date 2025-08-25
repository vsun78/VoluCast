"use client";

import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { motion } from "framer-motion";
import OilBarCard from "./OilBarCard";

/* ─── utils ───────────────────────────────────────────── */
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
function pctToColor(pct) {
  const t = (clamp(pct, -6, 6) + 6) / 12;
  const L = (a,b,u)=>Math.round(a+(b-a)*u);
  let r,g,b;
  if (t < 0.5) { const u=t/0.5;  r=L(255,200,u); g=L(170,40,u);  b=L(170,40,u); }
  else         { const u=(t-0.5)/0.5; r=L(22,160,u); g=L(200,235,u); b=L(120,180,u); }
  return `rgb(${r},${g},${b})`;
}
function isLightColor(rgb){
  const [r,g,b]=rgb.match(/\d+/g).map(Number);
  return ((0.2126*r+0.7152*g+0.0722*b)/255) > 0.52;
}

/* ─── Market alert theming helpers ───────────────────── */
function variantFromDelta(deltaPct) {
  if (deltaPct > 0) return "bullish";
  if (deltaPct < 0) return "bearish";
  return "neutral";
}
function themeFor(variant) {
  switch (variant) {
    case "bullish":
      return {
        accent: "#16a34a", // green-600
        bgSoft: "rgba(22,163,74,0.08)",
        text: "#064e3b",   // green-900
        icon: "▲",
        pillBg: "rgba(22,163,74,0.12)",
        pillText: "#065f46",
      };
    case "bearish":
      return {
        accent: "#dc2626", // red-600
        bgSoft: "rgba(220,38,38,0.08)",
        text: "#7f1d1d",   // red-900
        icon: "▼",
        pillBg: "rgba(220,38,38,0.12)",
        pillText: "#7f1d1d",
      };
    default:
      return {
        accent: "#6b7280", // gray-500
        bgSoft: "rgba(107,114,128,0.08)",
        text: "#111827",
        icon: "•",
        pillBg: "rgba(107,114,128,0.12)",
        pillText: "#374151",
      };
  }
}

/* ─── Alerts 

--------------------------------------------------------- */
const AnimatedList = memo(function AnimatedList({
  items, delay = 10000, maxVisible = 4
}) {
  const safeItems = items && items.length ? items : [];
  const [slots, setSlots] = useState(() => {
    const seed = Array.from({ length: maxVisible }, (_, i) => ({
      slot: i,
      data: safeItems[i % Math.max(1, safeItems.length)] || {},
      token: 0,
    }));
    return seed;
  });
  const nextIdx = useRef(maxVisible);

  useEffect(() => {
    if (!safeItems.length) return;

    const id = setInterval(() => {
      const nextRaw = safeItems[nextIdx.current % safeItems.length];
      nextIdx.current += 1;

      setSlots(prev => {
        const out = prev.map(s => ({ ...s }));
        for (let i = maxVisible - 1; i > 0; i--) out[i].data = prev[i - 1].data;
        out[0].data = nextRaw;
        out[0].token = (out[0].token || 0) + 1;
        return out;
      });
    }, delay);

    return () => clearInterval(id);
  }, [safeItems, delay, maxVisible]);

  const containerStyle = {
    display: "grid",
    gridTemplateRows: `repeat(${maxVisible}, 1fr)`,
    rowGap: 6,
    height: "100%",
    width: "100%",
  };

  return (
    <div style={containerStyle}>
      {slots.map(s => (
        <div key={s.slot} style={{ display: "flex" }}>
          <motion.div
            key={s.token}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ flex: 1, display: "flex" }}
          >
            <Notification {...s.data} />
          </motion.div>
        </div>
      ))}
    </div>
  );
});

function Sparkline({ points = [], stroke = "#6b7280" }) {
  if (!points.length) return null;
  const w = 60, h = 18;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const path = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * (w - 2) + 1;
      const y = h - ((v - min) / span) * (h - 2) - 1;
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

function Notification({
  // Market-themed fields (add these when you build alerts)
  ticker = "WTI",
  price,            // number | string
  deltaPct = 0,     // e.g., +1.23 or -0.85
  spark = [],       // tiny series for sparkline
  // legacy fields kept for compatibility
  name, description, icon, color, time = "now",
  variant: variantIn,
}) {
  // Choose variant from explicit prop or calculate from delta
  const variant = variantIn || variantFromDelta(Number(deltaPct) || 0);
  const theme = themeFor(variant);

  const card = {
    background: "#fff",
    borderRadius: 8,
    padding: 6,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    flex: 1,
    display: "flex",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  const accentBar = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: theme.accent,
  };

  const row = { display: "flex", alignItems: "center", gap: 8, minWidth: 0, width: "100%" };

  const badge = {
    fontWeight: 800,
    fontSize: 10,
    letterSpacing: 0.2,
    padding: "2px 6px",
    borderRadius: 9999,
    background: theme.bgSoft,
    color: theme.text,
    border: `1px solid ${theme.accent}22`,
    textTransform: "uppercase",
    flexShrink: 0,
  };

  const titleRow = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 700,
    fontSize: 10,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const timeStyle = { color: "#6B7280", fontSize: 9, flexShrink: 0 };

  const right = { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 };

  const priceStyle = {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    fontSize: 11,
    color: "#111827",
  };

  const pill = {
    fontVariantNumeric: "tabular-nums",
    fontWeight: 700,
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: 9999,
    background: theme.pillBg,
    color: theme.pillText,
    border: `1px solid ${theme.accent}33`,
  };

  const sparkStroke = variant === "bullish" ? "#16a34a" : variant === "bearish" ? "#dc2626" : "#6b7280";

  // Fallbacks for legacy alerts: map name/description/color into market look
  const fallbackTicker = ticker || (name ? name.split(" ")[0].toUpperCase() : "WTI");
  const fallbackDesc = description || (name ? name.replace(fallbackTicker, "").trim() : "Alert");

  return (
    <figure style={card}>
      <div style={accentBar} />
      <div style={row}>
        <span style={badge}>{fallbackTicker}</span>

        <div style={{ minWidth: 0 }}>
          <div style={titleRow}>
            <span>{fallbackDesc || "Market Alert"}</span>
            <span style={{ color: "#9CA3AF" }}>·</span>
            <span style={timeStyle}>{time}</span>
          </div>
          
          {!!(spark && spark.length >= 2) && (
            <div style={{ marginTop: 2 }}>
              <Sparkline points={spark} stroke={sparkStroke} />
            </div>
          )}
        </div>

        <div style={right}>
          {price != null && <span style={priceStyle}>{String(price)}</span>}
          <span style={pill}>
            {theme.icon} {Number(deltaPct) > 0 ? "+" : ""}{Number(deltaPct).toFixed(2)}%
          </span>
        </div>
      </div>
    </figure>
  );
}


const notifications = [
  { ticker: "WTI",  price: "$78.42", deltaPct: +1.36, time: "2m ago",  spark: [76.9,77.2,77.8,77.3,78.0,78.4] },
  { ticker: "BRENT",price: "$82.11", deltaPct: -0.42, time: "5m ago",  spark: [82.6,82.4,82.2,82.3,82.1] },
  { ticker: "XOM",  price: "$114.07", deltaPct: +0.85, time: "7m ago", spark: [112.9,113.4,113.9,113.6,114.1] },
  { ticker: "CVX",  price: "$159.22", deltaPct: -1.12, time: "12m ago", spark: [160.8,160.1,159.9,159.6,159.2] },
  { ticker: "NG",   price: "$2.68", deltaPct: +2.01, time: "14m ago", spark: [2.61,2.63,2.64,2.66,2.68] },
  { ticker: "OXY",  price: "$67.34", deltaPct: +0.22, time: "18m ago", spark: [67.0,67.1,67.3,67.2,67.34] },
];

/* ─── Heatmap*/
const SAMPLE_SP500 = [
  { ticker:"AAPL", name:"Apple", pct:-1.8 }, { ticker:"MSFT", name:"Microsoft", pct:-0.9 },
  { ticker:"NVDA", name:"NVIDIA", pct:2.2 }, { ticker:"GOOG", name:"Alphabet", pct:-1.3 },
  { ticker:"META", name:"Meta", pct:0.7 }, { ticker:"AMD", name:"AMD", pct:1.1 },
  { ticker:"XOM", name:"ExxonMobil", pct:1.9 }, { ticker:"CVX", name:"Chevron", pct:1.2 },
  { ticker:"OXY", name:"Occidental", pct:0.6 }, { ticker:"JPM", name:"JPMorgan", pct:-0.3 },
  { ticker:"BAC", name:"Bank of America", pct:-0.8 }, { ticker:"GS", name:"Goldman Sachs", pct:0.4 },
  { ticker:"AMZN", name:"Amazon", pct:-1.1 }, { ticker:"WMT", name:"Walmart", pct:0.2 },
  { ticker:"COST", name:"Costco", pct:0.9 }, { ticker:"HD", name:"Home Depot", pct:-0.7 },
  { ticker:"UNH", name:"UnitedHealth", pct:0.8 }, { ticker:"JNJ", name:"Johnson & Johnson", pct:0.1 },
  { ticker:"PFE", name:"Pfizer", pct:-1.0 }, { ticker:"TSLA", name:"Tesla", pct:-2.6 },
  { ticker:"GM", name:"GM", pct:0.5 }, { ticker:"CAT", name:"Caterpillar", pct:1.3 },
  { ticker:"KO", name:"Coca-Cola", pct:0.6 }, { ticker:"PEP", name:"PepsiCo", pct:0.3 },
  { ticker:"DIS", name:"Disney", pct:-0.4 }, { ticker:"NFLX", name:"Netflix", pct:1.7 },
];

function spanByMove(pct){
  const a=Math.abs(pct);
  if (a>=3.5) return { c:7, r:5 };
  if (a>=2.5) return { c:6, r:4 };
  if (a>=1.5) return { c:5, r:4 };
  if (a>=0.8) return { c:4, r:3 };
  return { c:3, r:3 };
}

function HeatCell({ ticker, name, pct }) {
  const bg = pctToColor(pct);
  const light = isLightColor(bg);
  const { c, r } = spanByMove(pct);

  const cell = {
    gridColumn:`span ${c}`, gridRow:`span ${r}`,
    background:bg, borderRadius:3, padding:4,
    display:"flex", flexDirection:"column", justifyContent:"space-between",
    boxShadow:"inset 0 0 0 1px rgba(0,0,0,.05), inset 0 0 0 1px rgba(255,255,255,.06)",
    minWidth:0,
  };
  const top = { display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:6, color:light?"#0f1115":"#fff" };

  return (
    <div style={cell} title={`${ticker} • ${name} • ${pct>0?"+":""}${pct}%`}>
      <div style={top}>
        <div style={{ fontWeight:800, letterSpacing:.2, fontSize:13 }}>{ticker}</div>
        <div style={{ fontSize:10, opacity:.9, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name}</div>
      </div>
      <div style={{ fontWeight:800, fontSize:12, color:light?"#0f1115":"#fff" }}>
        {pct>0?`+${pct}%`:`${pct}%`}
      </div>
    </div>
  );
}

function SP500Heatmap({ data=SAMPLE_SP500 }) {
  const OUTER={ background:"#26282A", borderRadius:8, padding:8, width:"100%", height:"100%", boxSizing:"border-box", display:"flex", flexDirection:"column" };
  const TITLE={ textAlign:"center", fontSize:15, fontWeight:800, margin:"2px 0 6px", color:"#E6E8EE" };
  const GRID={ flex:1, display:"grid", gridAutoFlow:"dense", gridTemplateColumns:"repeat(22, 1fr)", gridAutoRows:16, gap:1 };
  return (
    <div style={OUTER}>
      <div style={TITLE}>S&P 500</div>
      <div style={GRID}>{data.map(d => <HeatCell key={d.ticker} {...d}/>)}</div>
    </div>
  );
}

/* ─── Layout ─── */
export default function CrudeStocksPopup(){
  const WRAP={ width:"100%", height:720, padding:14, boxSizing:"border-box", display:"grid", gridTemplateColumns:"380px 1fr", columnGap:16 };
  const LEFTGRID={ display:"grid", gridTemplateRows:"55% 45%", rowGap:12, height:"100%", minWidth:0 };
  const panel={ background:"#fff", border:"1px solid rgba(0,0,0,.06)", borderRadius:10, padding:8, display:"flex", flexDirection:"column" };
  const title={ fontSize:16, fontWeight:700, textAlign:"center", marginBottom:8 };

  return (
    <div style={WRAP}>
      <div style={LEFTGRID}>
        <section style={{ ...panel, padding:8 }}>
          <SP500Heatmap />
        </section>

        <section style={{ ...panel }}>
          <h3 style={title}>Live Alerts</h3>
          <div style={{ flex:1 }}>
            <AnimatedList items={notifications} delay={8000} maxVisible={4} />
          </div>
        </section>
      </div>

      <section style={{ ...panel }}>
        <h3 style={title}>U.S. Crude Stocks vs WTI (Weekly)</h3>
        <div style={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center" }}>
          <div style={{ width:"90%", height:"90%", maxWidth:820 }}>
            <OilBarCard weeks={12} title="Oil Snapshot (WTI vs. Stocks)" height={500}/>
          </div>
        </div>
      </section>
    </div>
  );
}
