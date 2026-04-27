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


function PortfolioContent() {
  const searchParams    = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";

  const [dbProjects,     setDbProjects]     = useState<DisplayProject[]>([]);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [loading,        setLoading]        = useState(true);

  async function load() {
    const supabase = createClient();

    // Check TOTAL project count (published + drafts) to decide whether to seed
    const { count: totalCount } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true });

    // Only auto-seed demo projects if the DB is completely empty
    if ((totalCount ?? 0) === 0) {
      try { await fetch("/api/seed-projects", { method: "POST" }); } catch { /* silent */ }
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

  // Only show real DB projects — demos are seeded into DB on first visit
  const projects = dbProjects;

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
