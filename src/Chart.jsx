import React from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
// testing again
// Keep or replace with live data later
const demo = [
  { period: "2025-06-06", WTI: 77.2 },
  { period: "2025-06-13", WTI: 78.5 },
  { period: "2025-06-20", WTI: 76.9 },
  { period: "2025-06-27", WTI: 79.4 },
  { period: "2025-07-04", WTI: 80.1 },
  { period: "2025-07-11", WTI: 81.6 },
  { period: "2025-07-18", WTI: 82.3 },
  { period: "2025-07-25", WTI: 83.0 },
  { period: "2025-08-01", WTI: 81.9 },
  { period: "2025-08-08", WTI: 82.7 },
  { period: "2025-08-15", WTI: 83.4 },
  { period: "2025-08-22", WTI: 84.0 }
];

export default function OilBarMicro({ height = 90 }) {
  // show the last 8 points to reduce crowding
  const data = demo.slice(-8);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 2, right: 2, left: 2, bottom: 0 }}
          barCategoryGap="70%"   // lots of spacing
        >
          {/* no axes, no legend, no tooltip */}
          <Bar dataKey="WTI" fill="#0ea5e9" barSize={4} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
