
import React from "react";

export default function NewsPreview({ article }) {
  if (!article) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,.1)",
        background: "white",
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Left half = image */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <img
          src={article.imageUrl}
          alt={article.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Right half = story text */}
      <div
        style={{
          flex: 1,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 0,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7 }}>{article.source}</div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            lineHeight: 1.3,
            marginTop: 4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {article.title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
          {article.time}
        </div>
      </div>
    </div>
  );
}
