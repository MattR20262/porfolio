import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/* ─── Matt's complete default site content ─────────────────────────────────
   Every key the Content Editor manages lives here.
   POST /api/seed-content to stamp them into the DB (safe to run multiple times).
   ────────────────────────────────────────────────────────────────────────── */
const DEFAULTS: { key: string; value: string }[] = [
  // ── SEO ──────────────────────────────────────────────────────────────────
  { key: "seo_title",        value: "Rift Photography — Matt | Perth, WA" },
  { key: "seo_description",  value: "Perth-based event, wedding and commercial photographer. Candid, film-inspired, available worldwide." },

  // ── Hero ─────────────────────────────────────────────────────────────────
  { key: "hero_eyebrow",       value: "Film & Digital Photographer · Perth, WA · Available Worldwide" },
  { key: "hero_title",         value: "Real Moments. Timeless Frames." },
  { key: "hero_subtitle",      value: "Event, wedding and commercial photography shot on digital and film. Perth-based, candid-first, available everywhere." },
  { key: "hero_cta_primary",   value: "View Portfolio" },
  { key: "hero_cta_secondary", value: "Book Now" },
  { key: "brand_statement",    value: "I don't pose people. I read the room and catch what's already there." },

  // ── About ─────────────────────────────────────────────────────────────────
  { key: "about_name",          value: "Matt" },
  { key: "about_tagline",       value: "Film & Digital Photographer · Perth, WA" },
  { key: "about_bio_1",         value: "Based in Perth, Western Australia, Matt started Rift Photography with a camera at a house party and an instinct for real moments. What began as a side project during an engineering degree became one of Perth's most in-demand photography studios — built entirely on word of mouth." },
  { key: "about_bio_2",         value: "His work blends digital precision with a film photographer's eye — warm, candid, and consistent. Whether it's a 21st in the backyard or a Louis Vuitton campaign, the approach doesn't change: show up, read the room, get the shot." },
  { key: "about_stat_1_number", value: "500+" },
  { key: "about_stat_1_label",  value: "Events/Year" },
  { key: "about_stat_2_number", value: "200+" },
  { key: "about_stat_2_label",  value: "★ Reviews" },
  { key: "about_stat_3_number", value: "6+" },
  { key: "about_stat_3_label",  value: "Years" },
  { key: "about_brands",        value: "Toyota, Disney, Louis Vuitton, Mecca, Channel 9" },

  // ── Contact ───────────────────────────────────────────────────────────────
  { key: "contact_email",    value: "matt@riftphotography.com.au" },
  { key: "contact_phone",    value: "+61 4XX XXX XXX" },
  { key: "contact_location", value: "Perth, Western Australia — Available Worldwide" },

  // ── Social ────────────────────────────────────────────────────────────────
  { key: "social_instagram", value: "https://instagram.com/riftphotography" },
  { key: "social_tiktok",    value: "" },
  { key: "social_pinterest", value: "" },
  { key: "social_linkedin",  value: "" },

  // ── Images ────────────────────────────────────────────────────────────────
  { key: "hero_bg_image",    value: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80" },
  { key: "hero_left_image",  value: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80" },
  { key: "hero_right_image", value: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80" },
  { key: "about_portrait",   value: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=800&q=80" },
  { key: "services_hero",    value: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80" },
  { key: "contact_hero",     value: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80" },

  // ── Services ──────────────────────────────────────────────────────────────
  { key: "service_01_title",    value: "Events & Parties" },
  { key: "service_01_tagline",  value: "Birthdays · Milestones · Celebrations" },
  { key: "service_01_price",    value: "Get a quote" },
  { key: "service_01_desc",     value: "Where it all started. Whether it's a 21st in the backyard or a 500-person gala, the approach is the same — move through the room, read the energy, catch what's real." },
  { key: "service_01_includes", value: "2–8 hour coverage\n50–150 photos per hour\nRift Preset colour grade\nOnline gallery within 48hrs\nHigh-res downloads\nOptional photo booth add-on" },

  { key: "service_02_title",    value: "Weddings" },
  { key: "service_02_tagline",  value: "Full-day candid coverage" },
  { key: "service_02_price",    value: "Get a quote" },
  { key: "service_02_desc",     value: "No stiff lineups. No forced smiles. I document your day the way it actually feels — the nerves, the laughs, the look across the room. Film-inspired, honest, yours." },
  { key: "service_02_includes", value: "Full day coverage\nTwo photographers available\n400+ edited images\nRift Preset film grade\nPrivate online gallery\nPrint-ready files" },

  { key: "service_03_title",    value: "Commercial & Brand" },
  { key: "service_03_tagline",  value: "Campaigns · Products · Brand content" },
  { key: "service_03_price",    value: "Get a quote" },
  { key: "service_03_desc",     value: "The same instincts that make great event photography make great commercial work. Trusted by Toyota, Disney, Louis Vuitton, Mecca, and Channel 9 to deliver on deadline." },
  { key: "service_03_includes", value: "Half or full-day rates\nOn-set art direction\nCommercial usage rights\nSame-day selects available\nRetouching & colour grade\nCampaign & social licensing" },

  { key: "service_04_title",    value: "Corporate" },
  { key: "service_04_tagline",  value: "Conferences · Headshots · Launches" },
  { key: "service_04_price",    value: "Get a quote" },
  { key: "service_04_desc",     value: "Professional corporate coverage that doesn't look corporate. Conferences, product launches, team headshots — delivered clean, fast, and ready to use." },
  { key: "service_04_includes", value: "Half or full-day rates\nConference & event coverage\nProfessional headshots\nProduct launch photography\n48hr delivery\nBrand-ready files" },

  { key: "service_05_title",    value: "Pre-Ball & Formals" },
  { key: "service_05_tagline",  value: "Debs · School formals · Group shoots" },
  { key: "service_05_price",    value: "Get a quote" },
  { key: "service_05_desc",     value: "Perth's go-to for pre-ball photography. On-location group shoots that capture the excitement — and deliver a gallery everyone actually wants to share." },
  { key: "service_05_includes", value: "On-location shoot\nGroup & individual shots\nFast 24hr turnaround\nShareable online gallery\nHigh-res downloads\nRift Preset grade" },

  { key: "service_06_title",    value: "Rift Booth" },
  { key: "service_06_tagline",  value: "Photo booth hire · Perth & surrounds" },
  { key: "service_06_price",    value: "Get a quote" },
  { key: "service_06_desc",     value: "Our branded photo booth add-on for events. Instant prints, digital sharing, custom overlays. The thing guests queue for all night." },
  { key: "service_06_includes", value: "2–4 hour hire available\nInstant print option\nDigital sharing station\nCustom branded overlays\nUnlimited sessions\nOn-site booth attendant" },
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
      message: `Seeded ${DEFAULTS.length} site_content keys.`,
      count: DEFAULTS.length,
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
