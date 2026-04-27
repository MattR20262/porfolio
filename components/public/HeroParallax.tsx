"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

interface HeroParallaxProps {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

export default function HeroParallax({
  eyebrow,
  titleLine1,
  titleLine2,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: HeroParallaxProps) {
  const bgRef      = useRef<HTMLImageElement>(null);
  const leftRef    = useRef<HTMLImageElement>(null);
  const rightRef   = useRef<HTMLImageElement>(null);
  const textRef    = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;

      // Background drifts very slowly — pure depth, no zoom
      if (bgRef.current) {
        bgRef.current.style.top = `${y * 0.3}px`;
      }

      // Left panel slides LEFT — exactly like mountain_left
      if (leftRef.current) {
        leftRef.current.style.left = `-${y / 0.7}px`;
      }

      // Right panel slides RIGHT — exactly like mountain_right
      if (rightRef.current) {
        rightRef.current.style.left = `${y / 0.7}px`;
      }

      // Brand text sinks DOWN — exactly like #text in the demo
      if (textRef.current) {
        textRef.current.style.bottom = `-${y * 1.2}px`;
      }

      // Hero content fades and rises — like the man shrinking
      if (contentRef.current) {
        contentRef.current.style.opacity = String(Math.max(0, 1 - y * 0.006));
        contentRef.current.style.transform = `translateY(${y * 0.4}px)`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0e0c09",
      }}
    >
      {/* ── Bottom gradient — exactly like #top::before in the demo ─────── */}
      <div style={{
        content: "''",
        position: "absolute",
        bottom: 0,
        left: 0,
        height: "220px",
        width: "100%",
        background: "linear-gradient(to top, #0e0c09, transparent)",
        zIndex: 1000,
        pointerEvents: "none",
      }} />

      {/* ── BG photo — full bleed, drifts up slowly ──────────────────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={bgRef}
        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />

      {/* Dark overlay so text reads clearly */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "rgba(14,12,9,0.45)",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      {/* ── "Rift." brand text — centered, sinks on scroll ───────────────── */}
      {/* This is the exact equivalent of #text in the mountains demo        */}
      <h2
        ref={textRef}
        aria-hidden="true"
        style={{
          position: "relative",
          zIndex: 5,
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(6rem, 22vw, 18rem)",
          fontWeight: 300,
          color: "#f5f3ef",
          letterSpacing: "0.04em",
          lineHeight: 1,
          userSelect: "none",
          whiteSpace: "nowrap",
          bottom: 0,           /* JS changes this to -${y*1.2}px */
        }}
      >
        Rift<span style={{ color: "#c8924a" }}>.</span>
      </h2>

      {/* ── LEFT photo — slides left on scroll (mountain_left) ───────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={leftRef}
        src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "52%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "right center",
          zIndex: 10,           /* in front of the brand text */
          pointerEvents: "none",
          filter: "brightness(0.8) saturate(0.85)",
        }}
      />

      {/* ── RIGHT photo — slides right on scroll (mountain_right) ────────── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={rightRef}
        src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80"
        alt=""
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: "48%",
          width: "52%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "left center",
          zIndex: 10,           /* in front of the brand text */
          pointerEvents: "none",
          filter: "brightness(0.8) saturate(0.85)",
        }}
      />

      {/* ── Hero content — eyebrow, title, subtitle, CTAs ────────────────── */}
      {/* Positioned at the bottom, fades out as you scroll                  */}
      <div
        ref={contentRef}
        style={{
          position: "absolute",
          bottom: "9%",
          left: "clamp(1.5rem, 8vw, 8rem)",
          right: "clamp(1.5rem, 8vw, 8rem)",
          zIndex: 200,
        }}
      >
        <p
          className="text-eyebrow hero-animate hero-animate-1"
          style={{ marginBottom: "0.6rem" }}
        >
          {eyebrow}
        </p>

        <h1
          className="hero-animate hero-animate-2"
          style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            fontWeight: 300,
            color: "#f5f3ef",
            lineHeight: 1.15,
            marginBottom: "1rem",
            maxWidth: "600px",
          }}
        >
          {titleLine1}
          {titleLine2 && (
            <> <span className="gold-text">{titleLine2}</span></>
          )}
        </h1>

        <div
          className="hero-animate hero-animate-3"
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1.5rem" }}
        >
          <p style={{ color: "#9a9490", fontSize: "0.9rem", maxWidth: "340px", lineHeight: 1.7 }}>
            {subtitle}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/portfolio" className="btn btn-primary">
              {ctaPrimary} <ArrowRight size={14} />
            </Link>
            <Link href="/booking" className="btn btn-outline">
              {ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ─────────────────────────────────────────────── */}
      <a
        href="#categories"
        className="hero-animate hero-animate-5"
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "#6b6560",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.4rem",
          textDecoration: "none",
          zIndex: 300,
        }}
      >
        <span style={{
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: "0.5rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}>
          Scroll
        </span>
        <ChevronDown size={14} />
      </a>
    </section>
  );
}
