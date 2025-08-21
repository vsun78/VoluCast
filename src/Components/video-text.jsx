// video-text.jsx
"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function VideoText({
  // Video sources (pass both for fastest start; WebM first for Chrome/FF)
  srcWebm,                 // e.g., "/VoluCastLoop.webm"
  srcMp4,                  // e.g., "/VoluCastLoop.mp4"
  src,                     // legacy single-source (mp4); kept for backward compat
  poster,                  // e.g., "/VoluCastPoster.jpg"

  // Text + layout
  children,
  className = "",
  fitWidth = 0.95,         // fraction of container width the text may occupy
  fontScale = 0.55,        // fraction of container height used for font sizing
  fontWeight = 900,
  fontFamily = "Inter, ui-sans-serif",

  // Video placement
  videoScale = 1.0,        // extra scale on top of min cover
  videoPosition = "50% 50%",
  videoTranslateX = 0,     // % nudge after sizing
  videoTranslateY = 0,     // % nudge after sizing

  // Playback flags
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",

  // Wrapper element
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

  // Resize -> refit + recompute min cover scale
  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(() => {
      sizeToFit();
      computeMinScale();
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Refit when content/params change
  useLayoutEffect(() => {
    sizeToFit();
  }, [content, fontScale, fitWidth]);

  // After metadata loads, we know intrinsic video size -> compute cover scale
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
  const hasWebm = !!srcWebm;
  const hasMp4 = !!srcMp4 || !!src;

  // Choose mp4 source (prefer explicit prop, fallback to legacy `src`)
  const mp4Src = srcMp4 || src;

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

        <foreignObject
          x="0"
          y="0"
          width="100%"
          height="100%"
          clipPath={`url(#${clipIdRef.current})`}
        >
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
                // tiny paint hint helps some browsers
                willChange: "transform",
              }}
              // playback
              autoPlay={autoPlay}
              muted={muted}
              loop={loop}
              preload={preload}
              playsInline
              poster={poster}
              // kickstart once the browser says it's ready to play through
              onCanPlayThrough={() => {
                try {
                  videoRef.current?.play?.();
                } catch {}
              }}
              onWaiting={() => console.warn("Video waiting (buffering)")}
              onStalled={() => console.warn("Video stalled (network)")}
              onError={(e) => console.error("Video error", e.currentTarget.error)}
            >
              {hasWebm && <source src={srcWebm} type="video/webm" />}
              {hasMp4 && <source src={mp4Src} type="video/mp4" />}
            </video>
          </div>
        </foreignObject>
      </svg>
    </Component>
  );
}
