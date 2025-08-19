
"use client";
import React from "react";
import VideoText from "./Components/video-text";

export default function VoluCastTitle() {
  return (
    <div className="volucast-wrap">
      <div className="volucast-card">
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
