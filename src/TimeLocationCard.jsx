import React, { useEffect, useMemo, useState } from "react";

export default function TimeLocationCard() {
  const [time, setTime] = useState("");

  // Update current time every second (but keep layout stable)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  const lat = 43.6532;
  const lng = -79.3832;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`;

  // Keep the iframe element stable so it doesn't remount on each tick
  const MapFrame = useMemo(
    () => (
      <iframe
        title="map-toronto"
        src={src}
        loading="lazy"
        style={{
          border: 0,
          width: "100%",
          height: "100%",
          borderRadius: "12px",
        }}
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    ),
    [src]
  );

  return (
    <div
      className="tl-card"
      style={{
        padding: 16,
        borderRadius: 16,
        background: "#fff",
        boxShadow: "0 6px 20px rgba(0,0,0,.08)",
      }}
    >
      {/* Header */}
      <div
        className="tl-header"
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 10,
          gap: 8,
        }}
      >
        <div
          className="tl-title"
          style={{ fontWeight: 700, whiteSpace: "nowrap" }}
        >
          Time &amp; Location
        </div>

        <div
          className="tl-time"
          aria-live="polite"
          style={{
            // reserve fixed space so digits don't push layout
            width: "11ch", // fits “10:15:31 AM”
            textAlign: "right",
            whiteSpace: "nowrap",
            // make digits fixed-width to stop jitter
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum" 1',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          }}
        >
          {time}
        </div>
      </div>

      {/* Map fills most of the card */}
      <div className="tl-map" style={{ width: "100%", height: 200 }}>
        {MapFrame}
      </div>
    </div>
  );
}
