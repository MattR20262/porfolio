"use client";

import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

const serviceTypes = [
  { value: "wedding", label: "Wedding", desc: "Full-day coverage" },
  { value: "portrait", label: "Portrait", desc: "Personal session" },
  { value: "editorial", label: "Editorial", desc: "Fashion / brand" },
  { value: "commercial", label: "Commercial", desc: "Product / corporate" },
  { value: "destination", label: "Destination", desc: "Travel + shoot" },
];

const budgets = ["Under $2,000", "$2,000–$5,000", "$5,000–$10,000", "$10,000–$20,000", "$20,000+"];

export default function BookingPage() {
  const [serviceType, setServiceType] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      service_type: serviceType,
      full_name: (form.elements.namedItem("full_name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      event_date: (form.elements.namedItem("event_date") as HTMLInputElement).value || null,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      budget: (form.elements.namedItem("budget") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };
    try {
      const res = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", flexDirection: "column", textAlign: "center", gap: "1.5rem" }}>
        <div style={{ width: 64, height: 64, border: "1px solid #c9a84c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={24} color="#c9a84c" />
        </div>
        <h2 style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "2.5rem", fontWeight: 300 }}>Inquiry Received</h2>
        <p style={{ color: "#6b6b6b", maxWidth: "400px", lineHeight: 1.8 }}>Thank you for reaching out. I review every inquiry personally and respond within 24 hours.</p>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .booking-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 4rem;
          padding: 2rem clamp(1.5rem, 8vw, 8rem) 8rem;
          align-items: start;
        }
        .booking-field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.75rem;
        }
        @media (max-width: 768px) {
          .booking-layout { grid-template-columns: 1fr; }
          .booking-sidebar { display: none; }
          .booking-field-row { grid-template-columns: 1fr; }
          .service-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 400px) {
          .service-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section style={{ paddingTop: "160px", paddingBottom: "4rem", paddingLeft: "clamp(1.5rem, 8vw, 8rem)", paddingRight: "clamp(1.5rem, 8vw, 8rem)" }}>
        <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>Let&apos;s Work Together</p>
        <h1 className="text-display" style={{ marginBottom: "1rem" }}>Book a Session</h1>
        <div className="gold-divider" />
      </section>

      <div className="booking-layout">
        <form onSubmit={handleSubmit}>
          {/* 01 Service */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1.5rem" }}>
              01 — Select a Service
            </p>
            <div className="service-grid">
              {serviceTypes.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setServiceType(s.value)}
                  style={{
                    padding: "1.25rem 1rem",
                    border: `1px solid ${serviceType === s.value ? "#c9a84c" : "rgba(245,243,239,0.1)"}`,
                    background: serviceType === s.value ? "rgba(201,168,76,0.08)" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                >
                  <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 300, color: serviceType === s.value ? "#c9a84c" : "#f5f3ef" }}>
                    {s.label}
                  </p>
                  <p style={{ color: "#6b6b6b", fontSize: "0.72rem", marginTop: "0.2rem" }}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 02 Personal */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1.5rem" }}>
              02 — About You
            </p>
            <div className="booking-field-row" style={{ marginBottom: "1rem" }}>
              <div>
                <label className="form-label" htmlFor="full_name">Full Name *</label>
                <input id="full_name" name="full_name" className="form-input" required placeholder="Your name" />
              </div>
              <div>
                <label className="form-label" htmlFor="email">Email *</label>
                <input id="email" name="email" type="email" className="form-input" required placeholder="your@email.com" />
              </div>
            </div>
            <div className="booking-field-row">
              <div>
                <label className="form-label" htmlFor="phone">Phone</label>
                <input id="phone" name="phone" type="tel" className="form-input" placeholder="+1 (xxx) xxx-xxxx" />
              </div>
              <div>
                <label className="form-label" htmlFor="budget">Budget</label>
                <select id="budget" name="budget" className="form-select">
                  <option value="">Select range</option>
                  {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 03 Event */}
          <div style={{ marginBottom: "3rem" }}>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1.5rem" }}>
              03 — Event Details
            </p>
            <div className="booking-field-row">
              <div>
                <label className="form-label" htmlFor="event_date">Preferred Date</label>
                <input id="event_date" name="event_date" type="date" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="location">Location</label>
                <input id="location" name="location" className="form-input" placeholder="New York, Paris..." />
              </div>
            </div>
          </div>

          {/* 04 Vision */}
          <div style={{ marginBottom: "2.5rem" }}>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1.5rem" }}>
              04 — Your Vision *
            </p>
            <textarea name="message" className="form-textarea" required style={{ minHeight: "160px" }} placeholder="Tell me about your vision..." />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !serviceType} style={{ opacity: loading || !serviceType ? 0.5 : 1 }}>
            {loading ? "Sending..." : "Send Inquiry"}{!loading && <ArrowRight size={14} />}
          </button>
        </form>

        {/* Sidebar */}
        <aside className="booking-sidebar" style={{ position: "sticky", top: "100px", background: "#0d0d0d", border: "1px solid rgba(201,168,76,0.12)", padding: "2rem" }}>
          <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>Studio Info</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
            {[{ label: "Email", val: "hello@mattstudio.com" }, { label: "Phone", val: "+1 (917) 555-0142" }, { label: "Location", val: "New York City — Worldwide" }].map((i) => (
              <div key={i.label}>
                <p style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6b6b", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", marginBottom: "0.2rem" }}>{i.label}</p>
                <p style={{ color: "#c8c8c8", fontSize: "0.9rem" }}>{i.val}</p>
              </div>
            ))}
          </div>
          <div className="gold-divider" style={{ margin: "1.5rem 0" }} />
          <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1rem", color: "#9a9a9a", lineHeight: 1.8, fontStyle: "italic" }}>
            I respond to every inquiry personally within 24 hours. Limited availability per season.
          </p>
        </aside>
      </div>
    </>
  );
}
