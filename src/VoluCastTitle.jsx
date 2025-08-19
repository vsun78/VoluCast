
"use client";
import React from "react";

import VideoText from "./Components/video-text";

export default function VoluCastTitle() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4">
      {/* simple rounded card look (content, not <header>) */}
      <div
        className="rounded-2xl overflow-hidden ring-1 ring-black/5 bg-[#f5f7fa] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
        style={{ height: 220 }}
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
  );
}
