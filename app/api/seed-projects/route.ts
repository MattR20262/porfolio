import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ─── Projects ───────────────────────────────────────────────────────────── */
const PROJECTS = [
  // ── Events ────────────────────────────────────────────────────────────────
  {
    title: "NYE Gala — Crown Perth",
    slug: "nye-gala-crown-perth",
    category: "events",
    short_description: "500-person New Year's Eve celebration at Crown Perth. Candid coverage across the entire evening — the arrivals, the countdown, the chaos.",
    cover_image: u("photo-1492684223066-81342ee5ff30"),
    location: "Crown Perth, Burswood",
    published: true, featured: true, sort_order: 1,
  },
  {
    title: "Rooftop Birthday — South Perth",
    slug: "rooftop-birthday-south-perth",
    category: "events",
    short_description: "21st birthday party on a rooftop terrace overlooking the Swan River. Three hours of real moments, no direction.",
    cover_image: u("photo-1533174072545-7a4b6ad7a6c3"),
    location: "South Perth",
    published: true, featured: false, sort_order: 2,
  },
  {
    title: "House Party — Cottesloe",
    slug: "house-party-cottesloe",
    category: "events",
    short_description: "Where it all started. 150 people, a backyard, and one camera. The whole night in 80 frames.",
    cover_image: u("photo-1605810230434-7631ac76ec81"),
    location: "Cottesloe, Perth",
    published: true, featured: false, sort_order: 3,
  },

  // ── Weddings ──────────────────────────────────────────────────────────────
  {
    title: "Garden Wedding — Swan Valley",
    slug: "garden-wedding-swan-valley",
    category: "weddings",
    short_description: "Full-day coverage of a relaxed garden ceremony and reception in the Swan Valley. Film-inspired, honest, and completely theirs.",
    cover_image: u("photo-1519741497674-611481863552"),
    location: "Swan Valley, Perth",
    published: true, featured: true, sort_order: 4,
  },
  {
    title: "Coastal Wedding — Cottesloe Beach",
    slug: "coastal-wedding-cottesloe",
    category: "weddings",
    short_description: "Sunset beach ceremony with candid reception coverage at a beachside venue. No posed lineups — just the day as it happened.",
    cover_image: u("photo-1606216794074-735e91aa2c92"),
    location: "Cottesloe Beach, Perth",
    published: true, featured: false, sort_order: 5,
  },

  // ── Commercial ────────────────────────────────────────────────────────────
  {
    title: "Toyota — Brand Campaign",
    slug: "toyota-brand-campaign",
    category: "commercial",
    short_description: "Brand campaign shoot for Toyota Australia. Full-day production with talent, art direction, and multiple location setups.",
    cover_image: u("photo-1542744173-8e7e53415bb0"),
    client_name: "Toyota Australia",
    published: true, featured: true, sort_order: 6,
  },
  {
    title: "Mecca Cosmetica — In-Store",
    slug: "mecca-cosmetica-in-store",
    category: "commercial",
    short_description: "In-store and lifestyle campaign for Mecca Cosmetica across multiple Perth locations. Campaign and social licensing.",
    cover_image: u("photo-1522335789203-aabd1fc54bc9"),
    client_name: "Mecca Cosmetica",
    published: true, featured: false, sort_order: 7,
  },

  // ── Corporate ─────────────────────────────────────────────────────────────
  {
    title: "KPMG Conference — Perth Convention Centre",
    slug: "kpmg-conference-perth",
    category: "corporate",
    short_description: "Full-day conference coverage including keynotes, panels, and networking sessions. 48hr turnaround, brand-ready files.",
    cover_image: u("photo-1511795409834-ef04bbd61622"),
    client_name: "KPMG",
    location: "Perth Convention Centre",
    published: true, featured: true, sort_order: 8,
  },
  {
    title: "Executive Headshots — West Perth",
    slug: "executive-headshots-west-perth",
    category: "corporate",
    short_description: "Executive and team headshots for a 40-person tech company. On-location in their West Perth studio space.",
    cover_image: u("photo-1515187029135-18ee286d815b"),
    location: "West Perth",
    published: true, featured: false, sort_order: 9,
  },

  // ── Portraits ─────────────────────────────────────────────────────────────
  {
    title: "Portrait Session — Fremantle",
    slug: "portrait-session-fremantle",
    category: "portraits",
    short_description: "Film-inspired portrait session through the streets and laneways of Fremantle. Shot on digital with Rift Preset grade.",
    cover_image: u("photo-1531746020798-e6953c6e8e04"),
    location: "Fremantle, Perth",
    published: true, featured: false, sort_order: 10,
  },
  {
    title: "Editorial Portraits — Kings Park",
    slug: "editorial-portraits-kings-park",
    category: "portraits",
    short_description: "Outdoor editorial portrait session at Kings Park. Natural light, minimal direction, maximum authenticity.",
    cover_image: u("photo-1552374196-c4e7ffc6e126"),
    location: "Kings Park, Perth",
    published: true, featured: false, sort_order: 11,
  },

  // ── Pre-Ball ──────────────────────────────────────────────────────────────
  {
    title: "Rossmoyne SHS Formal 2024",
    slug: "rossmoyne-shs-formal-2024",
    category: "preball",
    short_description: "Pre-ball group and couple shoots for Rossmoyne Senior High School's Year 12 formal. On-location at Como Waterfront.",
    cover_image: u("photo-1537633552985-df8429e8048b"),
    location: "Como Waterfront, Perth",
    published: true, featured: true, sort_order: 12,
  },
  {
    title: "Shenton College Deb 2024",
    slug: "shenton-college-deb-2024",
    category: "preball",
    short_description: "Debutante ball pre-shoot for Shenton College — on location at Kings Park with full group and individual coverage.",
    cover_image: u("photo-1490481651871-ab68de25d43d"),
    location: "Kings Park, Perth",
    published: true, featured: false, sort_order: 13,
  },
];

/* ─── Gallery images per project slug ───────────────────────────────────── */
// Each entry: [unsplash_photo_id, alt_text]
const GALLERIES: Record<string, [string, string][]> = {

  "nye-gala-crown-perth": [
    ["photo-1492684223066-81342ee5ff30", "Crowd at NYE Gala"],
    ["photo-1470229722913-7c0e2dbbafd3", "Live performance — NYE Gala"],
    ["photo-1516450360452-9312f5e86fc7", "Celebration countdown"],
    ["photo-1429962714451-bb934ecdc4ec", "Dance floor energy"],
    ["photo-1574391884720-bbc3740c59d1", "Crowd atmosphere"],
    ["photo-1514525253161-7a46d19cd819", "NYE party moments"],
    ["photo-1496024840928-4562b0391e6e", "Stage lights and crowd"],
    ["photo-1533174072545-7a4b6ad7a6c3", "Guests celebrating"],
    ["photo-1605810230434-7631ac76ec81", "Drinks and toasts"],
    ["photo-1551818255-e6e10975bc17", "Rooftop moments"],
  ],

  "rooftop-birthday-south-perth": [
    ["photo-1533174072545-7a4b6ad7a6c3", "Rooftop party atmosphere"],
    ["photo-1551818255-e6e10975bc17", "City views at golden hour"],
    ["photo-1516450360452-9312f5e86fc7", "Birthday celebrations"],
    ["photo-1492684223066-81342ee5ff30", "Friends gathering"],
    ["photo-1605810230434-7631ac76ec81", "Candid moments"],
    ["photo-1514525253161-7a46d19cd819", "Evening light"],
    ["photo-1470229722913-7c0e2dbbafd3", "Night atmosphere"],
    ["photo-1496024840928-4562b0391e6e", "Party energy"],
  ],

  "house-party-cottesloe": [
    ["photo-1605810230434-7631ac76ec81", "Backyard party"],
    ["photo-1516450360452-9312f5e86fc7", "House party energy"],
    ["photo-1533174072545-7a4b6ad7a6c3", "Candid crowd moments"],
    ["photo-1492684223066-81342ee5ff30", "Late night atmosphere"],
    ["photo-1514525253161-7a46d19cd819", "Music and lights"],
    ["photo-1551818255-e6e10975bc17", "Friends and laughter"],
    ["photo-1429962714451-bb934ecdc4ec", "Natural moments"],
  ],

  "garden-wedding-swan-valley": [
    ["photo-1519741497674-611481863552", "Garden ceremony"],
    ["photo-1606216794074-735e91aa2c92", "Wedding couple portrait"],
    ["photo-1583939411023-14756ccc6b4a", "Wedding details"],
    ["photo-1529634806980-85c3dd6d34ac", "Reception moments"],
    ["photo-1520854221256-17f1e38c6a4f", "Floral arrangements"],
    ["photo-1563514227978-3e6e009a1bf7", "Wedding rings"],
    ["photo-1460978812857-0f4a08c76100", "Venue atmosphere"],
    ["photo-1537633552985-df8429e8048b", "Couple dancing"],
    ["photo-1591604021695-0c69b7c05981", "Reception candids"],
    ["photo-1490481651871-ab68de25d43d", "Wedding party"],
  ],

  "coastal-wedding-cottesloe": [
    ["photo-1606216794074-735e91aa2c92", "Beachside ceremony"],
    ["photo-1519741497674-611481863552", "Vows at sunset"],
    ["photo-1529634806980-85c3dd6d34ac", "Beach reception"],
    ["photo-1583939411023-14756ccc6b4a", "Wedding dress details"],
    ["photo-1563514227978-3e6e009a1bf7", "Ring shot"],
    ["photo-1520854221256-17f1e38c6a4f", "Coastal florals"],
    ["photo-1537633552985-df8429e8048b", "Couple at water's edge"],
    ["photo-1591604021695-0c69b7c05981", "Evening celebrations"],
  ],

  "toyota-brand-campaign": [
    ["photo-1542744173-8e7e53415bb0", "Campaign hero shot"],
    ["photo-1560472354-b33ff0c44a43", "Product detail"],
    ["photo-1633613286991-611c41e09042", "On-set production"],
    ["photo-1449965408869-eaa3f722e40d", "Location shot"],
    ["photo-1485291571150-772bcfc10da5", "Creative direction"],
    ["photo-1492144534655-ae79c964c9d7", "Campaign lifestyle"],
    ["photo-1494976388531-d1058494cdd8", "Product showcase"],
    ["photo-1606016159991-dfe4f2746ad5", "Behind the scenes"],
  ],

  "mecca-cosmetica-in-store": [
    ["photo-1522335789203-aabd1fc54bc9", "In-store hero"],
    ["photo-1596462502278-27bfdc403348", "Beauty product flatlay"],
    ["photo-1522337360788-8b13dee7a37e", "Lifestyle portrait"],
    ["photo-1487412947147-5cebf100ffc2", "Studio beauty shot"],
    ["photo-1486308510493-aa64833637bc", "Product detail"],
    ["photo-1598440947619-2c35fc9aa908", "Campaign moment"],
    ["photo-1512496015851-a90fb38ba796", "Beauty lifestyle"],
    ["photo-1516975080664-ed2fc6a32937", "In-store detail"],
  ],

  "kpmg-conference-perth": [
    ["photo-1511795409834-ef04bbd61622", "Conference keynote"],
    ["photo-1515187029135-18ee286d815b", "Panel discussion"],
    ["photo-1573497019940-1c28c88b4f3e", "Networking session"],
    ["photo-1560179707-f14e90ef3623", "Presentation moment"],
    ["photo-1524178232363-53753b5f1fd7", "Audience engagement"],
    ["photo-1507003211169-0a1dd7228f2d", "Speaker close-up"],
    ["photo-1542744094-3a31f272c490", "Conference overview"],
    ["photo-1519389950473-47ba0277781c", "Team discussion"],
    ["photo-1552664730-d307ca884978", "Workshop session"],
  ],

  "executive-headshots-west-perth": [
    ["photo-1515187029135-18ee286d815b", "Executive portrait"],
    ["photo-1507003211169-0a1dd7228f2d", "Professional headshot"],
    ["photo-1573497019940-1c28c88b4f3e", "Team portrait"],
    ["photo-1531746020798-e6953c6e8e04", "Environmental portrait"],
    ["photo-1552374196-c4e7ffc6e126", "Studio headshot"],
    ["photo-1560179707-f14e90ef3623", "Office environment"],
    ["photo-1487412947147-5cebf100ffc2", "Candid working shot"],
  ],

  "portrait-session-fremantle": [
    ["photo-1531746020798-e6953c6e8e04", "Fremantle laneway portrait"],
    ["photo-1552374196-c4e7ffc6e126", "Natural light portrait"],
    ["photo-1488161628813-04240a7b4310", "Street portrait"],
    ["photo-1524504388940-b1c1722653e8", "Lifestyle portrait"],
    ["photo-1520813792240-56fc4a3765a7", "Outdoor portrait"],
    ["photo-1508214751196-bcfd4ca60f91", "Film-inspired portrait"],
    ["photo-1438761681033-6461ffad8d80", "Candid moment"],
    ["photo-1507003211169-0a1dd7228f2d", "Character portrait"],
    ["photo-1487412947147-5cebf100ffc2", "Environmental portrait"],
  ],

  "editorial-portraits-kings-park": [
    ["photo-1552374196-c4e7ffc6e126", "Kings Park editorial"],
    ["photo-1531746020798-e6953c6e8e04", "Natural light editorial"],
    ["photo-1524504388940-b1c1722653e8", "Outdoor portrait session"],
    ["photo-1520813792240-56fc4a3765a7", "Golden hour portrait"],
    ["photo-1508214751196-bcfd4ca60f91", "Film-inspired look"],
    ["photo-1438761681033-6461ffad8d80", "Candid editorial"],
    ["photo-1488161628813-04240a7b4310", "Location portrait"],
    ["photo-1487412947147-5cebf100ffc2", "Editorial close-up"],
  ],

  "rossmoyne-shs-formal-2024": [
    ["photo-1537633552985-df8429e8048b", "Formal couple portrait"],
    ["photo-1490481651871-ab68de25d43d", "Group formal shot"],
    ["photo-1519741497674-611481863552", "Pre-ball arrivals"],
    ["photo-1606216794074-735e91aa2c92", "Couple at waterfront"],
    ["photo-1583939411023-14756ccc6b4a", "Formal details"],
    ["photo-1529634806980-85c3dd6d34ac", "Group celebration"],
    ["photo-1520854221256-17f1e38c6a4f", "Floral corsages"],
    ["photo-1591604021695-0c69b7c05981", "Pre-ball energy"],
  ],

  "shenton-college-deb-2024": [
    ["photo-1490481651871-ab68de25d43d", "Deb group at Kings Park"],
    ["photo-1537633552985-df8429e8048b", "Debutante couple portrait"],
    ["photo-1606216794074-735e91aa2c92", "Formal group shot"],
    ["photo-1519741497674-611481863552", "Individual debutante portrait"],
    ["photo-1583939411023-14756ccc6b4a", "Formal dress detail"],
    ["photo-1529634806980-85c3dd6d34ac", "Group celebration"],
    ["photo-1591604021695-0c69b7c05981", "Pre-ball excitement"],
  ],
};

/* ─── Seed route ─────────────────────────────────────────────────────────── */
export async function POST(req: Request) {
  try {
    const supabase = await createAdminClient();

    // Allow ?force=true to wipe and re-seed
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    if (force) {
      // Delete existing demo projects (identified by slug)
      const slugs = PROJECTS.map((p) => p.slug);
      await supabase.from("projects").delete().in("slug", slugs);
    } else {
      // Skip if any projects already exist
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true });
      if ((count ?? 0) > 0) {
        return NextResponse.json(
          { message: `Skipped — ${count} projects already exist. Use ?force=true to re-seed.` },
          { status: 200 }
        );
      }
    }

    // 1 ── Insert projects
    const { data: inserted, error: projErr } = await supabase
      .from("projects")
      .insert(PROJECTS)
      .select("id, slug");

    if (projErr || !inserted) {
      console.error("Project insert error:", projErr);
      return NextResponse.json({ error: projErr?.message ?? "Insert failed" }, { status: 500 });
    }

    // 2 ── Build project_media rows
    const slugToId: Record<string, string> = {};
    for (const row of inserted) {
      slugToId[row.slug] = row.id;
    }

    const mediaRows: {
      project_id: string;
      media_type: string;
      url: string;
      alt_text: string;
      sort_order: number;
    }[] = [];

    for (const [slug, images] of Object.entries(GALLERIES)) {
      const projectId = slugToId[slug];
      if (!projectId) continue;

      images.forEach(([photoId, alt], idx) => {
        mediaRows.push({
          project_id: projectId,
          media_type: "image",
          url: u(photoId),
          alt_text: alt,
          sort_order: idx + 1,
        });
      });
    }

    // 3 ── Insert gallery images
    const { error: mediaErr } = await supabase
      .from("project_media")
      .insert(mediaRows);

    if (mediaErr) {
      console.error("Media insert error:", mediaErr);
      // Projects seeded OK — just log the media error, don't fail the whole thing
    }

    return NextResponse.json({
      message: `Seeded ${inserted.length} projects with ${mediaRows.length} gallery images.`,
      projects: inserted.length,
      images: mediaRows.length,
    }, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
