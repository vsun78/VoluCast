
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import VoluCastTitle from "./VoluCastTitle"; // new content (video text) component
import ScrollFloat from "./ScrollFloat";      // provided animation (3rd-party style)
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const handleLogin = (e) => {
    e.preventDefault();
    // Decoy login success → go to Grid page
    navigate("/dashboard");
  };

  return (
    <main className="landing-wrap" ref={scrollRef}>
      {/* SECTION 1 — hero text and animated headline */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <ScrollFloat
            scrollContainerRef={scrollRef}
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
          >
            Predictive AI for Material Volume
          </ScrollFloat>

          {/* VoluCast video text (moved from header; now content) */}
          <VoluCastTitle />
          <div className="scroll-hint">Scroll to continue ↓</div>
        </div>
      </section>

      {/* SECTION 2 — decoy login block */}
      <section className="landing-login" id="login">
        <div className="login-card">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-sub">Demo sign-in (decoy)</p>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-label">
              Email
              <input className="login-input" type="email" placeholder="you@example.com" />
            </label>
            <label className="login-label">
              Password
              <input className="login-input" type="password" placeholder="••••••••" />
            </label>

            <button className="login-btn" type="submit">
              Sign In
            </button>
          </form>

          <p className="login-note">
            This is a placeholder. On submit, you’ll be routed to the grid bento page.
          </p>
        </div>
      </section>
    </main>
  );
}
