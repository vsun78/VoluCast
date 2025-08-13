// Compact, light-grey header with video-filled word (no skew)

"use client";

import React from "react";
import VideoText from "./Components/video-text";

export default function HeaderHero() {
  return (
    <header className="w-full bg-[#f5f7fa]">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-2">
        {/* MUCH smaller banner heights */}
        <div className="relative h-[56px] sm:h-[64px] md:h-[72px] rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-[#f5f7fa]">
          <VideoText
            src="/VoluCastLoop.mp4"
            className="w-full h-full"
            fontFamily="'Inter', ui-sans-serif"
            fontWeight={900}
            // keep the word narrower and smaller (no skew)
            fitWidth={0.62}       // 62% of banner width
            fontScale={0.58}      // starting size; auto-shrinks to fit width
            // crop/zoom + focal point to remove black bars in the footage
            videoScale={1.35}     // increase if you still see letterbox edges
            videoPosition="50% 45%"
          >
            VoluCast
          </VideoText>
        </div>
      </div>
    </header>
  );
}
