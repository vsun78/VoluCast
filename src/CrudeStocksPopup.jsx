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

/* ─── Alerts*/
const AnimatedList = memo(function AnimatedList({
  items, delay = 10000, maxVisible = 4
}) {
  const safeItems = items && items.length ? items : [];
  const [slots, setSlots] = useState(() => {
    const seed = Array.from({ length: maxVisible }, (_, i) => ({
      slot: i,
      data: safeItems[i % Math.max(1, safeItems.length)] || {},
      token: 0, // bumps to trigger a small fade-in when content changes
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

function Notification({ name, description, icon, color, time }) {

  const card = {
    background: "#fff",
    borderRadius: 6,
    padding: 2,
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    flex: 1,
    display: "flex",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  };
  const row = { display: "flex", alignItems: "center", gap: 6, minWidth: 0, width: "100%" };
  const iconBox = {
    width: 12, height: 12, borderRadius: 9999, backgroundColor: color,
    display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 12px"
  };
  const titleRow = {
    display: "flex", alignItems: "center", gap: 4,
    fontWeight: 600, fontSize: 9,
    color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  };
  const timeStyle = { color: "#6B7280", fontSize: 8 };
  const subStyle  = { marginTop: 1, fontSize: 8, color: "#6B7280" };

  return (
    <figure style={card}>
      <div style={row}>
        <div style={iconBox}><span style={{ fontSize: 8 }}>{icon}</span></div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={titleRow}>
            <span>{name}</span>
            <span style={{ color: "#9CA3AF" }}>·</span>
            <span style={timeStyle}>{time}</span>
          </div>
          <p style={subStyle}>{description || "Magic UI"}</p>
        </div>
      </div>
    </figure>
  );
}

/* ─── Alerts seed data  */
const baseNotifications = [
  { name: "New message",     description: "Magic UI", time: "5m ago",  icon: "💬", color: "#FF3D71" },
  { name: "Payment received", description: "Magic UI", time: "15m ago", icon: "💸", color: "#00C9A7" },
  { name: "User signed up",   description: "Magic UI", time: "10m ago", icon: "👤", color: "#FFB800" },
];
const notifications = Array.from({ length: 12 }, () => baseNotifications).flat();

/* ─── Heatmap  */
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
            <AnimatedList items={notifications} delay={10000} maxVisible={4} />
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
