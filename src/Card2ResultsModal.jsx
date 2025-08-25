// card 2 is the main chart for predictions and stuff
import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { NumberTicker } from "./numberTicker";

function makeFakeMonth() {
  const out = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const base = 340 + Math.sin(i / 3) * 20;
    const noise = Math.round((Math.random() - 0.5) * 24);
    out.push({ date, volume: Math.max(200, Math.round(base + noise)) });
  }
  return out;
}

export default function Card2ResultsModal({ data: incoming }) {
  const raw = useMemo(() => incoming ?? makeFakeMonth(), [incoming]);

  // Sept 01 -> Sept 07
  const dates = Array.from({ length: 7 }, (_, k) => {
    const d = new Date("2025-09-01");
    d.setDate(d.getDate() + k);
    return d.toISOString().slice(0, 10);
  });
  const labelTicks = dates;

  // colors for 9 locations
  const colors = [
    "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#06b6d4", "#dc2626", "#16a34a", "#ea580c",
  ];

  // Build rows
  const base7 = raw.slice(-7);
  const rows = dates.map((date, i) => {
    const point = { date };
    for (let loc = 0; loc < 9; loc++) {
      const seed =
        base7[i % base7.length]?.volume ??
        base7[base7.length - 1]?.volume ??
        320;
      const swing =
        (55 + loc * 3) * Math.sin((i + 1 + loc * 0.3) / (1.2 + loc * 0.03)) +
        (22 + loc * 1.5) * Math.sin(i * (2.4 + loc * 0.05)) +
        (Math.random() - 0.5) * (24 + loc * 1.2);
      point[`loc${loc + 1}`] = Math.max(160, Math.round(seed + swing));
    }
    return point;
  });

  const startDisplay = "2025/09/01";
  const endDisplay = "2025/09/07";
  const last = rows[rows.length - 1];

  const [selectedKey, setSelectedKey] = useState("ALL"); // "ALL" | "loc1".."loc9"

  const stopIfBrush = (e) => {
    if (e.target && e.target.closest && e.target.closest(".recharts-brush")) {
      e.stopPropagation();
    }
  };

  return (
    <div
      className="shared-font"
      style={{
        display: "flex",
        gap: 16,
        height: "100%",
        alignItems: "stretch",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      {/* LEFT COLUMN */}
      <div
        style={{
          flex: "0 0 38%",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          minHeight: 0,
        }}
      >
        {/* Confidence */}
        <section
          style={{
            flex: "1 1 50%",
            borderRadius: 12,
            padding: 20,
            background: "#fff",
            boxSizing: "border-box",
            boxShadow: "inset 0 0 0 1px #9ca3af",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>
            Confidence
          </div>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "baseline",
              gap: 8,
            }}
          >
            <NumberTicker
              value={87}
              startValue={0}
              decimalPlaces={0}
              delay={0.2}
              style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}
            />
            <span style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
              %
            </span>
            <span style={{ fontSize: 14, color: "#6b7280" }}>for today</span>
          </div>
          <div
            style={{
              marginTop: 16,
              height: 10,
              width: "100%",
              background: "#f3f4f6",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div style={{ width: "87%", height: "100%", background: "#34d399" }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 14, color: "#4b5563" }}>
            Prediction interval (80%):{" "}
            <b>
              {last
                ? Math.min(
                    ...Array.from({ length: 9 }, (_, k) => last[`loc${k + 1}`])
                  ) - 55
                : "—"}
            </b>{" "}
            –{" "}
            <b>
              {last
                ? Math.max(
                    ...Array.from({ length: 9 }, (_, k) => last[`loc${k + 1}`])
                  ) + 55
                : "—"}
            </b>
          </div>
        </section>

        {/* AI explanation */}
        <section
          style={{
            flex: "1 1 50%",
            borderRadius: 12,
            padding: 20,
            background: "#fff",
            boxSizing: "border-box",
            boxShadow: "inset 0 0 0 1px #9ca3af",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: 8,
            }}
          >
            Why this prediction? (AI explanation)
          </div>
          <ul
            style={{
              fontSize: 15,
              color: "#111827",
              lineHeight: 1.6,
              paddingLeft: 20,
              flex: "1 1 auto",
            }}
          >
            <li>Rain probability ↑ expected to lower hauling efficiency.</li>
            <li>Temperature near seasonal average; minimal thermal impact.</li>
            <li>Weekday pattern: mid‑week volumes typically stronger.</li>
            <li>Prior 7‑day trend suggests mild mean‑reversion.</li>
          </ul>
          <div style={{ marginTop: 12, fontSize: 13, color: "#4b5563" }}>
            What‑ifs: <b>No rain (+3–5%)</b>, <b>+5 °C (+1–2%)</b>.
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN — chart panel */}
      <div
        style={{
          flex: "1 1 62%",
          borderRadius: 12,
          padding: 12,
          background: "#fff",
          boxSizing: "border-box",
          boxShadow: "inset 0 0 0 1px #9ca3af",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* Header with title • dropdown • dates */}
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 14,
            fontWeight: 600,
            flex: "0 0 auto",
          }}
        >
          <span>Predicted Sales Volume by Location</span>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <option value="ALL">All Locations</option>
            {Array.from({ length: 9 }, (_, i) => (
              <option key={i} value={`loc${i + 1}`}>{`Location ${i + 1}`}</option>
            ))}
          </select>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>
            {startDisplay} → {endDisplay}
          </span>
        </div>

        {/* Chart */}
        <div style={{ flex: 1, minHeight: 0 }} onClick={stopIfBrush} onPointerDown={stopIfBrush}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                ticks={labelTicks}
                interval={0}
                tickMargin={12}
                minTickGap={10}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(d) => d.slice(5).replace("-", "/")}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 12 }}
                labelStyle={{ fontWeight: 700 }}
                labelFormatter={(d) => d.replace(/-/g, "/")}
                formatter={(value, name) => [value, name]}
              />

              {(selectedKey === "ALL"
                ? Array.from({ length: 9 }, (_, k) => `loc${k + 1}`)
                : [selectedKey]
              ).map((key, idx) => {
                const colorIdx =
                  key === "ALL" ? idx : parseInt(key.replace("loc", ""), 10) - 1;
                return (
                  <Line
                    key={key + idx}
                    type="monotone"
                    dataKey={key}
                    name={
                      key === "ALL"
                        ? `Location ${idx + 1}`
                        : `Location ${parseInt(key.replace("loc", ""), 10)}`
                    }
                    stroke={colors[colorIdx]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={true}
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                );
              })}

              <Brush
                className="vc-brush vc-brush--slate"
                dataKey="date"
                height={26}
                travellerWidth={3}
                stroke="#334155"
                fill="rgba(51,65,85,0.10)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", flex: "0 0 auto" }}>
          Tip: use the dropdown to focus on a single location or show all; drag the scrubber below to zoom.
        </div>
      </div>
    </div>
  );
}
