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
import InfiniteMenu from "./InfiniteMenu";

import TextType from "./TextType";

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

// Simple helper for coloring %
const pctClass = (n) => (Number(n) >= 0 ? "stock-pct up" : "stock-pct down");

// FRONT OF FLIP: two-stock compact layout
function CrudeTwoStockFront() {
  // TODO: wire to live values when ready
  const data = [
    { ticker: "WCS", name: "Western Canada Select", price: "$61.12", pct: +1.8 },
    { ticker: "WTI", name: "West Texas Intermediate", price: "$78.45", pct: +2.3 },
  ];
  return (
    <div className="flip-face two-stock-front">
      {data.map((s) => (
        <div key={s.ticker} className="stock-row">
          <div className="stock-left">
            <div className="stock-ticker">{s.ticker}</div>
            <div className="stock-name">{s.name}</div>
          </div>
          <div className="stock-right">
            <div className="stock-price">{s.price}</div>
            <div className={pctClass(s.pct)}>
              {s.pct > 0 ? "+" : ""}
              {s.pct.toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// BACK OF FLIP: your existing mini preview
function CrudePreviewBack() {
  return (
    <div className="flip-face flip-back">
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#ffffff",
        }}
      >
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
    </div>
  );
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


const card2Data = [
  { date: "2025-09-01", loc1: 394.91, loc2: 430.18, loc3: 373.57, loc4: 248.64, loc5: 334.31, loc6: 327.33, loc7: 214.55, loc8: 343.69, loc9: 247.26 },
  { date: "2025-09-02", loc1: 403.41, loc2: 355.5, loc3: 230.5, loc4: 196.31, loc5: 415.56, loc6: 306.57, loc7: 195.63, loc8: 193.47, loc9: 298.32 },
  { date: "2025-09-03", loc1: 374.62, loc2: 379.94, loc3: 391.45, loc4: 285.54, loc5: 369.6, loc6: 393.45, loc7: 260.77, loc8: 350.05, loc9: 303.12 },
  { date: "2025-09-04", loc1: 400.94, loc2: 268.25, loc3: 268.25, loc4: 352.26, loc5: 370.18, loc6: 341, loc7: 247, loc8: 374.17, loc9: 319.51 },
  { date: "2025-09-05", loc1: 469.5, loc2: 355.08, loc3: 355.08, loc4: 349.24, loc5: 247.54, loc6: 354.08, loc7: 300.79, loc8: 363.35, loc9: 270.38 },
  { date: "2025-09-06", loc1: 497.43, loc2: 374.45, loc3: 374.45, loc4: 338.93, loc5: 416.4, loc6: 326.11, loc7: 353.39, loc8: 392.45, loc9: 316.71 },
  { date: "2025-09-07", loc1: 391.44, loc2: 379, loc3: 379, loc4: 398.83, loc5: 355.35, loc6: 391.33, loc7: 370.79, loc8: 339.52, loc9: 350.66 },
];


  // Live preview article
  const [previewArticle, setPreviewArticle] = useState(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    async function loadPreview() {
      const KEYWORDS = [
        "asphalt","bitumen","paving","road construction","roadwork","infrastructure",
        "crude oil","WTI","WCS","diesel","refinery","pipeline",
        "aggregate","cement","shingles","construction spending",
        "Bank of Canada","inflation","interest rates","CPI","infrastructure spending",
        "carbon tax","fuel tax"
      ];
      const pickBest = (arts) => {
        return (arts || [])
          .sort((a, b) => {
            const has = (x) =>
              KEYWORDS.some((k) => (x.title || "").toLowerCase().includes(k.toLowerCase()));
            return (has(b) ? 1 : 0) - (has(a) ? 1 : 0);
          })[0];
      };

      const token = process.env.REACT_APP_NEWS_API_KEY;
      if (!token) {
        console.warn("REACT_APP_NEWS_API_KEY is missing");
        setPreviewError("Missing API key");
        return;
      }

      // Try 1: search with curated OR query
      const q1 =
        'asphalt OR bitumen OR "road construction" OR paving OR infrastructure OR "crude oil" OR WTI OR WCS OR diesel OR refinery OR pipeline OR "Bank of Canada" OR inflation OR "interest rates" OR CPI OR "infrastructure spending"';
      const url1 = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
        q1
      )}&lang=en&max=10&token=${token}`;

      // Try 2: energy/infrastructure narrower query
      const q2 =
        '"crude oil" OR bitumen OR diesel OR refinery OR pipeline OR asphalt OR infrastructure';
      const url2 = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
        q2
      )}&lang=en&max=10&token=${token}`;

      // Try 3: fallback to business headlines
      const url3 = `https://gnews.io/api/v4/top-headlines?topic=business&lang=en&max=10&token=${token}`;

      try {
        const tryUrls = [url1, url2, url3];
        let chosen = null;
        for (const u of tryUrls) {
          const r = await fetch(u);
          const text = await r.text();
          let json;
          try {
            json = JSON.parse(text);
          } catch (e) {
            console.error("Non-JSON response from GNews:", text);
            continue;
          }
          if (!json || !json.articles) {
            console.warn("GNews empty payload:", json);
            continue;
          }
          const best = pickBest(json.articles);
          if (best) {
            chosen = best;
            break;
          }
        }

        if (chosen) {
          setPreviewArticle({
            id: "preview",
            title: chosen.title,
            source: chosen.source?.name || "",
            time: new Date(chosen.publishedAt).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "short",
            }),
            url: chosen.url,
            imageUrl: chosen.image || "https://via.placeholder.com/600x400?text=No+Image",
          });
          setPreviewError("");
        } else {
          setPreviewArticle(null);
          setPreviewError("No curated news found");
        }
      } catch (err) {
        console.error("Preview news fetch failed:", err);
        setPreviewArticle(null);
        setPreviewError("News fetch failed");
      }
    }

    loadPreview();
    const id = setInterval(loadPreview, 60 * 60 * 1000); // refresh every hour
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (activeModal !== null) {
      document.body.style.overflow = "hidden";
      setModalPhase("enter");
    } else {
      document.body.style.overflow = "";
    }
  }, [activeModal]);

  const hasPopup = (i) => i === 0 || i === 1 || i === 2 || i === 4;
  const openForIndex = (i) => {
    if (i === 0) setNewsOpen(true);
    else if (i === 1) setActiveModal(1);
    else if (i === 2) setActiveModal(2); // Time & Location → InfiniteMenu
    else if (i === 4) setActiveModal(4); // Crude stocks
  };
  const startClose = () => {
    setModalPhase("exit");
    setTimeout(() => setActiveModal(null), 250);
  };
  const keyActivate = (i) => (e) => {
    if (!hasPopup(i)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openForIndex(i);
    }
  };
  const dirFor = (i) => {
    switch (i) {
      case 0: return "dir-left";
      case 1: return "dir-top";
      case 2: return "dir-right";
      case 3: return "dir-bottom";
      case 4: return "dir-diag";
      default: return "dir-top";
    }
  };

  return (
    <div className="bento-wrap">
      <div className="site-logo">
        <img src="/mcaiLogo1.png" alt="MCAI Logo" />
      </div>

      
      <div className="bento-inner">
        
        <div className="hello-user">
  <TextType
    text={["Hello Edmund! 🙂", "Welcome to VoluCast.", "Sales are looking good today! 🤩"]}
    typingSpeed={75}
    pauseDuration={1500}
    showCursor={true}
    cursorCharacter="|"
  />
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
                      previewArticle ? (
                        <NewsPreview article={previewArticle} />
                      ) : (
                        <div style={{ color: "#6b7280", fontWeight: 600 }}>
                          {previewError || "Loading curated news…"}
                        </div>
                      )
                    ) : i === 1 ? (
                      <Card2PreviewChart data={card2Data} />
                    ) : i === 3 ? (
                      <WeatherImpactCard />
                    ) : i === 2 ? (
                      <TimeLocationCard />
                    ) : i === 4 ? (
                      /* ======== FLIP CARD: front shows WCS/WTI, back shows existing mini preview ======== */
                      <div className="flip-wrap" aria-label="Crude benchmarks card (flip on hover)">
                        <div className="flip-inner">
                          <CrudeTwoStockFront />
                          <CrudePreviewBack />
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
      </div>
      

      {/* Top-left BIG popup using ModalOverlay + NewsPopup */}
      <ModalOverlay open={newsOpen} onClose={() => setNewsOpen(false)}>
        <NewsPopup onClose={() => setNewsOpen(false)} />
      </ModalOverlay>

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
              ) : activeModal === 2 ? (
                <div style={{ flex: 1, minHeight: 0 }}>
                  <InfiniteMenu
                    items={[
                      { image: "/ontario.jpg", title: "ONTARIO REGION", link: "#toronto" },
                      { image: "/quebec.png", title: "QUEBEC REGION", link: "#ottawa" },
                      { image: "/atlantic.png", title: "ATLANTIC REGION", link: "#kingston" },
                      { image: "/west.png", title: "WEST REGION", link: "#hamilton" },
                    ]}
                  />
                </div>
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
