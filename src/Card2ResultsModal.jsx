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

  const data = useMemo(() => incoming ?? makeFakeMonth(), [incoming]);
  const startDate = data[0]?.date || "";
  const endDate = data[data.length - 1]?.date || "";
  const today = data[data.length - 1];

  return (
    <div className = "shared-font"
      style={{
        display: "flex",
        gap: 16,
        minHeight: 380,
        alignItems: "stretch",
      }}
    >
      {/* LEFT COLUMN */}
      <div
        style={{
          flex: "0 0 38%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
            Confidence
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>87%</div>
            <span style={{ fontSize: 12, color: "#6b7280" }}>for today</span>
          </div>

          <div
            style={{
              marginTop: 12,
              height: 8,
              width: "100%",
              background: "#f3f4f6",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div style={{ width: "87%", height: "100%", background: "#34d399" }} />
          </div>

          <div style={{ marginTop: 8, fontSize: 12, color: "#4b5563" }}>
            Prediction interval (80%):{" "}
            <b>{today ? today.volume - 45 : "—"}</b> –{" "}
            <b>{today ? today.volume + 45 : "—"}</b>
          </div>
        </section>

        <section
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>
            Why this prediction? (AI explanation)
          </div>
          <ul style={{ fontSize: 14, color: "#111827", lineHeight: 1.4, paddingLeft: 18 }}>
            <li>Rain probability ↑ expected to lower hauling efficiency.</li>
            <li>Temperature near seasonal average; minimal thermal impact.</li>
            <li>Weekday pattern: mid-week volumes typically stronger.</li>
            <li>Prior 7-day trend suggests mild mean-reversion.</li>
          </ul>
          <div style={{ marginTop: 10, fontSize: 12, color: "#4b5563" }}>
            What-ifs: <b>No rain (+3–5%)</b>, <b>+5 °C (+1–2%)</b>.
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN */}
      <div
        style={{
          flex: "1 1 62%",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 12,
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
          }}
        >
          <span>Predicted Volume (Last 30 Days)</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            {startDate} → {endDate}
          </span>
        </div>

        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  borderColor: "#e5e7eb",
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 700 }}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {today && <ReferenceDot x={today.date} y={today.volume} r={5} fill="#8b5cf6" />}
              <Brush dataKey="date" height={22} travellerWidth={8} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Tip: drag the handles in the scrubber (below) to zoom a window inside the month.
        </div>
      </div>
    </div>
  );
}
