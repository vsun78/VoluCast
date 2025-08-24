// card 2 is the main chart for predictions and stuff
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
  ReferenceDot,
} from "recharts";
import { NumberTicker } from "./numberTicker";

function makeFakeMonth() {
  const out = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const base = 340 + Math.sin(i / 3) * 20;
    const noise = Math.round((Math.random() - 0.5) * 24);
    out.push({ date, volume: Math.max(200, Math.round(base + noise)) });
  }
  return out;
}

export default function Card2ResultsModal({ data: incoming }) {
  const raw = useMemo(() => incoming ?? makeFakeMonth(), [incoming]);

  // Two-week window (09/01–09/10)
  const dates = Array.from({ length: 10 }, (_, k) => {
    const d = new Date("2025-09-01");
    d.setDate(d.getDate() + k);
    return d.toISOString().slice(0, 10);
  });
  const labelTicks = dates.filter((_, i) => i % 2 === 0); // 09/01, 09/03, ...

  const base10 = raw.slice(-10);
  const series = dates.map((d, i) => {
    const src = base10[i] ?? base10[base10.length - 1] ?? { volume: 320 };
    const swing =
      70 * Math.sin((i + 1) / 1.2) +
      28 * Math.sin(i * 2.6) +
      (Math.random() - 0.5) * 30;
    return { date: d, volume: Math.max(180, Math.round(src.volume + swing)) };
  });

  const startDisplay = "2025/09/01";
  const endDisplay = "2025/09/10";
  const today = series[series.length - 1];

  const stopIfBrush = (e) => {
    if (e.target && e.target.closest && e.target.closest(".recharts-brush")) {
      e.stopPropagation();
    }
  };

  return (
    // Fill the modal-body's height and keep borders off the edges
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
            {/* Animated confidence value */}
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
            <b>{today ? today.volume - 55 : "—"}</b> –{" "}
            <b>{today ? today.volume + 55 : "—"}</b>
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
            <li>Weekday pattern: mid-week volumes typically stronger.</li>
            <li>Prior 7-day trend suggests mild mean-reversion.</li>
          </ul>
          <div style={{ marginTop: 12, fontSize: 13, color: "#4b5563" }}>
            What-ifs: <b>No rain (+3–5%)</b>, <b>+5 °C (+1–2%)</b>.
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
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            fontWeight: 600,
            flex: "0 0 auto",
          }}
        >
          <span>Predicted Volume (Two Weeks Ahead)</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {startDisplay} → {endDisplay}
          </span>
        </div>

        {/* Chart flexes to fill remaining height */}
        <div
          style={{ flex: 1, minHeight: 0 }}
          onClick={stopIfBrush}
          onPointerDown={stopIfBrush}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 12, bottom: 10, left: 0 }}>
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
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#FF0000"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {today && <ReferenceDot x={today.date} y={today.volume} r={5} fill="#FF0000" />}
              <Brush
                className="vc-brush vc-brush--slate"
                dataKey="date"
                height={26}
                travellerWidth={12}
                stroke="#334155"
                fill="rgba(51,65,85,0.10)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280", flex: "0 0 auto" }}>
          Tip: drag the handles in the scrubber (below) to zoom a window inside the range.
        </div>
      </div>
    </div>
  );
}
