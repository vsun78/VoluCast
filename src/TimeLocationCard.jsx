import React, { useEffect, useState } from "react";

export default function TimeLocationCard() {
  const [time, setTime] = useState("");

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const lat = 43.6532;
  const lng = -79.3832;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=13&output=embed`;

  return (
    <div className="tl-card">
      {/* Header */}
      <div className="tl-header">
        <div className="tl-title">Time & Location</div>
        <div className="tl-time">{time}</div>
      </div>

      {/* Map fills most of the card */}
      <div className="tl-map">
        <iframe
          title="map-toronto"
          src={src}
          loading="lazy"
          style={{
            border: 0,
            width: "100%",
            height: "100%",
            borderRadius: "12px"
          }}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </div>
  );
}
