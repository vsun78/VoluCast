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

  useEffect(() => {
    if (external) return;

    async function loadNews() {
      try {
        const resp = await fetch(
          `https://gnews.io/api/v4/top-headlines?token=${process.env.REACT_APP_NEWS_API_KEY}&lang=en&country=ca&max=8`
        );
        const data = await resp.json();
        if (data.articles) {
          const mapped = data.articles.map((a, i) => ({
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
            imageUrl:
              a.image || "https://via.placeholder.com/800x450?text=No+Image",
          }));
          setArticles(mapped);
        }
      } catch (err) {
        console.error("News fetch error:", err);
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
        boxShadow: "0 22px 70px rgba(0,0,0,.18)",
        border: "1px solid rgba(0,0,0,.08)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Scroll area only */}
      <div style={{ overflowY: "auto", overflowX: "hidden", padding: 18 }}>
        {!articles ? (
          <Skeleton />
        ) : (
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

function Row({ group }) {
  const [feature, ...rest] = group;
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
        border: "1px solid rgba(0,0,0,.1)",
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
            border: "1px solid rgba(0,0,0,.1)",
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
          background: "rgba(0,0,0,.05)",
          border: "1px solid rgba(0,0,0,.1)",
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
            background: "rgba(0,0,0,.06)",
            borderRadius: 18,
          }}
        />
        <div
          style={{
            height: 14,
            width: 120,
            background: "rgba(0,0,0,.06)",
            borderRadius: 6,
            marginTop: 12,
          }}
        />
        <div
          style={{
            height: 18,
            width: "82%",
            background: "rgba(0,0,0,.06)",
            borderRadius: 6,
            marginTop: 8,
          }}
        />
        <div
          style={{
            height: 12,
            width: 90,
            background: "rgba(0,0,0,.06)",
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
              border: "1px solid rgba(0,0,0,.1)",
            }}
          >
            <div
              style={{
                height: 14,
                width: 110,
                background: "rgba(0,0,0,.06)",
                borderRadius: 6,
              }}
            />
            <div
              style={{
                height: 16,
                width: "92%",
                background: "rgba(0,0,0,.06)",
                borderRadius: 6,
                marginTop: 8,
              }}
            />
            <div
              style={{
                height: 12,
                width: 80,
                background: "rgba(0,0,0,.06)",
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
            background: "rgba(0,0,0,.06)",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  );
}
