
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

/**
 * Preview chart for Card 2 — same graph style as modal,
 * but only shows the chart (no confidence/AI explanation).
 */
export default function Card2PreviewChart({ data }) {
  const startDate = data[0]?.date || "";
  const endDate = data[data.length - 1]?.date || "";
  const today = data[data.length - 1];

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
        width: "100%",
        height: "100%",
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

      <div style={{ height: 220 }}>
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
            {today && (
              <ReferenceDot x={today.date} y={today.volume} r={5} fill="#8b5cf6" />
            )}
            <Brush dataKey="date" height={22} travellerWidth={8} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
