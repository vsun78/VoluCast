
import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import VoluCastTitle from "./VoluCastTitle";
import ScrollFloat from "./ScrollFloat";
import "./LandingPage.css";

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();

  const voluLayerRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    // Parallax for VoluCast block
    if (voluLayerRef.current) {
      gsap.to(voluLayerRef.current, {
        y: -200,
        scale: 1.05,
        opacity: 1,
        ease: "none",
        scrollTrigger: {
          trigger: voluLayerRef.current,
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
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
          >
            Predictive AI for Material Volume
          </ScrollFloat>

          <div className="volu-parallax" ref={voluLayerRef}>
            <VoluCastTitle />
          </div>
        </div>
      </section>

      {/* LOGIN */}
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
