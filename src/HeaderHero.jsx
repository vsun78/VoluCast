// src/HeaderHero.jsx
"use client";

import React from "react";
import VideoText from "./Components/video-text";

export default function HeaderHero() {
  return (
    <header className="w-full bg-[#d1d5db]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-1">
        {/* Force a very small header height */}
        <div
          style={{ height: 300, minHeight: 300 }}          // <- inline override
          className="relative !h-[36px] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-[#f5f7fa]"
        >
          <VideoText
            src="/VoluCastLoop.mp4"
            className="w-full h-full"
            fontFamily="'Inter', ui-sans-serif"
            fontWeight={900}
            fitWidth={0.62}
            fontScale={0.25}
            videoScale={1}
            videoPosition="50% 45%"
          >
            VoluCast
          </VideoText>
        </div>
      </div>
    </header>
  );
}
