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

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const card2Data = useMemo(() => makeFakeMonth(), []);

  //Live preview article
  const [previewArticle, setPreviewArticle] = useState(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        const resp = await fetch(
          `https://gnews.io/api/v4/top-headlines?token=${process.env.REACT_APP_NEWS_API_KEY}&lang=en&country=ca&max=1`
        );
        const data = await resp.json();
        if (data.articles && data.articles.length > 0) {
          const a = data.articles[0];
          setPreviewArticle({
            id: "preview",
            title: a.title,
            source: a.source?.name || "",
            time: new Date(a.publishedAt).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "short",
            }),
            url: a.url,
            imageUrl:
              a.image || "https://via.placeholder.com/600x400?text=No+Image",
          });
        }
      } catch (err) {
        console.error("Preview news fetch failed:", err);
      }
    }

    loadPreview();
    const id = setInterval(loadPreview, 5 * 60 * 1000); // auto refresh every 5 min
    return () => clearInterval(id);
  }, []);

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

  // Choose a dramatic direction per index
  const dirFor = (i) => {
    switch (i) {
      case 0:
        return "dir-left"; // News card: fly from left
      case 1:
        return "dir-top"; // 2x2 feature: drop from top
      case 2:
        return "dir-right"; // Time/Location: from right
      case 3:
        return "dir-bottom"; // Weather: from bottom
      case 4:
        return "dir-diag"; // Oil chart: diagonal
      default:
        return "dir-top";
    }
  };

  return (
    <div className="bento-wrap">
      <div className="site-logo">
        <img src="/mcaiLogo1.png" alt="MCAI Logo" />
      </div>

      <div className={`bento-grid ${loaded ? "is-loaded" : ""}`}>
        {cells.map((n, i) => {
          const extra = i === 1 ? "span-big" : i === 4 ? "span-last" : "";
          const clickable = hasPopup(i);
          const dir = dirFor(i);
          return (
            <div key={n} className={`bento-cell-wrapper ${extra} ${dir}`}>
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
                    <NewsPreview article={previewArticle} />
                  ) : i === 1 ? (
                    <Card2PreviewChart data={card2Data} />
                  ) : i === 3 ? (
                    <WeatherImpactCard />
                  ) : i === 2 ? (
                    <TimeLocationCard />
                  ) : i === 4 ? (
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {/* Title pinned top-left */}
                      <div
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 14,
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#111827",
                        }}
                      >
                        WTI &amp; U.S. Crude Stocks
                      </div>

                      {/* Chart centered */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "28px 14px 14px",
                        }}
                      >
                        <OilBarCard weeks={6} height={120} />
                      </div>
                    </div>
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
