import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ContactContent from "@/components/public/ContactContent";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact — Matt Ashford Photography" };

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", ["contact_email", "contact_phone", "contact_location", "social_instagram", "contact_hero"]);

  const c: Record<string, string> = {};
  rows?.forEach((row) => { c[row.key] = row.value; });

  return (
    <ContactContent
      contactEmail={c.contact_email    || "hello@mattstudio.com"}
      contactPhone={c.contact_phone    || "+1 (917) 555-0142"}
      contactLocation={c.contact_location || "New York City — Available Worldwide"}
      socialInstagram={c.social_instagram || ""}
      heroImage={c.contact_hero || ""}
    />
  );
}
