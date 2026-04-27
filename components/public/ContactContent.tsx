"use client";

import { useState } from "react";
import { Check, ChevronDown, Share2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const faqs = [
  { q: "How far in advance should I book?", a: "For weddings, 12–18 months in advance. Portraits and editorial, 4–8 weeks is usually sufficient. I do take last-minute bookings when available." },
  { q: "Do you travel for shoots?", a: "Yes — I've shot in 28 countries and counting. All travel and accommodation is built into destination packages. No hidden fees." },
  { q: "How long until I receive my images?", a: "Portraits: 2 weeks. Weddings: 6–8 weeks. Editorial: 5–7 business days. Rush delivery available for commercial projects." },
  { q: "Do you offer payment plans?", a: "Yes. A retainer secures your date. The balance is typically split 50/50 at booking and 30 days before the shoot." },
  { q: "What if I need to reschedule?", a: "Rescheduling within 90 days incurs no fee. Cancellation policy varies by package — full details in the contract." },
];

const DEFAULT_CONTACT_HERO =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80";

interface Props {
  contactEmail:    string;
  contactPhone:    string;
  contactLocation: string;
  socialInstagram: string;
  heroImage?:      string;
}

export default function ContactContent({ contactEmail, contactPhone, contactLocation, socialInstagram, heroImage }: Props) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value,
      email:   (form.elements.namedItem("email")   as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Extract Instagram handle from URL for display
  const igHandle = socialInstagram
    ? "@" + socialInstagram.replace(/https?:\/\/(www\.)?instagram\.com\/?/, "").replace(/\/$/, "")
    : "@mattstudio";

  const heroBg = heroImage || DEFAULT_CONTACT_HERO;

  return (
    <>
      {/* Full-bleed Hero */}
      <section style={{ height: "60vh", position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroBg}
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
          <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>Contact</p>
          <h1
            style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
              fontSize: "clamp(3rem, 7vw, 5.5rem)",
              fontWeight: 300,
              color: "#f5f3ef",
              lineHeight: 1.1,
            }}
          >
            Get in Touch
          </h1>
        </div>
      </section>

      <style>{`
        .contact-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 4rem;
          padding: 0 clamp(1.5rem, 8vw, 8rem) 6rem;
          align-items: start;
        }
        .contact-info-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          padding: 0 clamp(1.5rem, 8vw, 8rem);
          margin-top: 4rem;
          margin-bottom: 4rem;
        }
        .contact-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 768px) {
          .contact-layout { grid-template-columns: 1fr; }
          .contact-sidebar { display: none; }
          .contact-info-strip { grid-template-columns: 1fr; }
          .contact-field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Info strip */}
      <div className="contact-info-strip">
        {[
          { label: "Email",    val: contactEmail },
          { label: "Phone",    val: contactPhone },
          { label: "Location", val: contactLocation },
        ].map((item) => (
          <div key={item.label} style={{ padding: "1.5rem", border: "1px solid rgba(201,168,76,0.1)", background: "#0d0d0d" }}>
            <p className="text-eyebrow" style={{ marginBottom: "0.75rem" }}>{item.label}</p>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#f5f3ef" }}>
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {/* Form + sidebar */}
      <div className="contact-layout">
        {submitted ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.5rem", padding: "3rem 0" }}>
            <div style={{ width: 56, height: 56, border: "1px solid #c9a84c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={22} color="#c9a84c" />
            </div>
            <h2 style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 300 }}>
              Message Received
            </h2>
            <p style={{ color: "#6b6b6b", lineHeight: 1.8 }}>
              Thank you for getting in touch. I&apos;ll reply within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="contact-field-row" style={{ marginBottom: "1rem" }}>
              <div>
                <label className="form-label" htmlFor="name">Name *</label>
                <input id="name" name="name" className="form-input" required placeholder="Your name" />
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" className="form-input" required placeholder="your@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="subject">Subject</label>
              <input id="subject" name="subject" className="form-input" placeholder="What's this about?" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="message">Message *</label>
              <textarea id="message" name="message" className="form-textarea" required style={{ minHeight: "180px" }} placeholder="Tell me what's on your mind..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}

        <aside className="contact-sidebar">
          {socialInstagram && (
            <div style={{ background: "#0d0d0d", border: "1px solid rgba(201,168,76,0.1)", padding: "2rem", marginBottom: "1.5rem" }}>
              <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>Follow the Work</p>
              <a
                href={socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#6b6b6b", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
              >
                <Share2 size={18} />
                <span style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.8rem" }}>
                  {igHandle}
                </span>
              </a>
            </div>
          )}
          <div style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.1) 0%, transparent 100%)", border: "1px solid rgba(201,168,76,0.2)", padding: "2rem" }}>
            <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>Ready to Book?</p>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#f5f3ef", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Skip the back and forth — go straight to the booking form.
            </p>
            <Link href="/booking" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
              Book a Session
            </Link>
          </div>
        </aside>
      </div>

      {/* FAQ */}
      <section className="section" style={{ background: "#0d0d0d" }}>
        <div className="section-header">
          <p className="section-label">Common Questions</p>
          <h2 className="text-heading">FAQ</h2>
        </div>
        <div style={{ maxWidth: "720px" }}>
          {faqs.map((faq, i) => (
            <div key={i} className="accordion-item">
              <button className="accordion-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                <ChevronDown
                  size={18}
                  style={{
                    color: "#c9a84c",
                    flexShrink: 0,
                    transition: "transform 0.3s",
                    transform: openFaq === i ? "rotate(180deg)" : "rotate(0)",
                  }}
                />
              </button>
              <div className={`accordion-content${openFaq === i ? " open" : ""}`}>
                <p className="accordion-inner">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
