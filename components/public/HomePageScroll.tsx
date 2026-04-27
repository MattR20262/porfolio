"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image: string | null;
}
interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role_or_event: string | null;
}
interface Props {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  brandStatement: string;
  aboutName: string;
  projects: Project[];
  testimonials: Testimonial[];
  bgImage: string;
  leftImage: string;
  rightImage: string;
}

/* ─── Static data ─────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: "Events",     slug: "events",     desc: "Parties, milestones & celebrations" },
  { label: "Weddings",   slug: "weddings",   desc: "Candid full-day film coverage" },
  { label: "Commercial", slug: "commercial", desc: "Brands, campaigns & product" },
  { label: "Corporate",  slug: "corporate",  desc: "Conferences, headshots & launches" },
  { label: "Portraits",  slug: "portraits",  desc: "Authentic film-inspired sessions" },
  { label: "Pre-Ball",   slug: "preball",    desc: "Formals, debs & group shoots" },
];

// Fallback featured work shown when no DB projects exist yet
const DEMO_FEATURED = [
  { id: "d1", title: "NYE Gala — Crown Perth",         slug: "nye-gala-crown-perth",       category: "Events",     cover_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=75" },
  { id: "d2", title: "Garden Wedding — Swan Valley",   slug: "garden-wedding-swan-valley", category: "Weddings",   cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75" },
  { id: "d3", title: "Toyota — Brand Campaign",        slug: "toyota-brand-campaign",      category: "Commercial", cover_image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=75" },
];

/* ─── Scroll math helpers ─────────────────────────────────────────── */
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
/** Map `progress` from [inAt…peakAt] → [0…1], then stays 1 until [peakAt…outAt] → [1…0]. */
function sectionOpacity(p: number, inAt: number, peakAt: number, outAt: number) {
  if (p <= inAt)   return 0;
  if (p <= peakAt) return clamp((p - inAt)   / (peakAt - inAt), 0, 1);
  if (p <= outAt)  return clamp((outAt - p)  / (outAt - peakAt), 0, 1);
  return 0;
}

/* ─── Total scroll "screens" ──────────────────────────────────────── */
//  0 → 1   hero + panels opening
//  1 → 2   categories
//  2 → 3   brand statement
//  3 → 4   featured work
//  4 → 5   testimonials
//  5 → 6   booking CTA
const TOTAL_SCREENS = 6;

/* ════════════════════════════════════════════════════════════════════ */
export default function HomePageScroll({
  eyebrow, titleLine1, titleLine2, subtitle, ctaPrimary, ctaSecondary,
  brandStatement, aboutName, projects, testimonials,
  bgImage, leftImage, rightImage,
}: Props) {

  /* ─── Refs ──────────────────────────────────────────────────────── */
  const bgRef          = useRef<HTMLImageElement>(null);
  const leftRef        = useRef<HTMLImageElement>(null);
  const rightRef       = useRef<HTMLImageElement>(null);
  const riftRef        = useRef<HTMLHeadingElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const scrollHintRef  = useRef<HTMLDivElement>(null);

  // Content scene refs
  const catRef         = useRef<HTMLDivElement>(null);
  const brandRef       = useRef<HTMLDivElement>(null);
  const worksRef       = useRef<HTMLDivElement>(null);
  const testiRef       = useRef<HTMLDivElement>(null);
  const ctaRef         = useRef<HTMLDivElement>(null);

  /* ─── Page-level scroll settings ───────────────────────────────── */
  useEffect(() => {
    const html = document.documentElement;
    // scroll-behavior: smooth fights scroll-jacked RAF animations → disable it
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior    = "auto";
    // overscroll-behavior: none kills macOS rubber-band bounce on the spacer
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.scrollBehavior    = prevBehavior;
      html.style.overscrollBehavior = "";
    };
  }, []);

  /* ─── Scroll driver (RAF-throttled for silky 60 fps) ───────────── */
  useEffect(() => {
    let rafId = 0;

    function update() {
      const y  = window.scrollY;
      const vh = window.innerHeight;
      const p  = y / vh; // progress in "screens"

      /* ── Panels split open (screen 0 → 1) ─────────────────────── */
      const open = clamp(p, 0, 1);

      // Only write transform / opacity — compositor-only, no layout reflow
      // Cap parallax drift so the bg image never leaves the viewport
      const parallaxY = Math.min(y * 0.12, vh * 0.07);
      if (bgRef.current)    bgRef.current.style.transform          = `translateY(${parallaxY}px)`;
      if (leftRef.current)  leftRef.current.style.transform        = `translateX(${-open * 110}%)`;
      if (rightRef.current) rightRef.current.style.transform       = `translateX(${open * 110}%)`;

      /* ── Overlaid text / copy fade ───────────────────────────────── */
      if (riftRef.current)        riftRef.current.style.opacity        = String(clamp(1 - p * 2.5, 0, 1));
      if (heroContentRef.current) heroContentRef.current.style.opacity = String(clamp(1 - p * 3,   0, 1));
      if (scrollHintRef.current)  scrollHintRef.current.style.opacity  = String(clamp(1 - p * 4,   0, 1));

      /* ── Content scenes — opacity + pointer-events ──────────────── */
      type SceneRow = [React.RefObject<HTMLDivElement | null>, number, number, number];
      const scenes: SceneRow[] = [
        [catRef,   0.6,  1.2,  2.0],
        [brandRef, 2.0,  2.5,  3.0],
        [worksRef, 3.0,  3.5,  4.0],
        [testiRef, 4.0,  4.5,  5.0],
        [ctaRef,   5.0,  5.5,  7.0],
      ];
      for (const [ref, inAt, peakAt, outAt] of scenes) {
        const el = ref.current;
        if (!el) continue;
        const o = sectionOpacity(p, inAt, peakAt, outAt);
        el.style.opacity       = String(o);
        // Only accept pointer events when the scene is meaningfully visible
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
    }

    function onScroll() {
      // Ticking pattern: queue at most one RAF per frame
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // run once on mount to set initial state
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  /* ─── Shared scene container style ──────────────────────────────── */
  const sceneBase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "5rem clamp(1.5rem, 8vw, 8rem) 3rem",
    opacity: 0,
    willChange: "opacity",   // compositor layer — no layout cost
    pointerEvents: "none",
  };

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── Responsive styles for scene grids ────────────────────────── */}
      <style>{`
        /* Fixed stage fills the dynamic viewport on mobile (address bar aware) */
        .hs-stage {
          position: fixed; top: 0; left: 0;
          width: 100%; height: 100vh; height: 100dvh;
          overflow: hidden; background: #0e0c09; z-index: 1;
        }
        /* Scroll spacer matches the stage height unit */
        .hs-spacer { height: calc(${TOTAL_SCREENS} * 100vh); height: calc(${TOTAL_SCREENS} * 100dvh); }

        /* Category grid: 3 col → 2 col → 1 col */
        .hs-cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem; max-width: 780px; width: 100%;
        }
        @media (max-width: 700px) { .hs-cat-grid { grid-template-columns: repeat(2, 1fr); gap: 0.5rem; } }
        @media (max-width: 420px) { .hs-cat-grid { grid-template-columns: 1fr; } }

        /* Featured work grid: 3 col → 1 col stacked on mobile */
        .hs-work-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem; max-width: 840px; width: 100%;
        }
        @media (max-width: 700px) { .hs-work-grid { grid-template-columns: 1fr; max-width: 340px; } }

        /* Testimonial grid */
        .hs-testi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1.25rem; max-width: 800px; width: 100%;
        }
        @media (max-width: 500px) { .hs-testi-grid { grid-template-columns: 1fr; } }

        /* Hide multi-card layouts on very small screens — show just the CTA */
        @media (max-width: 380px) {
          .hs-cat-grid, .hs-work-grid { display: none; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════
          Fixed stage — pinned to viewport, always in view
          ══════════════════════════════════════════════════════════════ */}
      <div className="hs-stage">

        {/* ── Background photo (drifts up slowly) ─────────────────── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={bgRef}
          src={bgImage}
          alt="" aria-hidden="true"
          style={{
            position: "absolute",
            top: "-7.5%", left: 0,   // pre-offset so translateY has room to drift
            width: "100%", height: "115%",
            objectFit: "cover",
            opacity: 0.35,
            pointerEvents: "none",
            willChange: "transform",
          }}
        />

        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(14,12,9,0.55)",
          zIndex: 1, pointerEvents: "none",
        }} />

        {/* ════════════════════════════════════════════════════════════
            CONTENT SCENES — z:5, behind panels
            Revealed as panels slide apart
            ════════════════════════════════════════════════════════════ */}
        <div style={{ position: "absolute", inset: 0, zIndex: 5 }}>

          {/* ── Scene 1: What I Shoot ─────────────────────────────── */}
          <div ref={catRef} style={sceneBase}>
            <p className="section-label" style={{ marginBottom: "0.75rem" }}>What I Shoot</p>
            <h2
              className="text-heading"
              style={{ textAlign: "center", marginBottom: "2.5rem" }}
            >
              Whatever the occasion.<br />Whatever the energy.
            </h2>
            <div className="hs-cat-grid">
              {CATEGORIES.map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`/portfolio?category=${cat.slug}`}
                  className="service-card"
                  style={{ display: "block", textDecoration: "none", padding: "1rem 1.25rem", }}
                >
                  <p style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    fontSize: "0.55rem", fontWeight: 600,
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "#c8924a", marginBottom: "0.4rem",
                  }}>0{i + 1}</p>
                  <h3 style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                    fontSize: "1.15rem", fontWeight: 300,
                    color: "#f5f3ef", marginBottom: "0.2rem",
                  }}>{cat.label}</h3>
                  <p style={{ color: "#6b6560", fontSize: "0.75rem" }}>{cat.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Scene 2: Brand statement ──────────────────────────── */}
          <div ref={brandRef} style={sceneBase}>
            <blockquote
              className="text-heading gold-text"
              style={{ maxWidth: "700px", fontStyle: "italic", textAlign: "center", lineHeight: 1.3 }}
            >
              &ldquo;{brandStatement}&rdquo;
            </blockquote>
            <p style={{
              marginTop: "2rem",
              color: "#6b6560",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}>
              — {aboutName}
            </p>
          </div>

          {/* ── Scene 3: Featured work ────────────────────────────── */}
          <div ref={worksRef} style={sceneBase}>
            <p className="section-label" style={{ marginBottom: "0.75rem" }}>Selected Work</p>
            <h2 className="text-heading" style={{ textAlign: "center", marginBottom: "2rem" }}>
              Featured Projects
            </h2>
            {(() => {
              // Use real DB projects, fall back to demo cards so the scene is never empty
              const display = projects.length > 0 ? projects.slice(0, 3) : DEMO_FEATURED;
              return (
                <>
                  <div className="hs-work-grid">
                    {display.map((project) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/${project.slug}`}
                        className="card-work"
                        style={{ display: "block" }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.cover_image ?? ""}
                          alt={project.title}
                          loading="lazy"
                        />
                        <div className="card-work-overlay" />
                        <div className="card-work-info">
                          <p className="text-eyebrow">{project.category}</p>
                          <h3 style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                            fontSize: "1.05rem", fontWeight: 300,
                            color: "#f5f3ef", marginTop: "0.2rem",
                          }}>{project.title}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/portfolio" className="btn btn-ghost" style={{ marginTop: "1.5rem" }}>
                    View All <ArrowRight size={13} />
                  </Link>
                </>
              );
            })()}
          </div>

          {/* ── Scene 4: Testimonials ─────────────────────────────── */}
          <div ref={testiRef} style={sceneBase}>
            <p className="section-label" style={{ marginBottom: "0.75rem" }}>Client Words</p>
            <h2 className="text-heading" style={{ textAlign: "center", marginBottom: "2rem" }}>
              What They Say
            </h2>
            {testimonials.length > 0 ? (
              <div className="hs-testi-grid">
                {testimonials.slice(0, 3).map((t) => (
                  <div key={t.id} className="testimonial-card">
                    <p style={{
                      color: "#c8c8c8", fontSize: "0.88rem",
                      lineHeight: 1.8, fontStyle: "italic",
                      marginBottom: "1rem",
                    }}>{t.quote}</p>
                    <p style={{
                      fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                      fontSize: "1rem", color: "#f5f3ef",
                    }}>{t.name}</p>
                    {t.role_or_event && (
                      <p style={{ color: "#6b6b6b", fontSize: "0.7rem", marginTop: "0.2rem" }}>
                        {t.role_or_event}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#6b6560" }}>No testimonials yet.</p>
            )}
          </div>

          {/* ── Scene 5: Booking CTA ──────────────────────────────── */}
          <div ref={ctaRef} style={sceneBase}>
            <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>
              Let&apos;s Work Together
            </p>
            <h2
              className="text-heading"
              style={{ marginBottom: "1rem", maxWidth: "520px", textAlign: "center" }}
            >
              Got a Date?<br />Let&apos;s Lock It In.
            </h2>
            <p style={{
              color: "#6b6560",
              maxWidth: "360px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.8,
              textAlign: "center",
            }}>
              Weekends book out fast. Reach out early and we&apos;ll get it sorted.
            </p>
            <Link
              href="/booking"
              className="btn btn-primary"
            >
              Start the Conversation <ArrowRight size={14} />
            </Link>
          </div>

        </div>
        {/* end content scenes */}

        {/* ══════════════════════════════════════════════════════════════
            PARALLAX PANELS — z:10, slide apart to reveal scenes above
            ══════════════════════════════════════════════════════════════ */}

        {/* "Rift." brand text — sits in front of panels at z:12, fades as panels open */}
        <h2
          ref={riftRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 12,
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(6rem, 22vw, 18rem)",
            fontWeight: 300,
            color: "#f5f3ef",
            letterSpacing: "0.04em",
            lineHeight: 1,
            userSelect: "none",
            whiteSpace: "nowrap",
            willChange: "opacity",
            pointerEvents: "none",
          }}
        >
          Rift<span style={{ color: "#c8924a" }}>.</span>
        </h2>

        {/* Left photo panel */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={leftRef}
          src={leftImage}
          alt="" aria-hidden="true"
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "52%", height: "100%",
            objectFit: "cover",
            objectPosition: "right center",
            zIndex: 10,
            pointerEvents: "none",
            filter: "brightness(0.78) saturate(0.85)",
            willChange: "transform",
          }}
        />

        {/* Right photo panel */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={rightRef}
          src={rightImage}
          alt="" aria-hidden="true"
          style={{
            position: "absolute",
            top: 0, left: "48%",
            width: "52%", height: "100%",
            objectFit: "cover",
            objectPosition: "left center",
            zIndex: 10,
            pointerEvents: "none",
            filter: "brightness(0.78) saturate(0.85)",
            willChange: "transform",
          }}
        />

        {/* Bottom gradient — same as mountains demo #top::before */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0,
          height: "220px", width: "100%",
          background: "linear-gradient(to top, #0e0c09, transparent)",
          zIndex: 11,
          pointerEvents: "none",
        }} />

        {/* ══════════════════════════════════════════════════════════════
            HERO COPY — z:20, fades out first
            ══════════════════════════════════════════════════════════════ */}
        <div
          ref={heroContentRef}
          style={{
            position: "absolute",
            bottom: "9%",
            left: "clamp(1.5rem, 8vw, 8rem)",
            right: "clamp(1.5rem, 8vw, 8rem)",
            zIndex: 20,
            willChange: "opacity",
          }}
        >
          <p className="text-eyebrow hero-animate hero-animate-1" style={{ marginBottom: "0.6rem" }}>
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
            {titleLine2 && <> <span className="gold-text">{titleLine2}</span></>}
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

        {/* Scroll indicator */}
        <div
          ref={scrollHintRef}
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
            zIndex: 25,
            pointerEvents: "none",
          }}
        >
          <span style={{
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: "0.5rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>Scroll</span>
          <ChevronDown size={14} />
        </div>

      </div>
      {/* end fixed stage */}

      {/* ── Scroll spacer — AFTER the fixed stage so it defines page height ── */}
      <div className="hs-spacer" aria-hidden="true" />
    </>
  );
}
