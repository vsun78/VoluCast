// src/Chart.jsx
import React, { useEffect, useRef, useState } from "react";
import "./Chart.css";

export default function Chart() {
  const lineRef = useRef(null);
  const [len, setLen] = useState(0);

  useEffect(() => {
    if (lineRef.current) {
      const L = lineRef.current.getTotalLength();
      setLen(L);
    }
  }, []);

  return (
    <div className="chart-card">
      <div className="chart-overlay">
        <div className="chart-label">This Month:</div>
        <div className="chart-value">+300%</div>
      </div>

      <div className="chart-bg">
        <svg viewBox="0 0 653 465" className="chart-svg" preserveAspectRatio="none">
          {/* Area (fades in) */}
          <path
            className="chart-area"
            d="M0 460.694c6.6-3.13 19.8-11.272 33-15.654s19.8-2.814 33-6.257 19.8.365 33-10.955 19.8-32.07 33-45.643c13.2-13.572 19.8-16.08 33-22.22s19.8-5.647 33-8.48c13.2-2.832 19.8 5.901 33-5.68 13.2-11.582 19.8-37.759 33-52.226 13.2-14.468 19.8-28.263 33-20.112 13.2 8.15 19.8 59.038 33 60.863 13.2 1.824 19.8-43.269 33-51.741s19.8 24.488 33 9.38c13.2-15.11 19.8-81.825 33-84.923s19.8 54.76 33 69.432 19.8 34.912 33 3.931 19.8-148.752 33-158.837c13.2-10.086 19.8 111.943 33 108.409 13.2-3.535 19.8-97.635 33-126.082s19.8-7.562 33-16.152 26.4-21.438 33-26.798L653 465H0Z"
          />
          {/* Line (draws itself) */}
          <path
            ref={lineRef}
            style={{ "--len": len }}
            className="chart-line"
            d="M0 460.694c6.6-3.13 19.8-11.272 33-15.654s19.8-2.814 33-6.257 19.8.365 33-10.955 19.8-32.07 33-45.643c13.2-13.572 19.8-16.08 33-22.22s19.8-5.647 33-8.48c13.2-2.832 19.8 5.901 33-5.68 13.2-11.582 19.8-37.759 33-52.226 13.2-14.468 19.8-28.263 33-20.112 13.2 8.15 19.8 59.038 33 60.863 13.2 1.824 19.8-43.269 33-51.741s19.8 24.488 33 9.38c13.2-15.11 19.8-81.825 33-84.923s19.8 54.76 33 69.432 19.8 34.912 33 3.931 19.8-148.752 33-158.837c13.2-10.086 19.8 111.943 33 108.409 13.2-3.535 19.8-97.635 33-126.082s19.8-7.562 33-16.152 26.4-21.438 33-26.798"
          />
        </svg>
      </div>
    </div>
  );
}
