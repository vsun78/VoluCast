import React, { useState, useEffect } from "react";
import "./Bento.css";
import Chart from "./Chart";
import WeatherImpactCard from "./WeatherImpactCard";
import StarBorder from "./StarBorder";
import TimeLocationCard from "./TimeLocationCard";
import "./TimeLocationCard.css";
import OilBarCard from "./OilBarCard";

const cells = [1, 2, 3, 4, 5];

export const Cell = ({ i = 0 }) => <div>{i}</div>;

export default function Bento_5_v4() {
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setActiveModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shouldShowView = (i) => !(i === 2 || i === 3);

  return (
    <div className="bento-wrap">
      <div className="bento-grid">
        {cells.map((n, i) => {
          const extra = i === 1 ? "span-big" : i === 4 ? "span-last" : "";
          return (
            <div key={n} className={`bento-cell-wrapper ${extra}`}>
              <StarBorder
                as="div"
                color={i % 2 === 0 ? "cyan" : "violet"}
                speed="6s"
                thickness={3}
              >
                <div className="bento-cell">
                  {i === 0 ? (
                    <Chart />
                  ) : i === 3 ? (
                    <WeatherImpactCard />
                  ) : i === 2 ? (
                    <TimeLocationCard />
                  ) : i === 4 ? (
                    <OilBarCard weeks={6} height={120} />
                  ) : (
                    <Cell i={i + 1} />
                  )}
                </div>
              </StarBorder>

              {shouldShowView(i) && (
                <button
                  className="view-btn"
                  onClick={() => setActiveModal(i)}
                >
                  <img src="/eyeIcon.png" alt="View" className="view-icon" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeModal !== null && (
        <div className="modal-backdrop" onClick={() => setActiveModal(null)}>
          <div
            className="modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Details</h2>
              <button
                className="modal-close"
                onClick={() => setActiveModal(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Blank for now */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
