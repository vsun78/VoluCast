
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


export default function BoatParallax({ boatSrc = "/images/mca-mmtl-boat.png" }) {
  const wrapRef = useRef(null);
  const boatRef = useRef(null);
  const midRef = useRef(null);
  const nearRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "max",
          scrub: true,
        },
        defaults: { ease: "none" },
      });

      tl.fromTo(boatRef.current, { xPercent: -50 }, { xPercent: 450 }, 0);


      tl.to(midRef.current,  { xPercent: -6 }, 0);
      tl.to(nearRef.current, { xPercent: -12 }, 0);


      gsap.to(boatRef.current, {
        y: 8,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".boat-wake", {
        opacity: 0.35,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0, 
      }}
    >
      {/* Mid water (lighter) */}
      <svg
        ref={midRef}
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: "-40%",
          bottom: "10vh",
          width: "200%",
          height: "34vh",
          opacity: 0.55,
          filter: "blur(0.2px)",
        }}
      >
        <defs>
          <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b4d5ff" />
            <stop offset="100%" stopColor="#88bfff" />
          </linearGradient>
        </defs>
        <path
          d="M0,240 C160,220 260,280 420,270 C560,260 720,300 860,285 C990,270 1110,295 1200,285 L1200,400 L0,400 Z"
          fill="url(#mid)"
        />
      </svg>

      {/* Near water (darker) */}
      <svg
        ref={nearRef}
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          left: "-50%",
          bottom: 0,
          width: "220%",
          height: "42vh",
          opacity: 0.9,
        }}
      >
        <defs>
          <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8db9ff" />
            <stop offset="100%" stopColor="#5ea0f7" />
          </linearGradient>
        </defs>
        <path
          d="M0,240 C180,230 300,300 460,290 C620,280 800,320 960,305 C1080,293 1140,310 1200,305 L1200,400 L0,400 Z"
          fill="url(#near)"
        />
        <g opacity="0.45">
          <path d="M120,275 q20 -6 40 0" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M410,295 q25 -7 50 0" stroke="#fff" strokeWidth="3" fill="none" />
          <path d="M760,285 q22 -6 44 0" stroke="#fff" strokeWidth="3" fill="none" />
        </g>
      </svg>

      {/* Boat — bigger & responsive */}
      <div
        ref={boatRef}
        style={{
          position: "absolute",
          top: "67vh",
          left: "-25%",
          width: "min(50vw, 560px)",
          transform: "translate3d(0,0,0)",
          filter: "drop-shadow(0 8px 12px rgba(0,0,0,.25))",
        }}
      >
        <img src={boatSrc} alt="" style={{ display: "block", width: "100%" }} />
        <svg
          className="boat-wake"
          viewBox="0 0 400 80"
          style={{ position: "absolute", left: "14%", top: "74%", width: "70%" }}
        >
          <path
            d="M0,40 C80,20 160,20 240,40 C300,52 350,52 400,40"
            stroke="white"
            strokeWidth="6"
            fill="none"
            opacity="0.25"
          />
        </svg>
      </div>
    </div>
  );
}
