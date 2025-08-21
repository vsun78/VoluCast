import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import VideoText from "./Components/video-text";
import "./LandingPage.css";

import BoatParallax from "./BoatParallax";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    // parallax on the headline
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        y: -180,
        scale: 1.04,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Ffade/slide in login card
    if (loginRef.current) {
      gsap.fromTo(
        loginRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: loginRef.current,
            start: "top 85%",
            end: "top 60%",
            scrub: true,
          },
        }
      );
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <main className="landing-wrap">
      {/* HERO */}
      <section className="landing-section">
        <div className="landing-inner hero-inner">
          <div className="hero-video-wrap" ref={heroRef}>
            <div className="hero-video-card">
              <VideoText
  srcWebm="/VoluCastLoop.webm"
  srcMp4="/VoluCastLoop.mp4"
  poster="/VoluCastPoster.jpg"
  className="w-full h-full"
  fontFamily='-apple-system, system-ui, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif'
  fontWeight={900}
  fontScale={0.82}
  fitWidth={0.96}
  videoScale={0.6}
  videoPosition="50% 56%"
  videoTranslateX={-20}
  videoTranslateY={-25}
>
  VOLUCAST
</VideoText>

              <p className="hero-subtitle">
              <em>Tomorrow’s tonnage, today</em>
            </p>
            </div>
          </div>

          
        </div>
      </section>

      {/* BOAT PARALLAX */}
      <BoatParallax boatSrc="/mca-mmtl-boat.png" />
      {/* buffer so the boat can scroll the entire way */}
      <div className="boat-scroll-buffer" aria-hidden />

      {/* LOGIN (decoy) */}
      <section className="landing-section alt" id="login-section">
        <div className="landing-inner">
          <div className="login-card" ref={loginRef}>
            <h2 className="login-title">Welcome back</h2>
            <p className="login-sub">Demo sign-in (placeholder)</p>

            <form className="login-form" onSubmit={handleLogin}>
              <label className="login-label">
                Email
                <input className="login-input" type="email" placeholder="you@example.com" />
              </label>
              <label className="login-label">
                Password
                <input className="login-input" type="password" placeholder="••••••••" />
              </label>

              <button className="login-btn" type="submit">Sign In</button>
            </form>

            <p className="login-note">
              This is a decoy login. Submitting will route you to the grid bento page.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
