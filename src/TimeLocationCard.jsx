import React, { useEffect, useMemo, useState } from "react";

/**
 * Time + Google Maps card.
 * Listens for: CustomEvent('set-map-location', { detail:{ lat, lng, label } })
 * - Toronto / Quebec → use local time (no override)
 * - Edmonton        → America/Edmonton
 * - New Brunswick   → America/Moncton
 */
export default function TimeLocationCard() {
  const [time, setTime] = useState("");

  // Map state (defaults: Toronto)
  const [loc, setLoc] = useState({
    lat: 43.6532,
    lng: -79.3832,
    label: "Toronto, ON",
  });

  // Optional timezone override (only for Edmonton / New Brunswick)
  const [tzOverride, setTzOverride] = useState(null);

  // Tick clock (restarts if timezone changes)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          ...(tzOverride ? { timeZone: tzOverride } : {}),
        })
      );
    };
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, [tzOverride]);

  // Handle location updates from the InfiniteMenu
  useEffect(() => {
    const handler = (e) => {
      const { lat, lng, label } = e.detail || {};
      if (typeof lat === "number" && typeof lng === "number") {
        setLoc((prev) => ({
          lat,
          lng,
          label: label || prev.label,
        }));

        // Decide timezone override
        const lbl = (label || "").toLowerCase();

        // Default: no override (Toronto/Quebec use local time)
        let tz = null;

        // Label-based detection
        if (lbl.includes("edmonton")) {
          tz = "America/Edmonton";
        } else if (lbl.includes("new brunswick")) {
          tz = "America/Moncton";
        } else {
          // Fallback by coords in case label changes
          const near = (a, b, tol) => Math.abs(a - b) <= tol;
          if (near(lat, 53.5461, 0.6) && near(lng, -113.4938, 1.0)) {
            tz = "America/Edmonton";
          } else if (near(lat, 45.9636, 0.6) && near(lng, -66.6431, 1.0)) {
            tz = "America/Moncton";
          }
        }

        setTzOverride(tz); // null = use local time; string = specific timezone
      }
    };

    window.addEventListener("set-map-location", handler);
    return () => window.removeEventListener("set-map-location", handler);
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
