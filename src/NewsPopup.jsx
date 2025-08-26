import React, { useEffect, useMemo, useRef, useState } from "react";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'>
      <rect width='800' height='450' fill='#f3f4f6'/>
      <g fill='#9ca3af'>
        <circle cx='120' cy='120' r='36'/>
        <rect x='200' y='96' width='420' height='24' rx='6'/>
        <rect x='200' y='136' width='360' height='22' rx='6'/>
      </g>
    </svg>`
  );

export default function NewsPopup({ onClose, articles: external }) {
  const [articles, setArticles] = useState(external ?? null);
  const [status, setStatus] = useState(external ? "ready" : "loading"); // loading | ready | empty | error

  useEffect(() => {
    if (external) return;

    async function loadNews() {
      const KEYWORDS = [
        "asphalt","bitumen","paving","road construction","roadwork","infrastructure",
        "crude oil","WTI","WCS","diesel","refinery","pipeline",
        "aggregate","cement","shingles","construction spending",
        "Bank of Canada","inflation","interest rates","CPI","infrastructure spending",
        "carbon tax","fuel tax"
      ];
      const scoreTitle = (t = "") =>
        KEYWORDS.reduce((s,k)=> s + (t.toLowerCase().includes(k.toLowerCase()) ? 1 : 0), 0);

      const token = process.env.REACT_APP_NEWS_API_KEY;
      if (!token) { setStatus("error"); return; }

      // Curated queries (no country filter so we don’t drop relevant items)
      const q1 = 'asphalt OR bitumen OR "road construction" OR paving OR infrastructure OR "crude oil" OR WTI OR WCS OR diesel OR refinery OR pipeline OR "Bank of Canada" OR inflation OR "interest rates" OR CPI OR "infrastructure spending"';
      const q2 = '"crude oil" OR bitumen OR diesel OR refinery OR pipeline OR asphalt OR infrastructure';

      const urls = [
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(q1)}&lang=en&max=24&token=${token}`,
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(q2)}&lang=en&max=24&token=${token}`,
        `https://gnews.io/api/v4/top-headlines?topic=business&lang=en&max=24&token=${token}`, // fallback
      ];

      try {
        let pool = [];
        for (const u of urls) {
          const r = await fetch(u);
          const text = await r.text();
          let json;
          try { json = JSON.parse(text); } catch { continue; }
          if (json?.articles?.length) {
            pool = pool.concat(json.articles);
          }
          if (pool.length >= 24) break;
        }

        if (!pool.length) {
          setArticles([]);
          setStatus("empty");
          return;
        }

        // Map to your existing shape + score and pick top 12
        const seen = new Set();
        const mapped = pool
          .filter(a => {
            const k = (a.url || a.title || "") + (a.publishedAt || "");
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
          })
          .map((a, i) => ({
            id: i.toString(),
            title: a.title,
            source: a.source?.name || "",
            time: new Date(a.publishedAt).toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              day: "numeric",
              month: "short",
            }),
            url: a.url,
            imageUrl: a.image || "https://via.placeholder.com/800x450?text=No+Image",
            _score: scoreTitle(a.title),
          }))
          .sort((x, y) => y._score - x._score)
          .slice(0, 12)
          .map(({ _score, ...a }) => a);

        setArticles(mapped);
        setStatus("ready");
      } catch (err) {
        console.error("News fetch error:", err);
        setStatus("error");
      }
    }

    loadNews();
  }, [external]);

  const rows = useMemo(() => {
    if (!articles) return [];
    const out = [];
    for (let i = 0; i < articles.length; i += 4) {
      out.push(articles.slice(i, i + 4));
    }
    return out;
  }, [articles]);

  return (
    <div
      className="shared-font"
      style={{
        width: "min(1320px, 98vw)",
        height: "88vh",
        background: "white",
        borderRadius: 16,
        boxShadow: "0 22px 70px rgba(0,0,0,18)",
        border: "1px solid rgba(0,0,0,08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scroll area only */}
      <div style={{ overflowY: "auto", overflowX: "hidden", padding: 18 }}>
        {status === "loading" && <Skeleton />}
        {status === "empty" && (
          <div style={{ color: "#6b7280", fontWeight: 600 }}>No curated news found.</div>
        )}
        {status === "error" && (
          <div style={{ color: "#b91c1c", fontWeight: 600 }}>News fetch failed.</div>
        )}
        {status === "ready" && (
          <div style={{ display: "grid", gap: 28 }}>
            {rows.map((group, idx) => (
              <Row key={idx} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- row (feature + side list) ----
function Row({ group }) {
  const [feature, ...rest] = group; // NOTE: keep original layout; just fix spread
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
        gap: 22,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <FeatureCard a={feature} />
      </div>
      <div style={{ minWidth: 0 }}>
        <SideList items={rest} />
      </div>
    </div>
  );
}

function FeatureCard({ a }) {
  const imgRef = useRef(null);
  const src = a?.imageUrl || FALLBACK_IMG;
  return (
    <a
      href={a?.url || "#"}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block",
        border: "1px solid rgba(0,0,0,1)",
        borderRadius: 18,
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        background: "white",
      }}
    >
      <div
        style={{
          position: "relative",
          paddingTop: "56.25%",
          background: "#f3f4f6",
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={a?.title}
          decoding="async"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== FALLBACK_IMG) {
              e.currentTarget.src = FALLBACK_IMG;
            }
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, opacity: 0.7 }}>{a?.source}</div>
        <div style={{ marginTop: 6, fontWeight: 700, lineHeight: 1.25 }}>
          {a?.title}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.6 }}>{a?.time}</div>
      </div>
    </a>
  );
}

function SideList({ items }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((a) => (
        <a
          key={a.id}
          href={a.url}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            padding: 14,
            borderRadius: 14,
            border: "1px solid rgba(0,0,0,1)",
            textDecoration: "none",
            color: "inherit",
            background: "white",
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.7 }}>{a.source}</div>
          <div style={{ marginTop: 4, fontWeight: 600, lineHeight: 1.25 }}>
            {a.title}
          </div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.6 }}>{a.time}</div>
        </a>
      ))}
      <button
        onClick={() => window.open("https://gnews.io", "_blank")}
        style={{
          alignSelf: "start",
          marginTop: 2,
          fontSize: 13,
          padding: "8px 12px",
          borderRadius: 999,
          background: "rgba(0,0,0,05)",
          border: "1px solid rgba(0,0,0,1)",
          cursor: "pointer",
        }}
      >
        Full Coverage →
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
        gap: 22,
      }}
    >
      <div>
        <div
          style={{
            paddingTop: "56.25%",
            background: "rgba(0,0,0,06)",
            borderRadius: 18,
          }}
        />
        <div
          style={{
            height: 14,
            width: 120,
            background: "rgba(0,0,0,06)",
            borderRadius: 6,
            marginTop: 12,
          }}
        />
        <div
          style={{
            height: 18,
            width: "82%",
            background: "rgba(0,0,0,06)",
            borderRadius: 6,
            marginTop: 8,
          }}
        />
        <div
          style={{
            height: 12,
            width: 90,
            background: "rgba(0,0,0,06)",
            borderRadius: 6,
            marginTop: 8,
          }}
        />
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,1)",
            }}
          >
            <div
              style={{
                height: 14,
                width: 110,
                background: "rgba(0,0,0,06)",
                borderRadius: 6,
              }}
            />
            <div
              style={{
                height: 16,
                width: "92%",
                background: "rgba(0,0,0,06)",
                borderRadius: 6,
                marginTop: 8,
              }}
            />
            <div
              style={{
                height: 12,
                width: 80,
                background: "rgba(0,0,0,06)",
                borderRadius: 6,
                marginTop: 8,
              }}
            />
          </div>
        ))}
        <div
          style={{
            height: 34,
            width: 150,
            background: "rgba(0,0,0,06)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
