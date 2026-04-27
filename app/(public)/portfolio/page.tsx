"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
// Only the fields the grid actually needs
interface DisplayProject {
  id: string;
  title: string;
  slug: string;
  category: string;
  cover_image: string | null;
  featured: boolean;
}

const categories = [
  { label: "All Work",   value: "all" },
  { label: "Events",     value: "events" },
  { label: "Weddings",   value: "weddings" },
  { label: "Commercial", value: "commercial" },
  { label: "Corporate",  value: "corporate" },
  { label: "Portraits",  value: "portraits" },
  { label: "Pre-Ball",   value: "preball" },
];

const DEMO_PROJECTS: DisplayProject[] = [
  { id: "d01", title: "NYE Gala — Crown Perth",           slug: "nye-gala-crown-perth",          category: "events",     cover_image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80", featured: true  },
  { id: "d02", title: "Rooftop Birthday — South Perth",   slug: "rooftop-birthday-south-perth",  category: "events",     cover_image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d03", title: "House Party — Cottesloe",          slug: "house-party-cottesloe",         category: "events",     cover_image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d04", title: "Garden Wedding — Swan Valley",     slug: "garden-wedding-swan-valley",    category: "weddings",   cover_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80", featured: true  },
  { id: "d05", title: "Coastal Wedding — Cottesloe",      slug: "coastal-wedding-cottesloe",     category: "weddings",   cover_image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d06", title: "Toyota — Brand Campaign",          slug: "toyota-brand-campaign",         category: "commercial", cover_image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80", featured: true  },
  { id: "d07", title: "Mecca Cosmetica — Campaign",       slug: "mecca-cosmetica-in-store",      category: "commercial", cover_image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d08", title: "KPMG Conference — Perth",          slug: "kpmg-conference-perth",         category: "corporate",  cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80", featured: true  },
  { id: "d09", title: "Executive Headshots — West Perth", slug: "executive-headshots-west-perth",category: "corporate",  cover_image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d10", title: "Portrait Session — Fremantle",     slug: "portrait-session-fremantle",    category: "portraits",  cover_image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d11", title: "Editorial Portraits — Kings Park", slug: "editorial-portraits-kings-park",category: "portraits",  cover_image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=900&q=80", featured: false },
  { id: "d12", title: "Rossmoyne SHS Formal 2024",        slug: "rossmoyne-shs-formal-2024",     category: "preball",    cover_image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=900&q=80", featured: true  },
  { id: "d13", title: "Shenton College Deb 2024",         slug: "shenton-college-deb-2024",      category: "preball",    cover_image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80", featured: false },
];

function PortfolioContent() {
  const searchParams    = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";

  const [dbProjects,     setDbProjects]     = useState<DisplayProject[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [loading,        setLoading]        = useState(true);
  const [seeding,        setSeeding]        = useState(false); // used inside load()

  async function load() {
    const supabase = createClient();

    // Check TOTAL project count (published + drafts) to decide whether to seed
    const { count: totalCount } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true });

    // Only auto-seed demo projects if the DB is completely empty
    if ((totalCount ?? 0) === 0 && !seeding) {
      setSeeding(true);
      try {
        await fetch("/api/seed-projects", { method: "POST" });
      } catch { /* silent */ }
      setSeeding(false);
    }

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    setDbProjects(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Always have something to show — real DB projects, or demo cards while seeding
  const projects = dbProjects.length > 0 ? dbProjects : DEMO_PROJECTS;

  const filtered =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section
        style={{
          paddingTop: "140px",
          paddingBottom: "4rem",
          paddingLeft: "clamp(1.5rem, 8vw, 8rem)",
          paddingRight: "clamp(1.5rem, 8vw, 8rem)",
          background: "#0e0c09",
        }}
      >
        <p className="text-eyebrow" style={{ marginBottom: "1rem" }}>The Work</p>
        <h1 className="text-display" style={{ marginBottom: "1rem" }}>Portfolio</h1>
        <div className="gold-divider" />
      </section>

      {/* ── Category filter ───────────────────────────────────────── */}
      <div
        style={{
          padding: "1.5rem clamp(1.5rem, 8vw, 8rem) 3rem",
          position: "sticky",
          top: "72px",
          background: "#0e0c09",
          zIndex: 10,
          borderBottom: "1px solid rgba(200,146,74,0.1)",
        }}
      >
        <div className="filter-bar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-btn${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────── */}
      <section style={{ padding: "3rem clamp(1.5rem, 8vw, 8rem) 6rem" }}>
        {filtered.length === 0 ? (
          <div style={{ color: "#6b6560", textAlign: "center", padding: "6rem" }}>
            <p style={{ marginBottom: "1rem" }}>No projects in this category yet.</p>
            <button className="filter-btn active" onClick={() => setActiveCategory("all")}>
              View All Work
            </button>
          </div>
        ) : (
          <div className="masonry-grid">
            {filtered.map((project, i) => (
              // Every card is a real link — slug pages handle demo fallback gracefully
              <Link
                key={project.id}
                href={`/portfolio/${project.slug}`}
                className="masonry-item masonry-link"
                style={{ display: "block", textDecoration: "none" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.cover_image ?? ""}
                  alt={project.title}
                  loading={i < 4 ? "eager" : "lazy"}
                  style={{ width: "100%", display: "block" }}
                />
                <div className="masonry-info">
                  <p className="text-eyebrow" style={{ textTransform: "capitalize", marginBottom: "0.4rem" }}>
                    {project.category}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                    fontSize: "1.1rem", fontWeight: 300, color: "#f5f3ef",
                  }}>
                    {project.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={
      <div style={{ paddingTop: "140px", paddingLeft: "clamp(1.5rem, 8vw, 8rem)", color: "#6b6560" }}>
        Loading...
      </div>
    }>
      <PortfolioContent />
    </Suspense>
  );
}
