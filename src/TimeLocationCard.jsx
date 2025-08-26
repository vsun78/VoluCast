import React, { useEffect, useMemo, useState } from "react";

/**
 * Time + Google Maps card.
 * Now listens for a CustomEvent('set-map-location', {detail:{lat,lng,label}})
 * dispatched by the InfiniteMenu button. Defaults to Toronto.
 */
export default function TimeLocationCard() {
  const [time, setTime] = useState("");

  // --- location state (defaults: Toronto) ---
  const [loc, setLoc] = useState({
    lat: 43.6532,
    lng: -79.3832,
    label: "Toronto, ON",
  });

  // Keep time ticking, but don't jitter the layout
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

  // Listen for location changes coming from the InfiniteMenu
  useEffect(() => {
    const handler = (e) => {
      const { lat, lng, label } = e.detail || {};
      if (typeof lat === "number" && typeof lng === "number") {
        setLoc({
          lat,
          lng,
          label: label || loc.label,
        });
      }
    };
    window.addEventListener("set-map-location", handler);
    return () => window.removeEventListener("set-map-location", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const src = `https://www.google.com/maps?q=${loc.lat},${loc.lng}&z=13&output=embed`;

  // Keep the iframe element stable so it doesn't remount on each tick
  const MapFrame = useMemo(
    () => (
      <iframe
        title="map-embed"
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
            width: "11ch",
            textAlign: "right",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            fontFeatureSettings: '"tnum" 1',
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          }}
          title={loc.label}
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
