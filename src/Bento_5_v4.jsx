
import React, { useState, useEffect, useMemo } from "react";
import "./Bento.css";
import Chart from "./Chart";
import WeatherImpactCard from "./WeatherImpactCard";
import StarBorder from "./StarBorder";
import TimeLocationCard from "./TimeLocationCard";
import "./TimeLocationCard.css";
import OilBarCard from "./OilBarCard";
import Card2ResultsModal from "./Card2ResultsModal";
import Card2PreviewChart from "./Card2PreviewChart";
import CrudeStocksPopup from "./CrudeStocksPopup";


const cells = [1, 2, 3, 4, 5];
export const Cell = ({ i = 0 }) => <div className="fallback-cell">Card {i}</div>;

function makeFakeMonth() {
  const out = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const base = 340 + Math.sin(i / 3) * 20;
    const noise = Math.round((Math.random() - 0.5) * 24);
    out.push({ date, volume: Math.max(200, Math.round(base + noise)) });
  }
  return out;
}

export default function Bento_5_v4() {
  const [activeModal, setActiveModal] = useState(null);
  const [modalPhase, setModalPhase] = useState("enter");

  // One dataset for Card 2 (shared by preview + modal)
  const card2Data = useMemo(() => makeFakeMonth(), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock scroll when modal is open
  useEffect(() => {
    if (activeModal !== null) {
      document.body.style.overflow = "hidden";
      setModalPhase("enter");
    } else {
      document.body.style.overflow = "";
    }
  }, [activeModal]);

  const shouldShowView = (i) => !(i === 2 || i === 3);

  const startClose = () => {
    setModalPhase("exit");
    setTimeout(() => setActiveModal(null), 250);
  };

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
                {/* changed back to bento-cell so hover animation applies */}
                <div className="bento-cell">
                  {i === 0 ? (
                    <Chart />
                  ) : i === 1 ? (
                    <Card2PreviewChart data={card2Data} />
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
                  aria-label={`Open details for card ${i + 1}`}
                  onClick={() => setActiveModal(i)}
                >
                  <img src="/eyeIcon.png" alt="" className="view-icon" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {activeModal !== null && (
        <div
          className={`modal-backdrop ${modalPhase === "exit" ? "closing" : ""}`}
          onClick={startClose}
        >
          <div
            className={`modal-sheet ${modalPhase === "exit" ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-body">
  {activeModal === 1 ? (
    <Card2ResultsModal data={card2Data} />
  ) : activeModal === 4 ? (
    <CrudeStocksPopup />
  ) : (
    <div className="text-sm" style={{ color: "#4b5563" }}>
      No custom content wired for this card yet.
    </div>
  )}
</div>

          </div>
        </div>
      )}
    </div>
  );
}
