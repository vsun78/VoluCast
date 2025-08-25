import React from "react";
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

export default function Card2PreviewChart({ data = [] }) {

  const dates = Array.from({ length: 7 }, (_, k) => {
    const d = new Date("2025-09-01");
    d.setDate(d.getDate() + k);
    return d.toISOString().slice(0, 10);
  });
  const labelTicks = dates;

  const colors = [
    "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#06b6d4", "#dc2626", "#16a34a", "#ea580c",
  ];


  const base7 = (data.length ? data : [{ volume: 320 }]).slice(-7);
  const rows = dates.map((date, i) => {
    const point = { date };
    for (let loc = 0; loc < 9; loc++) {
      const seed =
        base7[i % base7.length]?.volume ??
        base7[base7.length - 1]?.volume ??
        320;
      const swing =
        (50 + loc * 2.5) * Math.sin((i + 0.8 + loc * 0.25) / (1.15 + loc * 0.03)) +
        (20 + loc * 1.2) * Math.sin(i * (2.3 + loc * 0.05)) +
        (Math.random() - 0.5) * (22 + loc * 1.1);
      point[`loc${loc + 1}`] = Math.max(160, Math.round(seed + swing));
    }
    return point;
  });

  const startDisplay = "2025/09/01";
  const endDisplay = "2025/09/07";

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
        <span>Predicted Sales Volume by Location</span>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{startDisplay} → {endDisplay}</span>
      </div>

      <div style={{ flex: 1, minHeight: 300 }}>
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
            {Array.from({ length: 9 }, (_, k) => (
              <Line
                key={k}
                type="monotone"
                dataKey={`loc${k + 1}`}
                name={`Location ${k + 1}`}
                stroke={colors[k]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3.5 }}
                
                isAnimationActive={true}
                animationDuration={650}
                animationEasing="ease-out"
              />
            ))}
            <Brush className="vc-brush vc-brush--slate" dataKey="date" height={26} travellerWidth={3} stroke="#334155" fill="rgba(51,65,85,0.10)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
