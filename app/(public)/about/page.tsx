import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/public/ScrollReveal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "About — Rift Photography" };

const timeline = [
  {
    year: "2018",
    title: "First Frame",
    desc: "Picked up a camera at a friend's house party during engineering studies. Shot the whole night. Everyone wanted the photos. Something clicked.",
  },
  {
    year: "2019",
    title: "Word Spread Fast",
    desc: "Perth's event scene is tight-knit. One good set of photos leads to ten calls. Built a reputation for catching real moments — not posed ones.",
  },
  {
    year: "2020",
    title: "Rift Photography",
    desc: "Turned the side hustle into a full studio. Developed the Rift Preset — a signature film-inspired grade that became the look clients booked for.",
  },
  {
    year: "2022",
    title: "Commercial Breakthrough",
    desc: "First major brand commission. Then another. Toyota, Disney, Louis Vuitton, Mecca, Channel 9 — the same candid instincts that worked at parties worked on set.",
  },
  {
    year: "2024",
    title: "500+ Events",
    desc: "Over five hundred events a year. 200+ five-star reviews. Still the same approach: show up, read the room, capture what's actually happening.",
  },
];

const values = [
  {
    label: "Authenticity",
    desc: "I don't pose people. I read the room, move through it, and catch what's already there. The best frames come from forgetting the camera is there.",
  },
  {
    label: "The Rift Preset",
    desc: "Every delivery has a consistent look — warm, filmic, clean. Built over years of shooting across digital and 35mm to find a grade that feels timeless.",
  },
  {
    label: "Energy",
    desc: "I grew up shooting house parties. That instinct — to be in the right place at the right moment without disrupting it — is something you build, not fake.",
  },
  {
    label: "Consistency",
    desc: "500+ events a year means every system is refined. Fast turnarounds, clean galleries, no surprises. Clients come back because it just works.",
  },
];

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: contentRows } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", [
      "about_name", "about_tagline", "about_bio_1", "about_bio_2", "about_portrait",
      "about_stat_1_number", "about_stat_1_label",
      "about_stat_2_number", "about_stat_2_label",
      "about_stat_3_number", "about_stat_3_label",
      "about_brands",
    ]);

  const content: Record<string, string> = {};
  contentRows?.forEach((row) => { content[row.key] = row.value; });

  const aboutName    = content.about_name    || "Matt";
  const aboutTagline = content.about_tagline || "Film & Digital Photographer · Perth, WA";
  const bio1         = content.about_bio_1   || "Based in Perth, Western Australia, Matt started Rift Photography with a camera at a house party and an instinct for real moments. What began as a side project during an engineering degree became one of Perth's most in-demand photography studios — built entirely on word of mouth.";
  const bio2         = content.about_bio_2   || "His work blends digital precision with a film photographer's eye — warm, candid, and consistent. Whether it's a 21st in the backyard or a Louis Vuitton campaign, the approach doesn't change: show up, read the room, get the shot.";

  const stats = [
    { n: content.about_stat_1_number || "500+", l: content.about_stat_1_label || "Events/Year" },
    { n: content.about_stat_2_number || "200+", l: content.about_stat_2_label || "★ Reviews" },
    { n: content.about_stat_3_number || "6+",   l: content.about_stat_3_label || "Years" },
  ];

  const brands = (content.about_brands || "Toyota, Disney, Louis Vuitton, Mecca, Channel 9")
    .split(",").map((b) => b.trim()).filter(Boolean);

  const nameParts = aboutName.trim().split(" ");
  const nameFirst = nameParts.slice(0, -1).join(" ") || aboutName;
  const nameLast  = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  return (
    <>
      <style>{`
        .about-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .about-hero { grid-template-columns: 1fr; gap: 3rem; }
          .about-portrait-wrap { display: none; }
          .about-hero-pad { padding-top: 120px; padding-bottom: 3rem; }
          .stat-strip { flex-direction: row; gap: 1.5rem; flex-wrap: wrap; }
          .values-grid { grid-template-columns: 1fr !important; }
          .brand-strip { gap: 1.5rem !important; flex-wrap: wrap; }
        }
      `}</style>

      {/* Hero */}
      <section
        className="about-hero-pad"
        style={{
          paddingTop: "160px",
          paddingBottom: "6rem",
          paddingLeft: "clamp(1.5rem, 8vw, 8rem)",
          paddingRight: "clamp(1.5rem, 8vw, 8rem)",
        }}
      >
        <div className="about-hero">
          <div>
            <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>The Photographer</p>
            <h1 className="text-display" style={{ marginBottom: "1.5rem" }}>
              {nameFirst}
              {nameLast && (
                <>
                  <br />
                  <span className="gold-text">{nameLast}</span>
                </>
              )}
            </h1>
            <p style={{ color: "#9a9490", fontSize: "1rem", lineHeight: 1.8, marginBottom: "0.75rem" }}>
              {bio1}
            </p>
            <p style={{ color: "#9a9490", fontSize: "1rem", lineHeight: 1.8, marginBottom: "2.5rem" }}>
              {bio2}
            </p>
            <Link href="/booking" className="btn btn-primary">
              Work Together <ArrowRight size={14} />
            </Link>
          </div>

          <div className="about-portrait-wrap" style={{ position: "relative" }}>
            <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.about_portrait || "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=800&q=80"}
                alt="Photographer"
                style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75) saturate(0.85)" }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "2rem",
                left: "-2rem",
                background: "#120f0b",
                border: "1px solid rgba(200,146,74,0.2)",
                padding: "1.5rem 2rem",
              }}
            >
              <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>
                {aboutTagline}
              </p>
              <div className="stat-strip" style={{ display: "flex", gap: "2rem" }}>
                {stats.map((s) => (
                  <div key={s.l}>
                    <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300, color: "#c8924a" }}>
                      {s.n}
                    </p>
                    <p style={{ fontSize: "0.7rem", color: "#6b6560", letterSpacing: "0.1em" }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{ background: "#120f0b" }}>
        <div className="section-header">
          <p className="section-label">The Journey</p>
          <h2 className="text-heading">How It Started</h2>
        </div>
        <div className="timeline" style={{ maxWidth: "600px" }}>
          {timeline.map((item, i) => (
            <ScrollReveal key={item.year} delay={i * 0.1}>
              <div className="timeline-item">
                <p className="text-eyebrow" style={{ marginBottom: "0.5rem" }}>{item.year}</p>
                <h3 style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontSize: "1.4rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "0.5rem",
                }}>
                  {item.title}
                </h3>
                <p style={{ color: "#6b6560", lineHeight: 1.8, fontSize: "0.9rem" }}>{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="section-header">
          <p className="section-label">The Approach</p>
          <h2 className="text-heading">How I Work</h2>
        </div>
        <div
          className="values-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}
        >
          {values.map((v, i) => (
            <ScrollReveal key={v.label} delay={i * 0.1}>
              <div className="service-card">
                <div className="gold-divider" style={{ margin: "0 0 1.5rem" }} />
                <h3 style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                  fontSize: "1.4rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "0.75rem",
                }}>
                  {v.label}
                </h3>
                <p style={{ color: "#6b6560", fontSize: "0.9rem", lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section
        style={{
          padding: "4rem clamp(1.5rem, 8vw, 8rem)",
          background: "#120f0b",
          borderTop: "1px solid rgba(200,146,74,0.08)",
          borderBottom: "1px solid rgba(200,146,74,0.08)",
        }}
      >
        <p className="text-eyebrow" style={{ textAlign: "center", marginBottom: "2rem" }}>Trusted By</p>
        <div
          className="brand-strip"
          style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "3rem", flexWrap: "wrap" }}
        >
          {brands.map((brand) => (
            <p
              key={brand}
              style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                fontSize: "1.2rem", fontWeight: 300, color: "#3d3530", fontStyle: "italic",
              }}
            >
              {brand}
            </p>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "8rem clamp(1.5rem, 8vw, 8rem)", textAlign: "center" }}>
        <ScrollReveal>
          <h2 className="text-heading" style={{ marginBottom: "1.5rem" }}>
            Let&apos;s Work Together
          </h2>
          <p style={{ color: "#6b6560", marginBottom: "2.5rem", maxWidth: "400px", margin: "0 auto 2.5rem", lineHeight: 1.8 }}>
            Spots fill fast. If you&apos;ve got a date, reach out early.
          </p>
          <Link href="/booking" className="btn btn-primary">
            Get in Touch <ArrowRight size={14} />
          </Link>
        </ScrollReveal>
      </section>
    </>
  );
}
