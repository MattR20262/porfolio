import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import HomePageScroll from "@/components/public/HomePageScroll";

export const dynamic = "force-dynamic";

/* ── Dynamic SEO ─────────────────────────────────────────────────── */
export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", ["seo_title", "seo_description"]);

  const map: Record<string, string> = {};
  data?.forEach((row) => { map[row.key] = row.value; });

  return {
    title: map.seo_title || "Rift Photography — Matt | Perth, WA",
    description: map.seo_description || "",
  };
}

/* ── Helper ──────────────────────────────────────────────────────── */
function splitHeroTitle(title: string): [string, string] {
  const words = title.trim().split(" ");
  if (words.length <= 2) return [title, ""];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

/* ── Page ────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: testimonials }, { data: projects }, { data: contentRows }] =
    await Promise.all([
      supabase.from("testimonials").select("*").eq("featured", true).order("sort_order"),
      supabase
        .from("projects")
        .select("id,title,slug,category,cover_image")
        .eq("featured", true)
        .eq("published", true)
        .limit(6),
      supabase.from("site_content").select("key, value"),
    ]);

  const content: Record<string, string> = {};
  contentRows?.forEach((row) => { content[row.key] = row.value; });

  const heroEyebrow      = content.hero_eyebrow      || "Film & Digital Photographer · Perth, WA · Available Worldwide";
  const heroTitle        = content.hero_title         || "Real Moments. Timeless Frames.";
  const heroSubtitle     = content.hero_subtitle      || "Event, wedding and commercial photography shot on digital and film. Perth-based, candid-first, available everywhere.";
  const heroCTAPrimary   = content.hero_cta_primary   || "View Portfolio";
  const heroCTASecondary = content.hero_cta_secondary || "Book Now";
  const brandStatement   = content.brand_statement    || "I don't pose people. I read the room and catch what's already there.";
  const aboutName        = content.about_name         || "Matt";

  const heroBgImage    = content.hero_bg_image    || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80";
  const heroLeftImage  = content.hero_left_image  || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80";
  const heroRightImage = content.hero_right_image || "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80";

  const [titleLine1, titleLine2] = splitHeroTitle(heroTitle);

  return (
    <HomePageScroll
      eyebrow={heroEyebrow}
      titleLine1={titleLine1}
      titleLine2={titleLine2}
      subtitle={heroSubtitle}
      ctaPrimary={heroCTAPrimary}
      ctaSecondary={heroCTASecondary}
      brandStatement={brandStatement}
      aboutName={aboutName}
      projects={projects ?? []}
      testimonials={testimonials ?? []}
      bgImage={heroBgImage}
      leftImage={heroLeftImage}
      rightImage={heroRightImage}
    />
  );
}
