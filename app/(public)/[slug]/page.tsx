import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("title, seo_title, seo_description")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!data) return { title: "Page Not Found" };
  return {
    title: data.seo_title || `${data.title} — Matt Ashford Photography`,
    description: data.seo_description || "",
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!page) notFound();

  return (
    <>
      {/* Header */}
      <section style={{
        paddingTop: "140px",
        paddingBottom: "3rem",
        paddingLeft: "clamp(1.5rem, 8vw, 8rem)",
        paddingRight: "clamp(1.5rem, 8vw, 8rem)",
        background: "#080808",
      }}>
        <Link href="/" style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          color: "#6b6b6b", textDecoration: "none",
          fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
          fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase",
          transition: "color 0.3s", marginBottom: "2rem",
        }}
          onMouseEnter={undefined}
        >
          <ArrowLeft size={13} /> Home
        </Link>
        <h1 className="text-display" style={{ marginBottom: "1rem" }}>{page.title}</h1>
        <div className="gold-divider" />
      </section>

      {/* Content */}
      <section style={{
        padding: "4rem clamp(1.5rem, 8vw, 8rem) 8rem",
        maxWidth: "900px",
      }}>
        <div
          className="page-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </section>

      <style>{`
        .page-content { color: #c8c8c8; font-size: 1rem; line-height: 1.9; }
        .page-content h1, .page-content h2, .page-content h3, .page-content h4 {
          font-family: var(--font-cormorant), 'Cormorant Garamond', serif;
          font-weight: 300; color: #f5f3ef; margin: 2.5rem 0 1rem;
          line-height: 1.2;
        }
        .page-content h1 { font-size: clamp(2rem, 4vw, 3rem); }
        .page-content h2 { font-size: clamp(1.6rem, 3vw, 2.2rem); }
        .page-content h3 { font-size: 1.4rem; }
        .page-content p { margin-bottom: 1.2rem; }
        .page-content ul, .page-content ol { padding-left: 1.5rem; margin-bottom: 1.2rem; }
        .page-content li { margin-bottom: 0.5rem; }
        .page-content a { color: #c9a84c; text-decoration: none; border-bottom: 1px solid rgba(201,168,76,0.4); transition: border-color 0.3s; }
        .page-content a:hover { border-color: #c9a84c; }
        .page-content strong { color: #f5f3ef; font-weight: 600; }
        .page-content em { font-style: italic; color: #9a9a9a; }
        .page-content blockquote {
          border-left: 2px solid #c9a84c; padding-left: 1.5rem; margin: 2rem 0;
          font-family: var(--font-cormorant), serif; font-size: 1.3rem; color: #9a9a9a; font-style: italic;
        }
        .page-content hr { border: none; border-top: 1px solid rgba(201,168,76,0.15); margin: 2.5rem 0; }
        .page-content table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
        .page-content th { text-align: left; padding: 0.6rem 1rem; background: #1a1a1a; color: #c9a84c;
          font-family: var(--font-montserrat), sans-serif; font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase; }
        .page-content td { padding: 0.7rem 1rem; border-bottom: 1px solid rgba(245,243,239,0.06); }
      `}</style>
    </>
  );
}
