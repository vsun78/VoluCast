import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

/**
 * OilBarCard (detailed yet compact)
 *
 * This component renders a dual-axis bar chart showing weekly WTI prices vs.
 * U.S. commercial crude inventories. It keeps axis labels, tick labels and
 * a small legend for clarity, but trims margins and bar sizes so it fits
 * comfortably inside a small Bento card. When an API is unavailable the
 * component falls back to demo data.
 *
 * Props:
 *   - weeks  (number): how many recent data points to display (default 8).
 *   - height (number): height of the chart container in pixels (default 140).
 */
export default function OilBarCard({ weeks = 8, height = 140 }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Attempt to fetch WTI and Stocks series from a local API proxy.
        const r1 = await fetch(`/api/oil/wti-weekly?limit=${weeks}`);
        const r2 = await fetch(`/api/oil/stocks-weekly?limit=${weeks}`);
        if (!r1.ok || !r2.ok) throw new Error("API error");
        const wti = await r1.json();
        const stk = await r2.json();

        // Merge series by period.
        const index = new Map(wti.map(p => [p.period, { period: p.period, wti: p.price }]));
        for (const s of stk) {
          const row = index.get(s.period) || { period: s.period };
          row.stocks = s.stocks;
          index.set(s.period, row);
        }
        const merged = Array.from(index.values())
          .sort((a, b) => a.period.localeCompare(b.period))
          .slice(-weeks)
          .map(r => ({ period: r.period, WTI: r.wti ?? null, Stocks: r.stocks ?? null }));

        setRows(merged.length ? merged : null);
      } catch {
        // Fallback demo data for environments without a backend.
        setRows([
          { period: "2025-06-06", WTI: 77.2, Stocks: 430.1 },
          { period: "2025-06-13", WTI: 78.5, Stocks: 428.7 },
          { period: "2025-06-20", WTI: 76.9, Stocks: 431.3 },
          { period: "2025-06-27", WTI: 79.4, Stocks: 427.9 },
          { period: "2025-07-04", WTI: 80.1, Stocks: 426.8 },
          { period: "2025-07-11", WTI: 81.6, Stocks: 425.4 },
          { period: "2025-07-18", WTI: 82.3, Stocks: 424.6 },
          { period: "2025-07-25", WTI: 83.0, Stocks: 426.7 }
        ]);
      }
    })();
  }, [weeks]);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows || []}
          margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          barGap={4}
          barCategoryGap="40%"
        >
          <Tooltip
            wrapperStyle={{ fontSize: 10 }}
            labelFormatter={(value) => value}
          />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 9 }}
            tickMargin={4}
            tickFormatter={(d) => d.slice(5)}
          />
          <YAxis
            yAxisId="left"
            width={30}
            tick={{ fontSize: 8 }}
            label={{
              value: "WTI (USD/bbl)",
              angle: -90,
              position: "insideLeft",
              offset: -2,
              style: { fontSize: 8 }
            }}
            domain={['auto','auto']}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            width={40}
            tick={{ fontSize: 8 }}
            label={{
              value: "Stocks (M bbl)",
              angle: 90,
              position: "insideRight",
              offset: -2,
              style: { fontSize: 8 }
            }}
            domain={['auto','auto']}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: 8 }}
            iconSize={8}
          />
          <Bar
            yAxisId="left"
            dataKey="WTI"
            name="WTI Price"
            fill="#0ea5e9"
            radius={[3, 3, 0, 0]}
            barSize={6}
          />
          <Bar
            yAxisId="right"
            dataKey="Stocks"
            name="Crude Stocks"
            fill="#7c3aed"
            radius={[3, 3, 0, 0]}
            barSize={6}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
