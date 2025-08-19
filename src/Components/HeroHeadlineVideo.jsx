
"use client";
import React from "react";
import VideoText from "./Components/video-text";

export default function HeroHeadlineVideo() {
  return (
    <div className="hero-video-wrap">
      <div className="hero-video-card">
        <VideoText
          src="/VoluCastLoop.mp4"
          className="w-full h-full"
          fontFamily="'Inter', ui-sans-serif"
          fontWeight={900}
          /* Wider phrase → let it occupy most of the width */
          fitWidth={0.92}
          /* Size relative to container height; tweak to taste */
          fontScale={0.26}
          /* Use 1 so the whole video texture shows inside letters */
          videoScale={1}
          videoPosition="50% 45%"
        >
          Predictive AI for Material Volume
        </VideoText>
      </div>
    </div>
  );
}
