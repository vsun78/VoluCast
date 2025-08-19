
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
  fitWidth = 0.72,
  fontScale = 0.6,
  fontWeight = 900,
  fontFamily = "Inter, ui-sans-serif",
  videoScale = 1.2,
  videoPosition = "50% 50%",
  as: Component = "div",
}) {
  const content = React.Children.toArray(children).join("");
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const [fontPx, setFontPx] = useState(24);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => sizeToFit());
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    sizeToFit();
  }, [content]);

  function sizeToFit() {
    const el = wrapRef.current;
    const svg = svgRef.current;
    const text = textRef.current;
    if (!el || !svg || !text) return;

    const { width: cw, height: ch } = el.getBoundingClientRect();
    if (!cw || !ch) return;

    let f = Math.max(8, Math.floor(ch * fontScale));
    const measure = () => {
      text.setAttribute("font-size", String(f));
      const { width: tw } = text.getBBox();
      return tw;
    };
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
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        /* Increased height to avoid clipping */
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="video-text-clip">
            <text
              ref={textRef}
              x="600"
              y="250" 
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
        <foreignObject x="0" y="0" width="100%" height="100%" clipPath="url(#video-text-clip)">
          <video
            className="w-full h-full"
            style={{
              objectFit: "cover",
              objectPosition: videoPosition,
              display: "block",
              transform: `scale(${videoScale})`,
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
