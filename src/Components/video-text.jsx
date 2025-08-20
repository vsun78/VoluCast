"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * VideoText (with precise centering controls)
 * - fontScale: fraction of container HEIGHT for text sizing
 * - fitWidth:  max fraction of container WIDTH for text width cap
 * - videoScale: zoom the video (keep >= 1 to avoid empty areas)
 * - videoPosition: fallback object-position (may be ignored in some browsers inside foreignObject)
 * - videoTranslateX / videoTranslateY: percent-based nudges AFTER sizing (reliable everywhere)
 */
export default function VideoText({
  src,
  children,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",
  fitWidth = 0.95,
  fontScale = 0.55,
  fontWeight = 900,
  fontFamily = "Inter, ui-sans-serif",
  videoScale = 1.0,
  videoPosition = "50% 50%",
  videoTranslateX = 0,   // % of element width (positive = right)
  videoTranslateY = 0,   // % of element height (positive = down)
  as: Component = "div",
}) {
  const content = React.Children.toArray(children).join("");
  const wrapRef = useRef(null);
  const svgRef  = useRef(null);
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
  }, [content, fontScale, fitWidth]);

  function sizeToFit() {
    const el   = wrapRef.current;
    const svg  = svgRef.current;
    const text = textRef.current;
    if (!el || !svg || !text) return;

    const { width: cw, height: ch } = el.getBoundingClientRect();
    if (!cw || !ch) return;

    // Convert CSS px -> SVG viewBox units
    const vbw = (svg.viewBox && svg.viewBox.baseVal.width)  || 1200;
    const vbh = (svg.viewBox && svg.viewBox.baseVal.height) || 600;
    const pxToVbX = vbw / svg.clientWidth;
    const pxToVbY = vbh / svg.clientHeight;

    // Start from HEIGHT (so fontScale matters)
    let f = Math.max(8, Math.floor(ch * fontScale * pxToVbY));
    text.setAttribute("font-size", String(f));

    // Respect width cap
    const targetW = cw * fitWidth * pxToVbX;
    let { width: tw } = text.getBBox();
    if (tw > targetW) {
      const k = targetW / tw;
      f = Math.max(6, Math.floor(f * k));
      text.setAttribute("font-size", String(f));
    }

    setFontPx(f);
  }

  return (
    <Component ref={wrapRef} className={`relative w-full h-full ${className}`}>
      {/* keep whatever viewBox you currently use */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="video-text-clip">
            <text
              ref={textRef}
              x="600"
              y="300"                 /* center of 600-high viewBox */
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
          {/* wrapper to apply transforms reliably */}
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <video
              className="w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: videoPosition, // may be ignored in some browsers
                display: "block",
                transform: `translate(${videoTranslateX}%, ${videoTranslateY}%) scale(${videoScale})`,
                transformOrigin: "50% 50%",
              }}
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              preload={preload}
              playsInline
            >
              <source src={src} type="video/mp4" />
            </video>
          </div>
        </foreignObject>
      </svg>
    </Component>
  );
}
