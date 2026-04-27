"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { SiteContent } from "@/types";
// Note: saveKey/saveSection now use /api/content (PATCH) so revalidatePath fires on the server
import toast from "react-hot-toast";
import { Save } from "lucide-react";

const sections = [
  {
    label: "Hero",
    keys: ["hero_eyebrow", "hero_title", "hero_subtitle", "hero_cta_primary", "hero_cta_secondary", "brand_statement"],
  },
  {
    label: "About",
    keys: ["about_name", "about_tagline", "about_bio_1", "about_bio_2"],
  },
  {
    label: "Contact",
    keys: ["contact_email", "contact_phone", "contact_location"],
  },
  {
    label: "Social",
    keys: ["social_instagram", "social_tiktok", "social_pinterest", "social_linkedin"],
  },
  {
    label: "SEO",
    keys: ["seo_title", "seo_description"],
  },
  {
    label: "Images",
    keys: [
      "hero_bg_image",
      "hero_left_image",
      "hero_right_image",
      "about_portrait",
      "services_hero",
      "contact_hero",
    ],
  },
  {
    label: "Services",
    keys: [
      "service_01_title", "service_01_tagline", "service_01_price", "service_01_desc",
      "service_02_title", "service_02_tagline", "service_02_price", "service_02_desc",
      "service_03_title", "service_03_tagline", "service_03_price", "service_03_desc",
      "service_04_title", "service_04_tagline", "service_04_price", "service_04_desc",
      "service_05_title", "service_05_tagline", "service_05_price", "service_05_desc",
      "service_06_title", "service_06_tagline", "service_06_price", "service_06_desc",
    ],
  },
];

const imageKeys = [
  "hero_bg_image",
  "hero_left_image",
  "hero_right_image",
  "about_portrait",
  "services_hero",
  "contact_hero",
];

// Keys that belong to each service group (used to render dividers)
const serviceGroups = [
  { label: "Service 01", keys: ["service_01_title", "service_01_tagline", "service_01_price", "service_01_desc"] },
  { label: "Service 02", keys: ["service_02_title", "service_02_tagline", "service_02_price", "service_02_desc"] },
  { label: "Service 03", keys: ["service_03_title", "service_03_tagline", "service_03_price", "service_03_desc"] },
  { label: "Service 04", keys: ["service_04_title", "service_04_tagline", "service_04_price", "service_04_desc"] },
  { label: "Service 05", keys: ["service_05_title", "service_05_tagline", "service_05_price", "service_05_desc"] },
  { label: "Service 06", keys: ["service_06_title", "service_06_tagline", "service_06_price", "service_06_desc"] },
];

export default function ContentPage() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("site_content").select("*");
      const map: Record<string, string> = {};
      data?.forEach((item: SiteContent) => { map[item.key] = item.value; });
      setContent(map);
      setLoading(false);
    }
    load();
  }, []);

  async function saveKey(key: string) {
    setSaving(key);
    const res = await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: content[key] ?? "" }),
    });
    if (!res.ok) toast.error("Failed to save");
    else toast.success("Saved");
    setSaving(null);
  }

  async function resetToDefaults() {
    if (!confirm("Reset all core content to Matt's defaults? This will overwrite name, contact info, SEO and hero text.")) return;
    setSaving("reset");
    const defaults: Record<string, string> = {
      seo_title:          "Rift Photography — Matt | Perth, WA",
      seo_description:    "Perth-based event, wedding and commercial photographer. Candid, film-inspired, available worldwide.",
      hero_eyebrow:       "Film & Digital Photographer · Perth, WA · Available Worldwide",
      hero_title:         "Real Moments. Timeless Frames.",
      hero_subtitle:      "Event, wedding and commercial photography shot on digital and film. Perth-based, candid-first, available everywhere.",
      hero_cta_primary:   "View Portfolio",
      hero_cta_secondary: "Book Now",
      brand_statement:    "I don't pose people. I read the room and catch what's already there.",
      about_name:         "Matt",
      about_tagline:      "Film & Digital Photographer · Perth, WA",
      about_bio_1:        "Based in Perth, Western Australia, Matt started Rift Photography with a camera at a house party and an instinct for real moments. What began as a side project during an engineering degree became one of Perth's most in-demand photography studios — built entirely on word of mouth.",
      about_bio_2:        "His work blends digital precision with a film photographer's eye — warm, candid, and consistent. Whether it's a 21st in the backyard or a Louis Vuitton campaign, the approach doesn't change: show up, read the room, get the shot.",
      contact_email:      "matt@riftphotography.com.au",
      contact_phone:      "+61 4XX XXX XXX",
      contact_location:   "Perth, Western Australia — Available Worldwide",
      social_instagram:   "https://instagram.com/riftphotography",
    };
    const res = await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defaults),
    });
    if (!res.ok) {
      toast.error("Reset failed");
    } else {
      setContent((prev) => ({ ...prev, ...defaults }));
      toast.success("Reset to Matt's defaults ✓");
    }
    setSaving(null);
  }

  async function saveSection() {
    setSaving("section");
    const keys = sections[activeSection].keys;
    const payload: Record<string, string> = {};
    keys.forEach((key) => { payload[key] = content[key] ?? ""; });

    const res = await fetch("/api/content", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) toast.error("Failed to save section");
    else toast.success("Section saved");
    setSaving(null);
  }

  const labelMap: Record<string, string> = {
    hero_eyebrow: "Eyebrow Text",
    hero_title: "Hero Title",
    hero_subtitle: "Subtitle",
    hero_cta_primary: "Primary CTA",
    hero_cta_secondary: "Secondary CTA",
    brand_statement: "Brand Statement",
    about_name: "Photographer Name",
    about_tagline: "Tagline",
    about_bio_1: "Bio Paragraph 1",
    about_bio_2: "Bio Paragraph 2",
    contact_email: "Email Address",
    contact_phone: "Phone Number",
    contact_location: "Location",
    social_instagram: "Instagram URL",
    social_tiktok: "TikTok URL",
    social_pinterest: "Pinterest URL",
    social_linkedin: "LinkedIn URL",
    seo_title: "Default Page Title",
    seo_description: "Meta Description",
    hero_bg_image: "Hero Background Image URL",
    hero_left_image: "Hero Left Panel Image URL",
    hero_right_image: "Hero Right Panel Image URL",
    about_portrait: "About Portrait Image URL",
    services_hero: "Services Page Hero Image URL",
    contact_hero: "Contact Page Hero Image URL",
    service_01_title: "Service 1 — Title",
    service_01_tagline: "Service 1 — Tagline",
    service_01_price: "Service 1 — Price",
    service_01_desc: "Service 1 — Description",
    service_02_title: "Service 2 — Title",
    service_02_tagline: "Service 2 — Tagline",
    service_02_price: "Service 2 — Price",
    service_02_desc: "Service 2 — Description",
    service_03_title: "Service 3 — Title",
    service_03_tagline: "Service 3 — Tagline",
    service_03_price: "Service 3 — Price",
    service_03_desc: "Service 3 — Description",
    service_04_title: "Service 4 — Title",
    service_04_tagline: "Service 4 — Tagline",
    service_04_price: "Service 4 — Price",
    service_04_desc: "Service 4 — Description",
    service_05_title: "Service 5 — Title",
    service_05_tagline: "Service 5 — Tagline",
    service_05_price: "Service 5 — Price",
    service_05_desc: "Service 5 — Description",
    service_06_title: "Service 6 — Title",
    service_06_tagline: "Service 6 — Tagline",
    service_06_price: "Service 6 — Price",
    service_06_desc: "Service 6 — Description",
  };

  const multilineKeys = [
    "hero_subtitle",
    "brand_statement",
    "about_bio_1",
    "about_bio_2",
    "seo_description",
    "service_01_desc",
    "service_02_desc",
    "service_03_desc",
    "service_04_desc",
    "service_05_desc",
    "service_06_desc",
  ];

  if (loading) return <><AdminHeader title="Content Editor" /><div className="admin-content"><p style={{ color: "#6b6b6b" }}>Loading...</p></div></>;

  const currentSection = sections[activeSection];
  const isServicesSection = currentSection.label === "Services";

  function renderField(key: string) {
    const isImage = imageKeys.includes(key);
    const isMultiline = multilineKeys.includes(key);
    const val = content[key] ?? "";

    return (
      <div key={key}>
        <label className="form-label">{labelMap[key] ?? key}</label>
        {isMultiline ? (
          <textarea
            className="form-textarea"
            value={val}
            onChange={(e) => setContent((prev) => ({ ...prev, [key]: e.target.value }))}
            style={{ minHeight: "100px" }}
          />
        ) : (
          <input
            className="form-input"
            value={val}
            onChange={(e) => setContent((prev) => ({ ...prev, [key]: e.target.value }))}
          />
        )}
        {isImage && val.startsWith("http") && (
          <img
            src={val}
            alt=""
            style={{ maxHeight: "80px", objectFit: "cover", marginTop: "0.5rem", opacity: 0.7, display: "block" }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <AdminHeader
        title="Content Editor"
        action={
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={resetToDefaults}
              disabled={saving === "reset"}
              style={{
                padding: "0.5rem 1rem", fontSize: "0.6rem",
                background: "transparent", border: "1px solid rgba(201,168,76,0.3)",
                color: "#c9a84c", cursor: "pointer", letterSpacing: "0.1em",
                fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                textTransform: "uppercase", opacity: saving === "reset" ? 0.5 : 1,
              }}
            >
              {saving === "reset" ? "Resetting..." : "Reset to Matt's Defaults"}
            </button>
            <button onClick={saveSection} className="btn btn-primary" disabled={saving === "section"} style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}>
              <Save size={13} />
              {saving === "section" ? "Saving..." : "Save Section"}
            </button>
          </div>
        }
      />
      <div className="admin-content">
        <div className="admin-content-grid">
          {/* Section tabs */}
          <div className="admin-tab-strip">
            {sections.map((sec, i) => (
              <button
                key={sec.label}
                onClick={() => setActiveSection(i)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  background: activeSection === i ? "rgba(201,168,76,0.08)" : "none",
                  border: "none",
                  borderLeft: `2px solid ${activeSection === i ? "#c9a84c" : "transparent"}`,
                  color: activeSection === i ? "#c9a84c" : "#6b6b6b",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  transition: "all 0.2s",
                }}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 300, color: "#f5f3ef" }}>
              {currentSection.label}
            </p>

            {isServicesSection ? (
              serviceGroups.map((group) => (
                <div key={group.label} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <p style={{
                    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#c9a84c",
                    borderBottom: "1px solid rgba(201,168,76,0.2)",
                    paddingBottom: "0.4rem",
                    marginBottom: "0",
                  }}>
                    {group.label}
                  </p>
                  {group.keys.map((key) => renderField(key))}
                </div>
              ))
            ) : (
              currentSection.keys.map((key) => renderField(key))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
