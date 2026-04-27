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
    keys: [
      "about_name", "about_tagline", "about_bio_1", "about_bio_2",
      "about_stat_1_number", "about_stat_1_label",
      "about_stat_2_number", "about_stat_2_label",
      "about_stat_3_number", "about_stat_3_label",
      "about_brands",
    ],
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
      "service_01_title", "service_01_tagline", "service_01_price", "service_01_desc", "service_01_includes",
      "service_02_title", "service_02_tagline", "service_02_price", "service_02_desc", "service_02_includes",
      "service_03_title", "service_03_tagline", "service_03_price", "service_03_desc", "service_03_includes",
      "service_04_title", "service_04_tagline", "service_04_price", "service_04_desc", "service_04_includes",
      "service_05_title", "service_05_tagline", "service_05_price", "service_05_desc", "service_05_includes",
      "service_06_title", "service_06_tagline", "service_06_price", "service_06_desc", "service_06_includes",
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
  { label: "Service 01", keys: ["service_01_title", "service_01_tagline", "service_01_price", "service_01_desc", "service_01_includes"] },
  { label: "Service 02", keys: ["service_02_title", "service_02_tagline", "service_02_price", "service_02_desc", "service_02_includes"] },
  { label: "Service 03", keys: ["service_03_title", "service_03_tagline", "service_03_price", "service_03_desc", "service_03_includes"] },
  { label: "Service 04", keys: ["service_04_title", "service_04_tagline", "service_04_price", "service_04_desc", "service_04_includes"] },
  { label: "Service 05", keys: ["service_05_title", "service_05_tagline", "service_05_price", "service_05_desc", "service_05_includes"] },
  { label: "Service 06", keys: ["service_06_title", "service_06_tagline", "service_06_price", "service_06_desc", "service_06_includes"] },
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
    if (!confirm("Reset ALL content to defaults? This seeds every field with Matt's starter content.")) return;
    setSaving("reset");
    // Use the seed-content API which has the full authoritative list of defaults
    const res = await fetch("/api/seed-content", { method: "POST" });
    if (!res.ok) {
      toast.error("Reset failed");
      setSaving(null);
      return;
    }
    // Reload content from DB so editor reflects what was just seeded
    const supabase = createClient();
    const { data } = await supabase.from("site_content").select("*");
    const map: Record<string, string> = {};
    data?.forEach((item: SiteContent) => { map[item.key] = item.value; });
    setContent(map);
    toast.success("All content seeded with defaults ✓");
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
    about_stat_1_number: "Stat 1 — Number (e.g. 500+)",
    about_stat_1_label:  "Stat 1 — Label (e.g. Events/Year)",
    about_stat_2_number: "Stat 2 — Number (e.g. 200+)",
    about_stat_2_label:  "Stat 2 — Label (e.g. ★ Reviews)",
    about_stat_3_number: "Stat 3 — Number (e.g. 6+)",
    about_stat_3_label:  "Stat 3 — Label (e.g. Years)",
    about_brands: "Trusted Brands (comma-separated)",
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
    service_01_includes: "Service 1 — Includes (one item per line)",
    service_02_title: "Service 2 — Title",
    service_02_tagline: "Service 2 — Tagline",
    service_02_price: "Service 2 — Price",
    service_02_desc: "Service 2 — Description",
    service_02_includes: "Service 2 — Includes (one item per line)",
    service_03_title: "Service 3 — Title",
    service_03_tagline: "Service 3 — Tagline",
    service_03_price: "Service 3 — Price",
    service_03_desc: "Service 3 — Description",
    service_03_includes: "Service 3 — Includes (one item per line)",
    service_04_title: "Service 4 — Title",
    service_04_tagline: "Service 4 — Tagline",
    service_04_price: "Service 4 — Price",
    service_04_desc: "Service 4 — Description",
    service_04_includes: "Service 4 — Includes (one item per line)",
    service_05_title: "Service 5 — Title",
    service_05_tagline: "Service 5 — Tagline",
    service_05_price: "Service 5 — Price",
    service_05_desc: "Service 5 — Description",
    service_05_includes: "Service 5 — Includes (one item per line)",
    service_06_title: "Service 6 — Title",
    service_06_tagline: "Service 6 — Tagline",
    service_06_price: "Service 6 — Price",
    service_06_desc: "Service 6 — Description",
    service_06_includes: "Service 6 — Includes (one item per line)",
  };

  const multilineKeys = [
    "hero_subtitle",
    "brand_statement",
    "about_bio_1",
    "about_bio_2",
    "about_brands",
    "seo_description",
    "service_01_desc", "service_01_includes",
    "service_02_desc", "service_02_includes",
    "service_03_desc", "service_03_includes",
    "service_04_desc", "service_04_includes",
    "service_05_desc", "service_05_includes",
    "service_06_desc", "service_06_includes",
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
