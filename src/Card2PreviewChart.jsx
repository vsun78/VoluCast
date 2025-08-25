import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceDot,
  Brush,
} from "recharts";

export default function Card2PreviewChart({ data = [] }) {
  const dates = Array.from({ length: 10 }, (_, k) => {
    const d = new Date("2025-09-01");
    d.setDate(d.getDate() + k);
    return d.toISOString().slice(0, 10);
  });
  const labelTicks = dates.filter((_, i) => i % 2 === 0);

  const base10 = data.slice(-10);
  const series = dates.map((d, i) => {
    const src = base10[i] ?? base10[base10.length - 1] ?? { volume: 320 };
    const swing =
      60 * Math.sin((i + 1) / 1.25) +
      24 * Math.sin(i * 2.4) +
      (Math.random() - 0.5) * 28;
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
    <div
      className="shared-font"
      onClick={stopIfBrush}
      onPointerDown={stopIfBrush}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, fontWeight: 600 }}>
        <span>Predicted Sales Volume (Two Weeks Ahead)</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{startDisplay} → {endDisplay}</span>
      </div>

      <div style={{ flex: 1, minHeight: 300 }}>
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
            <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#e5e7eb", fontSize: 12 }} labelStyle={{ fontWeight: 700 }} labelFormatter={(d) => d.replace(/-/g, "/")} />
            <Line type="monotone" dataKey="volume" stroke="#FF0000" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            {today && <ReferenceDot x={today.date} y={today.volume} r={5} fill="#FF0000" />}
            <Brush className="vc-brush vc-brush--slate" dataKey="date" height={26} travellerWidth={3} stroke="#334155" fill="rgba(51,65,85,0.10)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
