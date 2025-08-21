// src/Components/video-text.jsx
"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function VideoText({
  // video sources (keep names in /public exactly as below)
  srcWebm = "/VoluCastLoop.webm",
  srcMp4  = "/VoluCastLoop.mp4",
  poster  = "/VoluCastPoster.jpg",

  // text + layout
  children,
  className = "",
  fitWidth = 0.96,
  fontScale = 0.82,
  fontWeight = 900,
  fontFamily = `-apple-system, system-ui, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif`,

  // video placement
  videoScale = 0.6,
  videoPosition = "50% 56%",
  videoTranslateX = -20,
  videoTranslateY = -25,

  // playback flags
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",

  as: Component = "div",
}) {
  const content = React.Children.toArray(children).join("");

  const wrapRef  = useRef(null);
  const svgRef   = useRef(null);
  const textRef  = useRef(null);
  const videoRef = useRef(null);

  const [fontPx, setFontPx] = useState(24);
  const [minCoverScale, setMinCoverScale] = useState(1);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");

  const clipIdRef = useRef(`vt-clip-${Math.random().toString(36).slice(2)}`);

  // resize => refit text + recompute cover scale
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
    const el = wrapRef.current, v = videoRef.current;
    if (!el || !v || !v.videoWidth || !v.videoHeight) return;
    const cw = el.clientWidth || 0, ch = el.clientHeight || 0;
    const scaleToCover = Math.max(cw / v.videoWidth, ch / v.videoHeight);
    setMinCoverScale(scaleToCover);
  }

  function sizeToFit() {
    const el = wrapRef.current, svg = svgRef.current, text = textRef.current;
    if (!el || !svg || !text) return;

    const cw = el.clientWidth || 0, ch = el.clientHeight || 0;
    if (!cw || !ch) return;

    const vbw = (svg.viewBox && svg.viewBox.baseVal.width)  || 1200;
    const vbh = (svg.viewBox && svg.viewBox.baseVal.height) || 600;

    const pxToVbX = vbw / (svg.clientWidth  || cw);
    const pxToVbY = vbh / (svg.clientHeight || ch);

    let f = Math.max(8, Math.floor(ch * fontScale * pxToVbY));
    text.setAttribute("font-size", String(f));

    const targetW = cw * fitWidth * pxToVbX;
    let { width: tw } = text.getBBox();
    if (tw > targetW) {
      f = Math.max(6, Math.floor(f * (targetW / tw)));
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

        {/* VIDEO layer (clipped to the text) */}
        <foreignObject x="0" y="0" width="100%" height="100%" clipPath={`url(#${clipIdRef.current})`}>
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
            <video
              ref={videoRef}
              className="w-full h-full"
              style={{
                objectFit: "cover",
                objectPosition: videoPosition,
                display: ready ? "block" : "none",
                transform: `translate(${videoTranslateX}%, ${videoTranslateY}%) scale(${effectiveScale})`,
                transformOrigin: "50% 50%",
                willChange: "transform",
              }}
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              preload={preload}
              playsInline
              poster={poster}
              onCanPlayThrough={() => {
                setReady(true);
                try { videoRef.current?.play?.(); } catch {}
              }}
              onError={(e) => {
                console.error("Video error:", e.currentTarget?.error);
                setErr("Video failed to load");
                setReady(false);
              }}
            >
              {/* Order matters: WebM first for Chromium/Firefox */}
              <source src={srcWebm} type="video/webm" />
              <source src={srcMp4}  type="video/mp4" />
            </video>
          </div>
        </foreignObject>

        {/* Fallback solid text while loading/error */}
        {!ready && (
          <text
            x="600"
            y="300"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily={fontFamily}
            fontWeight={fontWeight}
            fontSize={fontPx}
            fill="#111"
          >
            {content}
          </text>
        )}
      </svg>

      
    </Component>
  );
}
