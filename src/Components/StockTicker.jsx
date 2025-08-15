"use client";
import React, { useEffect, useMemo, useState } from "react";

/* --- Demo TSX-ish data; swap to your API later --- */
const DEMO = [
  { symbol: "RY.TO",  price: 148.23, changePct: +0.82 },
  { symbol: "TD.TO",  price: 87.11,  changePct: -0.34 },
  { symbol: "BNS.TO", price: 65.74,  changePct: +1.12 },
  { symbol: "ENB.TO", price: 47.08,  changePct: -0.25 },
  { symbol: "SU.TO",  price: 58.91,  changePct: +0.44 },
  { symbol: "CNQ.TO", price: 113.66, changePct: -0.17 },
  { symbol: "CP.TO",  price: 103.52, changePct: +0.36 },
  { symbol: "BAM.TO", price: 55.03,  changePct: +1.55 },
  { symbol: "TRI.TO", price: 228.4,  changePct: -0.63 },
  { symbol: "SHOP.TO",price: 111.12, changePct: +2.04 },
];

export default function StockTicker({
  speedSec = 28,              // lower = faster
  pollMs = 60_000,            // only used if useLive=true
  useLive = false,
  symbols = DEMO.map(d => d.symbol).join(","),
}) {
  const [rows, setRows] = useState(DEMO);
  const [isDemo, setIsDemo] = useState(true);

  // Optional live fetch
  useEffect(() => {
    if (!useLive) return;
    const load = async () => {
      try {
        const r = await fetch(`/api/stocks?symbols=${encodeURIComponent(symbols)}`);
        if (!r.ok) throw new Error("bad status");
        const data = await r.json(); // [{symbol, price, changePct}]
        if (Array.isArray(data) && data.length) {
          setRows(data);
          setIsDemo(false);
        }
      } catch {
        setIsDemo(true);
      }
    };
    load();
    const t = setInterval(load, pollMs);
    return () => clearInterval(t);
  }, [useLive, symbols, pollMs]);

  // duplicate for seamless loop
  const track = useMemo(() => [...rows, ...rows], [rows]);

  // --- Inline styles (no Tailwind needed) ---
  const wrap = {
    position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 9999,
  };
  const shell = {
    borderRadius: 16, background: "#111", color: "white",
    boxShadow: "0 12px 35px rgba(0,0,0,.35)", overflow: "hidden",
    border: "1px solid rgba(255,255,255,.08)",
  };
  const viewport = { position: "relative", overflow: "hidden" };
  const fadeL = {
    position: "absolute", insetBlock: 0, left: 0, width: 64,
    background: "linear-gradient(to right, #111, rgba(17,17,17,0))",
    pointerEvents: "none",
  };
  const fadeR = {
    position: "absolute", insetBlock: 0, right: 0, width: 64,
    background: "linear-gradient(to left, #111, rgba(17,17,17,0))",
    pointerEvents: "none",
  };
  const trackStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 32,
    padding: "12px 32px",
    whiteSpace: "nowrap",
    willChange: "transform",
    animation: `tickerSlide ${speedSec}s linear infinite`,
    fontFamily: "'Inter', ui-sans-serif",
    fontWeight: 700,
    fontSize: 22,
  };
  const footer = {
    padding: "4px 12px 10px",
    fontSize: 10,
    color: "rgba(255,255,255,.55)",
    fontStyle: "italic",
  };

  return (
    <div style={wrap}>
      <div style={shell}>
        <div style={viewport}>
          <div style={fadeL} />
          <div style={fadeR} />

          <div style={trackStyle}>
            {track.map((row, i) => (
              <Item key={`${row.symbol}-${i}`} row={row} />
            ))}
          </div>
        </div>

        {isDemo && <div style={footer}>demo data shown — wire /api/stocks for live quotes</div>}
      </div>

      {/* keyframes (plain <style>, works in CRA, Vite, Next, etc.) */}
      <style>{`
        @keyframes tickerSlide {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

function Item({ row }) {
  const up = row.changePct >= 0;
  const color = up ? "#34d399" /* emerald-400 */ : "#fb7185" /* rose-400 */;
  const dot = { color: "rgba(255,255,255,.22)", marginLeft: 12, marginRight: 0 };
  const symbolStyle = { color: "rgba(255,255,255,.85)", letterSpacing: ".02em" };
  const priceStyle  = { color: "rgba(255,255,255,.92)", fontVariantNumeric: "tabular-nums" };
  const changeStyle = {
    color,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 800,
  };

  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 12 }}>
      <span style={symbolStyle}>{row.symbol}</span>
      <span style={priceStyle}>{row.price.toFixed(2)}</span>
      <span style={changeStyle}>
        {(up ? "+" : "") + row.changePct.toFixed(2)}% {up ? <UpArrow/> : <DownArrow/>}
      </span>
      <span style={dot}>•</span>
    </div>
  );
}

function UpArrow({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 4l7 8h-4v8H9v-8H5l7-8z" fill="currentColor"/>
    </svg>
  );
}
function DownArrow({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 20l-7-8h4V4h6v8h4l-7 8z" fill="currentColor"/>
    </svg>
  );
}
