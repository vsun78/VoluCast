import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

// demo data (keep or replace later)
const demo = [
  { period: "2025-06-06", WTI: 77.2, Stocks: 430.1 },
  { period: "2025-06-13", WTI: 78.5, Stocks: 428.7 },
  { period: "2025-06-20", WTI: 76.9, Stocks: 431.3 },
  { period: "2025-06-27", WTI: 79.4, Stocks: 427.9 },
  { period: "2025-07-04", WTI: 80.1, Stocks: 426.8 },
  { period: "2025-07-11", WTI: 81.6, Stocks: 425.4 },
  { period: "2025-07-18", WTI: 82.3, Stocks: 424.6 },
  { period: "2025-07-25", WTI: 83.0, Stocks: 426.7 },
  { period: "2025-08-01", WTI: 81.9, Stocks: 423.7 },
  { period: "2025-08-08", WTI: 82.7, Stocks: 422.9 },
  { period: "2025-08-15", WTI: 83.4, Stocks: 421.5 },
  { period: "2025-08-22", WTI: 84.0, Stocks: 420.8 }
];

export default function OilBarCompact({ height = 90, points = 8 }) {
  const data = demo.slice(-points); // fewer points = less clutter
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 2, right: 4, left: 4, bottom: 2 }}
          barGap={2}
          barCategoryGap="60%"
        >
          {/* keep tooltip; hide axes + labels to save space */}
          <Tooltip cursor={false} />
          <XAxis dataKey="period" hide />
          {/* two hidden Y axes so each series scales correctly */}
          <YAxis yAxisId="left" hide domain={["dataMin-2", "dataMax+2"]} />
          <YAxis yAxisId="right" hide orientation="right" domain={["dataMin-10", "dataMax+10"]} />

          <Bar yAxisId="left"  dataKey="WTI"    fill="#0ea5e9" radius={[3,3,0,0]} barSize={5} />
          <Bar yAxisId="right" dataKey="Stocks" fill="#7c3aed" radius={[3,3,0,0]} barSize={5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
