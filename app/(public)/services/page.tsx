import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import ScrollReveal from "@/components/public/ScrollReveal";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Services — Rift Photography" };

const defaultServices = [
  {
    id: "01",
    title: "Events & Parties",
    tagline: "Birthdays · Milestones · Celebrations",
    price: "Get a quote",
    desc: "Where it all started. Whether it's a 21st in the backyard or a 500-person gala, the approach is the same — move through the room, read the energy, catch what's real.",
    includes: ["2–8 hour coverage", "50–150 photos per hour", "Rift Preset colour grade", "Online gallery within 48hrs", "High-res downloads", "Optional photo booth add-on"],
  },
  {
    id: "02",
    title: "Weddings",
    tagline: "Full-day candid coverage",
    price: "Get a quote",
    desc: "No stiff lineups. No forced smiles. I document your day the way it actually feels — the nerves, the laughs, the look across the room. Film-inspired, honest, yours.",
    includes: ["Full day coverage", "Two photographers available", "400+ edited images", "Rift Preset film grade", "Private online gallery", "Print-ready files"],
  },
  {
    id: "03",
    title: "Commercial & Brand",
    tagline: "Campaigns · Products · Brand content",
    price: "Get a quote",
    desc: "The same instincts that make great event photography make great commercial work. Trusted by Toyota, Disney, Louis Vuitton, Mecca, and Channel 9 to deliver on deadline.",
    includes: ["Half or full-day rates", "On-set art direction", "Commercial usage rights", "Same-day selects available", "Retouching & colour grade", "Campaign & social licensing"],
  },
  {
    id: "04",
    title: "Corporate",
    tagline: "Conferences · Headshots · Launches",
    price: "Get a quote",
    desc: "Professional corporate coverage that doesn't look corporate. Conferences, product launches, team headshots — delivered clean, fast, and ready to use.",
    includes: ["Half or full-day rates", "Conference & event coverage", "Professional headshots", "Product launch photography", "48hr delivery", "Brand-ready files"],
  },
  {
    id: "05",
    title: "Pre-Ball & Formals",
    tagline: "Debs · School formals · Group shoots",
    price: "Get a quote",
    desc: "Perth's go-to for pre-ball photography. On-location group shoots that capture the excitement — and deliver a gallery everyone actually wants to share.",
    includes: ["On-location shoot", "Group & individual shots", "Fast 24hr turnaround", "Shareable online gallery", "High-res downloads", "Rift Preset grade"],
  },
  {
    id: "06",
    title: "Rift Booth",
    tagline: "Photo booth hire · Perth & surrounds",
    price: "Get a quote",
    desc: "Our branded photo booth add-on for events. Instant prints, digital sharing, custom overlays. The thing guests queue for all night.",
    includes: ["2–4 hour hire available", "Instant print option", "Digital sharing station", "Custom branded overlays", "Unlimited sessions", "On-site booth attendant"],
  },
];

const process = [
  { step: "01", title: "Reach Out", desc: "Send a message with your date and a bit about what you need. We'll come back within 24 hours." },
  { step: "02", title: "Quick Chat", desc: "A short call to understand the vibe, the venue, what matters most. No questionnaire, just a conversation." },
  { step: "03", title: "Locked In", desc: "Quote sent, deposit paid, date secured. Simple as that." },
  { step: "04", title: "The Day", desc: "We show up early, move through the room, and deliver a gallery that looks like your event actually felt." },
];

const DEFAULT_HERO =
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80";

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: contentRows } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", [
      "services_hero",
      "service_01_title", "service_01_tagline", "service_01_price", "service_01_desc",
      "service_02_title", "service_02_tagline", "service_02_price", "service_02_desc",
      "service_03_title", "service_03_tagline", "service_03_price", "service_03_desc",
      "service_04_title", "service_04_tagline", "service_04_price", "service_04_desc",
      "service_05_title", "service_05_tagline", "service_05_price", "service_05_desc",
      "service_06_title", "service_06_tagline", "service_06_price", "service_06_desc",
    ]);

  const content: Record<string, string> = {};
  contentRows?.forEach((row) => { content[row.key] = row.value; });

  const services = defaultServices.map((svc) => {
    const n = svc.id;
    return {
      ...svc,
      title:   content[`service_${n}_title`]   || svc.title,
      tagline: content[`service_${n}_tagline`] || svc.tagline,
      price:   content[`service_${n}_price`]   || svc.price,
      desc:    content[`service_${n}_desc`]    || svc.desc,
    };
  });

  const heroImage = content.services_hero || DEFAULT_HERO;

  return (
    <>
      {/* Full-bleed Hero */}
      <section style={{ height: "60vh", position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.45 }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(14,12,9,0.6)" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>Services</p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 300,
              color: "#f5f3ef",
              lineHeight: 1.1,
            }}
          >
            What We Offer
          </h1>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: "5rem clamp(1.5rem, 8vw, 8rem) 8rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {services.map((svc, i) => (
            <ScrollReveal key={svc.id} delay={i * 0.07}>
              <div className="service-card" style={{ height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <p className="text-eyebrow">{svc.id}</p>
                  <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1rem", color: "#c8924a" }}>
                    {svc.price}
                  </p>
                </div>
                <h2 style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "0.4rem" }}>
                  {svc.title}
                </h2>
                <p style={{ color: "#6b6560", fontSize: "0.75rem", letterSpacing: "0.1em", marginBottom: "1rem" }}>
                  {svc.tagline}
                </p>
                <p style={{ color: "#9a9490", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "1.5rem" }}>
                  {svc.desc}
                </p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {svc.includes.map((item) => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.6rem", fontSize: "0.8rem", color: "#6b6560" }}>
                      <Check size={12} color="#c8924a" strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="section" style={{ background: "#120f0b" }}>
        <div className="section-header">
          <p className="section-label">How It Works</p>
          <h2 className="text-heading">Simple Process</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "2rem" }}>
          {process.map((step, i) => (
            <ScrollReveal key={step.step} delay={i * 0.1}>
              <div>
                <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>Step {step.step}</p>
                <h3 style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "0.75rem" }}>
                  {step.title}
                </h3>
                <p style={{ color: "#6b6560", fontSize: "0.9rem", lineHeight: 1.8 }}>{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "8rem clamp(1.5rem, 8vw, 8rem)", textAlign: "center" }}>
        <h2 className="text-heading" style={{ marginBottom: "1.5rem" }}>Got a Date in Mind?</h2>
        <p style={{ color: "#6b6560", maxWidth: "400px", margin: "0 auto 2.5rem", lineHeight: 1.8 }}>
          Weekends fill up fast. Get in touch early and we&apos;ll lock it in.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/booking" className="btn btn-primary">
            Book Now <ArrowRight size={14} />
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Ask a Question
          </Link>
        </div>
      </section>
    </>
  );
}
