"use client";

import Link from "next/link";
import { Share2, ExternalLink } from "lucide-react";

interface FooterProps {
  contactEmail?:    string;
  contactPhone?:    string;
  contactLocation?: string;
  socialInstagram?: string;
  socialTiktok?:    string;
  socialPinterest?: string;
  socialLinkedin?:  string;
  heroSubtitle?:    string;
  aboutName?:       string;
}

export default function Footer({
  contactEmail    = "hello@mattstudio.com",
  contactPhone    = "+1 (917) 555-0142",
  contactLocation = "New York City, NY — Available Worldwide",
  socialInstagram = "",
  socialTiktok    = "",
  socialPinterest = "",
  socialLinkedin  = "",
  heroSubtitle    = "Luxury photography for weddings, portraits, fashion, and editorial — crafted with intention.",
  aboutName       = "Matthew Ashford",
}: FooterProps) {
  const year = new Date().getFullYear();

  const socials = [
    { href: socialInstagram, label: "Instagram" },
    { href: socialTiktok,    label: "TikTok" },
    { href: socialPinterest, label: "Pinterest" },
    { href: socialLinkedin,  label: "LinkedIn" },
  ].filter((s) => s.href);

  return (
    <footer className="footer">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
          marginBottom: "4rem",
        }}
      >
        {/* Brand */}
        <div>
          <Link href="/" className="nav-logo" style={{ display: "block", marginBottom: "1rem" }}>
            Matt<span>.</span>
          </Link>
          <p style={{ color: "#6b6b6b", fontSize: "0.85rem", lineHeight: 1.8, maxWidth: "260px" }}>
            {heroSubtitle}
          </p>
          {socials.length > 0 && (
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{ color: "#6b6b6b", transition: "color 0.3s", fontSize: "0.7rem",
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
                >
                  <Share2 size={15} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Navigate */}
        <div>
          <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>Navigate</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { href: "/portfolio", label: "Portfolio" },
              { href: "/about",     label: "About" },
              { href: "/services",  label: "Services" },
              { href: "/booking",   label: "Book a Session" },
              { href: "/contact",   label: "Contact" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  style={{ color: "#6b6b6b", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Specialties */}
        <div>
          <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>Specialties</p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {["Weddings", "Editorial & Fashion", "Portraits", "Commercial", "Events", "Destinations"].map((s) => (
              <li key={s} style={{ color: "#6b6b6b", fontSize: "0.85rem" }}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Studio contact */}
        <div>
          <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>Studio</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                style={{ color: "#6b6b6b", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
              >
                {contactEmail}
              </a>
            )}
            {contactPhone && (
              <a
                href={`tel:${contactPhone.replace(/\s/g, "")}`}
                style={{ color: "#6b6b6b", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6b6b6b")}
              >
                {contactPhone}
              </a>
            )}
            {contactLocation && (
              <p style={{ color: "#6b6b6b", fontSize: "0.85rem", lineHeight: 1.6 }}>
                {contactLocation.replace(" — ", "\n")}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(245,243,239,0.06)",
          paddingTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <p style={{ color: "#3d3d3d", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          © {year} {aboutName} Photography. All rights reserved.
        </p>
        <p style={{ color: "#3d3d3d", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
          New York · Paris · London · Available Worldwide
        </p>
      </div>
    </footer>
  );
}
