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
  fitWidth = 0.95,
  fontScale = 0.55,
  fontWeight = 900,
  fontFamily = "Inter, ui-sans-serif",
  videoScale = 1.0,
  videoPosition = "50% 50%",
  videoTranslateX = 0,
  videoTranslateY = 0,
  as: Component = "div",
}) {
  const content = React.Children.toArray(children).join("");

  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const textRef = useRef(null);
  const videoRef = useRef(null);

  const [fontPx, setFontPx] = useState(24);
  const [minCoverScale, setMinCoverScale] = useState(1);

  const clipIdRef = useRef(`video-text-clip-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      sizeToFit();
      computeMinScale();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    sizeToFit();
  }, [content, fontScale, fitWidth]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => computeMinScale();
    v.addEventListener("loadedmetadata", onMeta);
    return () => v.removeEventListener("loadedmetadata", onMeta);
  }, []);

  function computeMinScale() {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v || !v.videoWidth || !v.videoHeight) return;

    const cw = el.clientWidth || 0;
    const ch = el.clientHeight || 0;
    const vw = v.videoWidth;
    const vh = v.videoHeight;

    if (!cw || !ch || !vw || !vh) return;

    const scaleToCover = Math.max(cw / vw, ch / vh);
    setMinCoverScale(scaleToCover);
  }

  function sizeToFit() {
    const el = wrapRef.current;
    const svg = svgRef.current;
    const text = textRef.current;
    if (!el || !svg || !text) return;

    const rect = el.getBoundingClientRect();
    const cw = rect.width || 0;
    const ch = rect.height || 0;
    if (!cw || !ch) return;

    const vbw = (svg.viewBox && svg.viewBox.baseVal.width) || 1200;
    const vbh = (svg.viewBox && svg.viewBox.baseVal.height) || 600;

    const clientW = svg.clientWidth || cw;
    const clientH = svg.clientHeight || ch;

    const pxToVbX = vbw / clientW;
    const pxToVbY = vbh / clientH;

    let f = Math.max(8, Math.floor(ch * fontScale * pxToVbY));
    text.setAttribute("font-size", String(f));

    const targetW = cw * fitWidth * pxToVbX;
    let { width: tw } = text.getBBox();

    if (tw > targetW) {
      const k = targetW / tw;
      f = Math.max(6, Math.floor(f * k));
      text.setAttribute("font-size", String(f));
    }

    setFontPx(f);
  }

  const effectiveScale = Math.max(videoScale, minCoverScale);

  return (
    <Component ref={wrapRef} className={`relative w-full h-full ${className}`}>
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipIdRef.current}>
            <text
              ref={textRef}
              x="600"
              y="300"
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

        <foreignObject x="0" y="0" width="100%" height="100%" clipPath={`url(#${clipIdRef.current})`}>
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <video
              ref={videoRef}
              className="w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: videoPosition,
                display: "block",
                transform: `translate(${videoTranslateX}%, ${videoTranslateY}%) scale(${effectiveScale})`,
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
