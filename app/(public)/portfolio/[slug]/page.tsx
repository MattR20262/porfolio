import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProjectGallery from "@/components/public/ProjectGallery";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ─── Demo project data ────────────────────────────────────────────────────
   Shown immediately when the DB hasn't been seeded yet.
   Mirrors the data in /api/seed-projects/route.ts
   ────────────────────────────────────────────────────────────────────────── */
const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const DEMO_PROJECTS: Record<string, {
  title: string; category: string; short_description: string;
  cover_image: string; location?: string; client_name?: string;
}> = {
  "nye-gala-crown-perth":         { title: "NYE Gala — Crown Perth",             category: "events",     location: "Crown Perth, Burswood",        short_description: "500-person New Year's Eve celebration at Crown Perth. Candid coverage across the entire evening — the arrivals, the countdown, the chaos.",                            cover_image: u("photo-1492684223066-81342ee5ff30") },
  "rooftop-birthday-south-perth": { title: "Rooftop Birthday — South Perth",     category: "events",     location: "South Perth",                  short_description: "21st birthday party on a rooftop terrace overlooking the Swan River. Three hours of real moments, no direction.",                                                     cover_image: u("photo-1533174072545-7a4b6ad7a6c3") },
  "house-party-cottesloe":        { title: "House Party — Cottesloe",             category: "events",     location: "Cottesloe, Perth",             short_description: "Where it all started. 150 people, a backyard, and one camera. The whole night in 80 frames.",                                                                          cover_image: u("photo-1605810230434-7631ac76ec81") },
  "garden-wedding-swan-valley":   { title: "Garden Wedding — Swan Valley",        category: "weddings",   location: "Swan Valley, Perth",           short_description: "Full-day coverage of a relaxed garden ceremony and reception in the Swan Valley. Film-inspired, honest, and completely theirs.",                                      cover_image: u("photo-1519741497674-611481863552") },
  "coastal-wedding-cottesloe":    { title: "Coastal Wedding — Cottesloe Beach",   category: "weddings",   location: "Cottesloe Beach, Perth",       short_description: "Sunset beach ceremony with candid reception coverage at a beachside venue. No posed lineups — just the day as it happened.",                                          cover_image: u("photo-1606216794074-735e91aa2c92") },
  "toyota-brand-campaign":        { title: "Toyota — Brand Campaign",             category: "commercial", client_name: "Toyota Australia",          short_description: "Brand campaign shoot for Toyota Australia. Full-day production with talent, art direction, and multiple location setups.",                                              cover_image: u("photo-1542744173-8e7e53415bb0") },
  "mecca-cosmetica-in-store":     { title: "Mecca Cosmetica — In-Store",          category: "commercial", client_name: "Mecca Cosmetica",           short_description: "In-store and lifestyle campaign for Mecca Cosmetica across multiple Perth locations. Campaign and social licensing.",                                                 cover_image: u("photo-1522335789203-aabd1fc54bc9") },
  "kpmg-conference-perth":        { title: "KPMG Conference — Perth Convention",  category: "corporate",  client_name: "KPMG",                      short_description: "Full-day conference coverage including keynotes, panels, and networking sessions. 48hr turnaround, brand-ready files.",                                              cover_image: u("photo-1511795409834-ef04bbd61622") },
  "executive-headshots-west-perth":{ title: "Executive Headshots — West Perth",  category: "corporate",  location: "West Perth",                   short_description: "Executive and team headshots for a 40-person tech company. On-location in their West Perth studio space.",                                                            cover_image: u("photo-1515187029135-18ee286d815b") },
  "portrait-session-fremantle":   { title: "Portrait Session — Fremantle",        category: "portraits",  location: "Fremantle, Perth",             short_description: "Film-inspired portrait session through the streets and laneways of Fremantle. Shot on digital with Rift Preset grade.",                                              cover_image: u("photo-1531746020798-e6953c6e8e04") },
  "editorial-portraits-kings-park":{ title: "Editorial Portraits — Kings Park",   category: "portraits",  location: "Kings Park, Perth",            short_description: "Outdoor editorial portrait session at Kings Park. Natural light, minimal direction, maximum authenticity.",                                                             cover_image: u("photo-1552374196-c4e7ffc6e126") },
  "rossmoyne-shs-formal-2024":    { title: "Rossmoyne SHS Formal 2024",           category: "preball",    location: "Como Waterfront, Perth",       short_description: "Pre-ball group and couple shoots for Rossmoyne Senior High School's Year 12 formal. On-location at Como Waterfront.",                                               cover_image: u("photo-1537633552985-df8429e8048b") },
  "shenton-college-deb-2024":     { title: "Shenton College Deb 2024",            category: "preball",    location: "Kings Park, Perth",            short_description: "Debutante ball pre-shoot for Shenton College — on location at Kings Park with full group and individual coverage.",                                                   cover_image: u("photo-1490481651871-ab68de25d43d") },
};

const DEMO_GALLERIES: Record<string, Array<{ url: string; alt: string }>> = {
  "nye-gala-crown-perth": [
    { url: u("photo-1492684223066-81342ee5ff30"), alt: "Crowd at NYE Gala" },
    { url: u("photo-1470229722913-7c0e2dbbafd3"), alt: "Live performance — NYE Gala" },
    { url: u("photo-1516450360452-9312f5e86fc7"), alt: "Celebration countdown" },
    { url: u("photo-1429962714451-bb934ecdc4ec"), alt: "Dance floor energy" },
    { url: u("photo-1574391884720-bbc3740c59d1"), alt: "Crowd atmosphere" },
    { url: u("photo-1514525253161-7a46d19cd819"), alt: "NYE party moments" },
    { url: u("photo-1496024840928-4562b0391e6e"), alt: "Stage lights and crowd" },
    { url: u("photo-1533174072545-7a4b6ad7a6c3"), alt: "Guests celebrating" },
    { url: u("photo-1605810230434-7631ac76ec81"), alt: "Drinks and toasts" },
    { url: u("photo-1551818255-e6e10975bc17"), alt: "Rooftop moments" },
  ],
  "rooftop-birthday-south-perth": [
    { url: u("photo-1533174072545-7a4b6ad7a6c3"), alt: "Rooftop party atmosphere" },
    { url: u("photo-1551818255-e6e10975bc17"), alt: "City views at golden hour" },
    { url: u("photo-1516450360452-9312f5e86fc7"), alt: "Birthday celebrations" },
    { url: u("photo-1492684223066-81342ee5ff30"), alt: "Friends gathering" },
    { url: u("photo-1605810230434-7631ac76ec81"), alt: "Candid moments" },
    { url: u("photo-1514525253161-7a46d19cd819"), alt: "Evening light" },
    { url: u("photo-1470229722913-7c0e2dbbafd3"), alt: "Night atmosphere" },
    { url: u("photo-1496024840928-4562b0391e6e"), alt: "Party energy" },
  ],
  "house-party-cottesloe": [
    { url: u("photo-1605810230434-7631ac76ec81"), alt: "Backyard party" },
    { url: u("photo-1516450360452-9312f5e86fc7"), alt: "House party energy" },
    { url: u("photo-1533174072545-7a4b6ad7a6c3"), alt: "Candid crowd moments" },
    { url: u("photo-1492684223066-81342ee5ff30"), alt: "Late night atmosphere" },
    { url: u("photo-1514525253161-7a46d19cd819"), alt: "Music and lights" },
    { url: u("photo-1551818255-e6e10975bc17"), alt: "Friends and laughter" },
    { url: u("photo-1429962714451-bb934ecdc4ec"), alt: "Natural moments" },
  ],
  "garden-wedding-swan-valley": [
    { url: u("photo-1519741497674-611481863552"), alt: "Garden ceremony" },
    { url: u("photo-1606216794074-735e91aa2c92"), alt: "Wedding couple portrait" },
    { url: u("photo-1583939411023-14756ccc6b4a"), alt: "Wedding details" },
    { url: u("photo-1529634806980-85c3dd6d34ac"), alt: "Reception moments" },
    { url: u("photo-1520854221256-17f1e38c6a4f"), alt: "Floral arrangements" },
    { url: u("photo-1563514227978-3e6e009a1bf7"), alt: "Wedding rings" },
    { url: u("photo-1460978812857-0f4a08c76100"), alt: "Venue atmosphere" },
    { url: u("photo-1537633552985-df8429e8048b"), alt: "Couple dancing" },
    { url: u("photo-1591604021695-0c69b7c05981"), alt: "Reception candids" },
    { url: u("photo-1490481651871-ab68de25d43d"), alt: "Wedding party" },
  ],
  "coastal-wedding-cottesloe": [
    { url: u("photo-1606216794074-735e91aa2c92"), alt: "Beachside ceremony" },
    { url: u("photo-1519741497674-611481863552"), alt: "Vows at sunset" },
    { url: u("photo-1529634806980-85c3dd6d34ac"), alt: "Beach reception" },
    { url: u("photo-1583939411023-14756ccc6b4a"), alt: "Wedding dress details" },
    { url: u("photo-1563514227978-3e6e009a1bf7"), alt: "Ring shot" },
    { url: u("photo-1520854221256-17f1e38c6a4f"), alt: "Coastal florals" },
    { url: u("photo-1537633552985-df8429e8048b"), alt: "Couple at water's edge" },
    { url: u("photo-1591604021695-0c69b7c05981"), alt: "Evening celebrations" },
  ],
  "toyota-brand-campaign": [
    { url: u("photo-1542744173-8e7e53415bb0"), alt: "Campaign hero shot" },
    { url: u("photo-1560472354-b33ff0c44a43"), alt: "Product detail" },
    { url: u("photo-1633613286991-611c41e09042"), alt: "On-set production" },
    { url: u("photo-1449965408869-eaa3f722e40d"), alt: "Location shot" },
    { url: u("photo-1485291571150-772bcfc10da5"), alt: "Creative direction" },
    { url: u("photo-1492144534655-ae79c964c9d7"), alt: "Campaign lifestyle" },
    { url: u("photo-1494976388531-d1058494cdd8"), alt: "Product showcase" },
    { url: u("photo-1606016159991-dfe4f2746ad5"), alt: "Behind the scenes" },
  ],
  "mecca-cosmetica-in-store": [
    { url: u("photo-1522335789203-aabd1fc54bc9"), alt: "In-store hero" },
    { url: u("photo-1596462502278-27bfdc403348"), alt: "Beauty product flatlay" },
    { url: u("photo-1522337360788-8b13dee7a37e"), alt: "Lifestyle portrait" },
    { url: u("photo-1487412947147-5cebf100ffc2"), alt: "Studio beauty shot" },
    { url: u("photo-1486308510493-aa64833637bc"), alt: "Product detail" },
    { url: u("photo-1598440947619-2c35fc9aa908"), alt: "Campaign moment" },
    { url: u("photo-1512496015851-a90fb38ba796"), alt: "Beauty lifestyle" },
    { url: u("photo-1516975080664-ed2fc6a32937"), alt: "In-store detail" },
  ],
  "kpmg-conference-perth": [
    { url: u("photo-1511795409834-ef04bbd61622"), alt: "Conference keynote" },
    { url: u("photo-1515187029135-18ee286d815b"), alt: "Panel discussion" },
    { url: u("photo-1573497019940-1c28c88b4f3e"), alt: "Networking session" },
    { url: u("photo-1560179707-f14e90ef3623"), alt: "Presentation moment" },
    { url: u("photo-1524178232363-53753b5f1fd7"), alt: "Audience engagement" },
    { url: u("photo-1507003211169-0a1dd7228f2d"), alt: "Speaker close-up" },
    { url: u("photo-1542744094-3a31f272c490"), alt: "Conference overview" },
    { url: u("photo-1519389950473-47ba0277781c"), alt: "Team discussion" },
  ],
  "executive-headshots-west-perth": [
    { url: u("photo-1515187029135-18ee286d815b"), alt: "Executive portrait" },
    { url: u("photo-1507003211169-0a1dd7228f2d"), alt: "Professional headshot" },
    { url: u("photo-1573497019940-1c28c88b4f3e"), alt: "Team portrait" },
    { url: u("photo-1531746020798-e6953c6e8e04"), alt: "Environmental portrait" },
    { url: u("photo-1552374196-c4e7ffc6e126"), alt: "Studio headshot" },
    { url: u("photo-1560179707-f14e90ef3623"), alt: "Office environment" },
  ],
  "portrait-session-fremantle": [
    { url: u("photo-1531746020798-e6953c6e8e04"), alt: "Fremantle laneway portrait" },
    { url: u("photo-1552374196-c4e7ffc6e126"), alt: "Natural light portrait" },
    { url: u("photo-1488161628813-04240a7b4310"), alt: "Street portrait" },
    { url: u("photo-1524504388940-b1c1722653e8"), alt: "Lifestyle portrait" },
    { url: u("photo-1520813792240-56fc4a3765a7"), alt: "Outdoor portrait" },
    { url: u("photo-1508214751196-bcfd4ca60f91"), alt: "Film-inspired portrait" },
    { url: u("photo-1438761681033-6461ffad8d80"), alt: "Candid moment" },
    { url: u("photo-1507003211169-0a1dd7228f2d"), alt: "Character portrait" },
  ],
  "editorial-portraits-kings-park": [
    { url: u("photo-1552374196-c4e7ffc6e126"), alt: "Kings Park editorial" },
    { url: u("photo-1531746020798-e6953c6e8e04"), alt: "Natural light editorial" },
    { url: u("photo-1524504388940-b1c1722653e8"), alt: "Outdoor portrait session" },
    { url: u("photo-1520813792240-56fc4a3765a7"), alt: "Golden hour portrait" },
    { url: u("photo-1508214751196-bcfd4ca60f91"), alt: "Film-inspired look" },
    { url: u("photo-1438761681033-6461ffad8d80"), alt: "Candid editorial" },
    { url: u("photo-1488161628813-04240a7b4310"), alt: "Location portrait" },
  ],
  "rossmoyne-shs-formal-2024": [
    { url: u("photo-1537633552985-df8429e8048b"), alt: "Formal couple portrait" },
    { url: u("photo-1490481651871-ab68de25d43d"), alt: "Group formal shot" },
    { url: u("photo-1519741497674-611481863552"), alt: "Pre-ball arrivals" },
    { url: u("photo-1606216794074-735e91aa2c92"), alt: "Couple at waterfront" },
    { url: u("photo-1583939411023-14756ccc6b4a"), alt: "Formal details" },
    { url: u("photo-1529634806980-85c3dd6d34ac"), alt: "Group celebration" },
    { url: u("photo-1520854221256-17f1e38c6a4f"), alt: "Floral corsages" },
    { url: u("photo-1591604021695-0c69b7c05981"), alt: "Pre-ball energy" },
  ],
  "shenton-college-deb-2024": [
    { url: u("photo-1490481651871-ab68de25d43d"), alt: "Deb group at Kings Park" },
    { url: u("photo-1537633552985-df8429e8048b"), alt: "Debutante couple portrait" },
    { url: u("photo-1606216794074-735e91aa2c92"), alt: "Formal group shot" },
    { url: u("photo-1519741497674-611481863552"), alt: "Individual debutante portrait" },
    { url: u("photo-1583939411023-14756ccc6b4a"), alt: "Formal dress detail" },
    { url: u("photo-1529634806980-85c3dd6d34ac"), alt: "Group celebration" },
    { url: u("photo-1591604021695-0c69b7c05981"), alt: "Pre-ball excitement" },
  ],
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title, seo_title, seo_description, cover_image")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  // Fall back to demo data for metadata
  const demo = DEMO_PROJECTS[slug];
  const title = project?.seo_title || project?.title || demo?.title;
  if (!title) return { title: "Project Not Found" };

  return {
    title: `${title} — Rift Photography`,
    description: project?.seo_description || demo?.short_description || "",
    openGraph: (project?.cover_image || demo?.cover_image)
      ? { images: [project?.cover_image || demo!.cover_image] }
      : undefined,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: media }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single(),
    supabase
      .from("project_media")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  // ── Fallback: use demo data if the DB hasn't been seeded yet ──────────────
  const demo = DEMO_PROJECTS[slug];

  if (!project && !demo) notFound();

  // Resolve which data source to use
  const isDemo = !project;
  const title            = project?.title            ?? demo!.title;
  const category         = project?.category         ?? demo!.category;
  const short_description= project?.short_description?? demo!.short_description;
  const cover_image      = project?.cover_image      ?? demo!.cover_image;
  const location         = project?.location         ?? demo?.location;
  const client_name      = project?.client_name      ?? demo?.client_name;
  const full_description = project?.full_description ?? null;
  const shoot_date       = project?.shoot_date       ?? null;

  // ── Build image list ───────────────────────────────────────────────────────
  const allImages: Array<{ url: string; alt: string }> = [];

  if (isDemo) {
    // Use curated demo gallery
    allImages.push(...(DEMO_GALLERIES[slug] ?? [{ url: cover_image, alt: title }]));
  } else {
    // Real DB project: cover first, then gallery images (deduped)
    if (cover_image) allImages.push({ url: cover_image, alt: title });
    const projectMedia = (media ?? []).filter(
      (m: { project_id: string }) => m.project_id === project!.id
    );
    for (const item of projectMedia) {
      if (item.media_type === "image" && item.url !== cover_image) {
        allImages.push({ url: item.url, alt: item.alt_text || title });
      }
    }
  }

  const formattedDate = shoot_date
    ? new Date(shoot_date).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <>
      {/* ── BACK NAV ────────────────────────────────────────── */}
      <div style={{ padding: "100px clamp(1.5rem, 8vw, 8rem) 0" }}>
        <Link
          href="/portfolio"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#6b6b6b",
            textDecoration: "none",
            fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "3rem",
          }}
        >
          <ArrowLeft size={13} />
          Portfolio
        </Link>
      </div>

      {/* ── PROJECT HEADER ──────────────────────────────────── */}
      <section style={{ padding: "0 clamp(1.5rem, 8vw, 8rem) 4rem", background: "#080808" }}>
        <div style={{ maxWidth: "720px" }}>
          <p className="text-eyebrow" style={{ marginBottom: "1rem", textTransform: "capitalize" }}>
            {category}
          </p>
          <h1 className="text-display" style={{ marginBottom: "1.5rem", lineHeight: 1.1 }}>
            {title}
          </h1>

          {/* Meta row */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "1.5rem",
            marginBottom: short_description ? "2rem" : 0,
          }}>
            {formattedDate && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#6b6b6b", fontSize: "0.8rem", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                <Calendar size={12} /> {formattedDate}
              </span>
            )}
            {location && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#6b6b6b", fontSize: "0.8rem", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                <MapPin size={12} /> {location}
              </span>
            )}
            {client_name && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#6b6b6b", fontSize: "0.8rem", fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                <User size={12} /> {client_name}
              </span>
            )}
          </div>

          {short_description && (
            <p style={{ color: "#9a9a9a", fontSize: "1rem", lineHeight: 1.8, maxWidth: "600px" }}>
              {short_description}
            </p>
          )}
        </div>
      </section>

      {/* ── GALLERY ─────────────────────────────────────────── */}
      {allImages.length > 0 ? (
        <ProjectGallery images={allImages} />
      ) : (
        <div style={{ padding: "4rem clamp(1.5rem, 8vw, 8rem)", color: "#6b6b6b", textAlign: "center" }}>
          No photos yet.
        </div>
      )}

      {/* ── FULL DESCRIPTION ────────────────────────────────── */}
      {full_description && (
        <section style={{ padding: "6rem clamp(1.5rem, 8vw, 8rem)", background: "#0d0d0d", borderTop: "1px solid rgba(201,168,76,0.08)" }}>
          <div style={{ maxWidth: "640px" }}>
            <p style={{ color: "#c8c8c8", fontSize: "1rem", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {full_description}
            </p>
          </div>
        </section>
      )}

      {/* ── BOOK CTA ────────────────────────────────────────── */}
      <section style={{ padding: "8rem clamp(1.5rem, 8vw, 8rem)", textAlign: "center", background: "linear-gradient(135deg, #080808 0%, #1a1510 100%)" }}>
        <p className="text-eyebrow" style={{ marginBottom: "1.5rem" }}>Work Together</p>
        <h2 className="text-heading" style={{ marginBottom: "2rem", maxWidth: "500px", margin: "0 auto 2rem" }}>
          Interested in Working Together?
        </h2>
        <Link href="/booking" className="btn btn-primary">Book a Session</Link>
      </section>
    </>
  );
}
