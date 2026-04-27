import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CustomCursor from "@/components/public/CustomCursor";
import ScrollRestoration from "@/components/public/ScrollRestoration";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data: rows }, { data: navPages }] = await Promise.all([
    supabase
      .from("site_content")
      .select("key, value")
      .in("key", [
        "contact_email",
        "contact_phone",
        "contact_location",
        "social_instagram",
        "social_tiktok",
        "social_pinterest",
        "social_linkedin",
        "hero_subtitle",
        "about_name",
      ]),
    supabase
      .from("pages")
      .select("title, slug, nav_parent")
      .eq("show_in_nav", true)
      .eq("published", true)
      .order("sort_order", { ascending: true }),
  ]);

  const c: Record<string, string> = {};
  rows?.forEach((row) => { c[row.key] = row.value; });

  return (
    <>
      <ScrollRestoration />
      <CustomCursor />
      <Navbar navPages={navPages ?? []} />
      <main>{children}</main>
      <Footer
        contactEmail={c.contact_email}
        contactPhone={c.contact_phone}
        contactLocation={c.contact_location}
        socialInstagram={c.social_instagram}
        socialTiktok={c.social_tiktok}
        socialPinterest={c.social_pinterest}
        socialLinkedin={c.social_linkedin}
        heroSubtitle={c.hero_subtitle}
        aboutName={c.about_name}
      />
    </>
  );
}
