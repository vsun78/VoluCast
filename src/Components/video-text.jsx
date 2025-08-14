// VideoText (SVG + clipPath, no glyph stretching)
// - Dynamically sizes the text to fit container width WITHOUT skewing
// - Video fully fills the letters; you can crop/zoom with `videoScale`
// - Works across modern browsers

"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function VideoText({
  src,
  children,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",

  // How much of the container width the word should occupy (0–1)
  fitWidth = 0.72,

  // Starting font size = fontScale * container height; we then shrink to fit width
  fontScale = 0.6,

  // Text styling
  fontWeight = 900,
  fontFamily = "Inter, ui-sans-serif",

  // NEW: crop/zoom and focal point for the video inside the letters
  videoScale = 1.2,              // 1 = no zoom; >1 zooms in (crops letterbox bars) // i think this is overrided
  videoPosition = "50% 50%",     // CSS object-position (e.g., "50% 45%")

  as: Component = "div",
}) {
  const content = React.Children.toArray(children).join("");

  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const textRef = useRef(null);

  const [fontPx, setFontPx] = useState(24); // updated after mount

  // React to container size changes
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      sizeToFit();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    sizeToFit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  function sizeToFit() {
    const el = wrapRef.current;
    const svg = svgRef.current;
    const text = textRef.current;
    if (!el || !svg || !text) return;

    const { width: cw, height: ch } = el.getBoundingClientRect();
    if (!cw || !ch) return;

    // Start from container height
    let f = Math.max(8, Math.floor(ch * fontScale));

    const measure = () => {
      text.setAttribute("font-size", String(f));
      const { width: tw } = text.getBBox(); // width in current SVG units
      return tw;
    };

    // Shrink font until it fits desired width
    const target = cw * fitWidth;
    let tw = measure();
    let guard = 8;
    while (guard-- > 0 && tw > target && f > 6) {
      f = Math.floor(f * (target / tw) * 0.98);
      tw = measure();
    }

    setFontPx(Math.max(6, f));
  }

  return (
    <Component ref={wrapRef} className={`relative w-full h-full ${className}`}>
      {/* Map SVG coordinates directly to the element box */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1000 250"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="video-text-clip">
            <text
              ref={textRef}
              x="500"
              y="125"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily={fontFamily}
              fontWeight={fontWeight}
              fontSize={fontPx}
            >
              {content}
            </text>
          </clipPath>
        </defs>

        {/* Video fills the box and is clipped to the text */}
        <foreignObject x="0" y="0" width="100%" height="100%" clipPath="url(#video-text-clip)">
          <video
            className="w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: videoPosition,     // focal point
              display: "block",
              transform: `scale(${videoScale})`, // zoom/crop to hide letterboxing
              transformOrigin: "center",
            }}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            preload={preload}
            playsInline
          >
            <source src={src} type="video/mp4" />
          </video>
        </foreignObject>
      </svg>
    </Component>
  );
}
