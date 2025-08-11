// src/components/TimeLocationCard.jsx
import React from "react";

function ClockIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="#111827" strokeWidth="1.5"/>
      <path d="M12 7v5l3 2" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function TimeLocationCard({
  title = "Time & Location Context",
  city = "Toronto, Canada",
  lat = 43.6532,
  lng = -79.3832,
  note = "Peak work hours"
}) {
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=12&output=embed`;
  return (
    <div className="tl-card">
      <div className="tl-header">{title}</div>

      <div className="tl-body">
        <div className="tl-left">
          <ClockIcon />
          <div className="tl-note">
            <div className="tl-note-title">{note}</div>
            <div className="tl-note-sub">{city}</div>
          </div>
        </div>

        <div className="tl-map">
          <iframe
            title={`map-${city}`}
            src={src}
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
