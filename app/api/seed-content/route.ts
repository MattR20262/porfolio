import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ─── Matt's correct default site content ──────────────────────────────────
   Call POST /api/seed-content to stamp these into the DB.
   Existing keys are updated (upserted), so it's safe to run multiple times.
   ────────────────────────────────────────────────────────────────────────── */
const DEFAULTS: { key: string; value: string }[] = [
  // ── SEO ────────────────────────────────────────────────────────────────
  { key: "seo_title",        value: "Rift Photography — Matt | Perth, WA" },
  { key: "seo_description",  value: "Perth-based event, wedding and commercial photographer. Candid, film-inspired, available worldwide." },

  // ── Hero ───────────────────────────────────────────────────────────────
  { key: "hero_eyebrow",      value: "Film & Digital Photographer · Perth, WA · Available Worldwide" },
  { key: "hero_title",        value: "Real Moments. Timeless Frames." },
  { key: "hero_subtitle",     value: "Event, wedding and commercial photography shot on digital and film. Perth-based, candid-first, available everywhere." },
  { key: "hero_cta_primary",  value: "View Portfolio" },
  { key: "hero_cta_secondary",value: "Book Now" },

  // ── Brand / About ──────────────────────────────────────────────────────
  { key: "brand_statement", value: "I don't pose people. I read the room and catch what's already there." },
  { key: "about_name",      value: "Matt" },
  { key: "about_tagline",   value: "Film & Digital Photographer · Perth, WA" },
  { key: "about_bio_1",     value: "Based in Perth, Western Australia, Matt started Rift Photography with a camera at a house party and an instinct for real moments. What began as a side project during an engineering degree became one of Perth's most in-demand photography studios — built entirely on word of mouth." },
  { key: "about_bio_2",     value: "His work blends digital precision with a film photographer's eye — warm, candid, and consistent. Whether it's a 21st in the backyard or a Louis Vuitton campaign, the approach doesn't change: show up, read the room, get the shot." },

  // ── Contact ────────────────────────────────────────────────────────────
  { key: "contact_email",    value: "matt@riftphotography.com.au" },
  { key: "contact_phone",    value: "+61 4XX XXX XXX" },
  { key: "contact_location", value: "Perth, Western Australia — Available Worldwide" },

  // ── Social ─────────────────────────────────────────────────────────────
  { key: "social_instagram", value: "https://instagram.com/riftphotography" },
];

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const rows = DEFAULTS.map(d => ({ ...d, type: "text" }));
    const { error } = await supabase
      .from("site_content")
      .upsert(rows, { onConflict: "key" });

    if (error) {
      console.error("seed-content error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Reset ${DEFAULTS.length} site_content keys to Matt's defaults.`,
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
