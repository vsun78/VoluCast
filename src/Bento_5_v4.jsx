import React, { useState, useEffect, useMemo } from "react";
import "./Bento.css";

import WeatherImpactCard from "./WeatherImpactCard";
import StarBorder from "./StarBorder";
import TimeLocationCard from "./TimeLocationCard";
import "./TimeLocationCard.css";
import OilBarCard from "./OilBarCard";
import Card2ResultsModal from "./Card2ResultsModal";
import Card2PreviewChart from "./Card2PreviewChart";
import CrudeStocksPopup from "./CrudeStocksPopup";
import NewsPreview from "./Components/NewsPreview";

import ModalOverlay from "./ModalOverlay";
import NewsPopup from "./NewsPopup"; // news/politics content

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
  const [newsOpen, setNewsOpen] = useState(false);

  const card2Data = useMemo(() => makeFakeMonth(), []);

  // Hard-coded article + local image from /public
  const demoArticle = {
    id: "a1",
    title:
      "Air Canada suspends profit forecast as striking union defies back-to-work order",
    source: "Reuters",
    time: "1 hour ago",
    url: "#",
    imageUrl: "/airCanada.jpg",
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // lock scroll when legacy modal is open
  useEffect(() => {
    if (activeModal !== null) {
      document.body.style.overflow = "hidden";
      setModalPhase("enter");
    } else {
      document.body.style.overflow = "";
    }
  }, [activeModal]);

  // Which cards have popups?
  const hasPopup = (i) => i === 0 || i === 1 || i === 4;

  // Open the appropriate popup for a card
  const openForIndex = (i) => {
    if (i === 0) setNewsOpen(true);
    else if (i === 1) setActiveModal(1);
    else if (i === 4) setActiveModal(4);
  };

  const startClose = () => {
    setModalPhase("exit");
    setTimeout(() => setActiveModal(null), 250);
  };

  // keyboard activation for accessibility
  const keyActivate = (i) => (e) => {
    if (!hasPopup(i)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openForIndex(i);
    }
  };

  return (
    <div className="bento-wrap">
      <div className="bento-grid">
        {cells.map((n, i) => {
          const extra = i === 1 ? "span-big" : i === 4 ? "span-last" : "";
          const clickable = hasPopup(i);
          return (
            <div key={n} className={`bento-cell-wrapper ${extra}`}>
              <StarBorder
                as="div"
                color={i % 2 === 0 ? "cyan" : "violet"}
                speed="6s"
                thickness={3}
              >
                {/* Entire card is the trigger if it has a popup */}
                <div
                  className="bento-cell"
                  role={clickable ? "button" : undefined}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={clickable ? () => openForIndex(i) : undefined}
                  onKeyDown={keyActivate(i)}
                  style={clickable ? { cursor: "pointer" } : undefined}
                >
                  {i === 0 ? (
                    // News preview card (one top story)
                    <NewsPreview article={demoArticle} />
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
            </div>
          );
        })}
      </div>

      {/* Top-left BIG popup using ModalOverlay + NewsPopup */}
      <ModalOverlay open={newsOpen} onClose={() => setNewsOpen(false)}>
        <NewsPopup onClose={() => setNewsOpen(false)} />
      </ModalOverlay>

      {/* Existing modal flow for the other cards */}
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
