import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import VideoText from "./Components/video-text";
import "./LandingPage.css";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    // Parallax on the headline
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

    // Login card reveal
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
        <div className="landing-inner">
          <div className="hero-video-wrap" ref={heroRef}>
            <div className="hero-video-card">
              <VideoText
                src="/VoluCastLoop.mp4"
                className="w-full h-full"
                fontFamily="'Inter', ui-sans-serif"
                fontWeight={900}
                fitWidth={0.92}
                fontScale={0.26}
                videoScale={1}
                videoPosition="50% 45%"
              >
                Predictive AI for Material Volume
              </VideoText>
            </div>
          </div>
        </div>
      </section>

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
