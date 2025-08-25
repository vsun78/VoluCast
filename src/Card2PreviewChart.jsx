import React, { useState } from "react";
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
  // Sept 01 -> Sept 07
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

  // Seed + synth data for 9 locations
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

  // Dropdown selection
  const [selectedKey, setSelectedKey] = useState("ALL"); // "ALL" | "loc1".."loc9"

  // Prevent dropdown interactions from launching the parent popup
  const stop = (e) => {
    e.stopPropagation();
  };

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
      {/* Header with title  dropdown dates */}
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>Predicted Sales Volume by Location</span>

        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          onClick={stop}
          onMouseDown={stop}
          onPointerDown={stop}
          onKeyDown={(e) => { if (e.key !== "Tab") stop(e); }}
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
                  activeDot={{ r: 3.5 }}
                  isAnimationActive={true}
                  animationDuration={650}
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
    </div>
  );
}
