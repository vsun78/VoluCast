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

export default function Card2PreviewChart({ data = [] }) {
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, k) => {
      const d = new Date("2025-09-01");
      d.setDate(d.getDate() + k);
      return d.toISOString().slice(0, 10);
    });
  }, []);
  const labelTicks = dates;

  const colors = [
    "#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#06b6d4", "#dc2626", "#16a34a", "#ea580c",
  ];

  const rows = useMemo(() => {
    const base7 = (data.length ? data : [{ volume: 320 }]).slice(-7);
    return dates.map((date, i) => {
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
  }, [data, dates]);

  const startDisplay = "2025/09/01";
  const endDisplay = "2025/09/07";

  const allKeys = Array.from({ length: 9 }, (_, i) => `loc${i + 1}`);
  const [open, setOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(allKeys);


  const toggleKey = (key) => {
    if (key === "ALL") {
      setSelectedKeys((prev) =>
        prev.length === allKeys.length ? [] : allKeys
      );
    } else {
      setSelectedKeys((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  const labelForSelection = () => {
    if (selectedKeys.length === allKeys.length) return "All Locations";
    if (selectedKeys.length === 1) {
      const n = Number(selectedKeys[0].replace("loc", ""));
      return `Location ${n}`;
    }
    return `${selectedKeys.length} selected`;
  };

  const stopAll = (e) => e.stopPropagation();
  const stopIfBrush = (e) => {
    if (e.target.closest(".recharts-brush")) e.stopPropagation();
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
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: 14,
          fontWeight: 600,
          position: "relative",
        }}
        onClick={stopAll}
        onMouseDown={stopAll}
        onPointerDown={stopAll}
      >
        <span>Predicted Sales Volume by Location</span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          {labelForSelection()}
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 210,
              marginTop: 6,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              padding: 6,
              zIndex: 20,
              minWidth: 180,
            }}
            onClick={stopAll}
          >
            <MenuItem
              label="All Locations"
              checked={selectedKeys.length === allKeys.length}
              onChange={() => toggleKey("ALL")}
            />
            <div style={{ height: 6 }} />
            {allKeys.map((k, idx) => (
              <MenuItem
                key={k}
                label={`Location ${idx + 1}`}
                checked={selectedKeys.includes(k)}
                swatch={colors[idx]}
                onChange={() => toggleKey(k)}
              />
            ))}
          </div>
        )}

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
            {selectedKeys.map((key) => {
              const idx = Number(key.replace("loc", "")) - 1;
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={`Location ${idx + 1}`}
                  stroke={colors[idx]}
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

function MenuItem({ label, checked, onChange, swatch }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 8px",
        borderRadius: 6,
        cursor: "pointer",
        background: checked ? "#f3f4f6" : "transparent",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ cursor: "pointer" }}
      />
      {swatch && (
        <span style={{ width: 10, height: 10, background: swatch, borderRadius: 2 }} />
      )}
      <span style={{ fontSize: 12 }}>{label}</span>
    </label>
  );
}
