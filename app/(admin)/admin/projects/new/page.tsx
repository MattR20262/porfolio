"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import toast from "react-hot-toast";
import { slugify } from "@/lib/utils";

const categories = ["weddings", "fashion", "portraits", "events", "destinations", "street", "commercial"];

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  function onTitleChange(val: string) {
    setTitle(val);
    setSlug(slugify(val));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const getValue = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value ?? "";

    const data = {
      title,
      slug,
      category: getValue("category"),
      short_description: getValue("short_description") || null,
      full_description: getValue("full_description") || null,
      location: getValue("location") || null,
      shoot_date: getValue("shoot_date") || null,
      client_name: getValue("client_name") || null,
      seo_title: getValue("seo_title") || null,
      seo_description: getValue("seo_description") || null,
      published: (form.elements.namedItem("published") as HTMLInputElement).checked,
      featured: (form.elements.namedItem("featured") as HTMLInputElement).checked,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const e = await res.json();
      toast.error(e.error ?? "Failed to create project");
      setLoading(false);
      return;
    }

    toast.success("Project created");
    router.push("/admin/projects");
  }

  return (
    <>
      <AdminHeader title="New Project" />
      <div className="admin-content" style={{ maxWidth: "800px" }}>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(245,243,239,0.06)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <div className="admin-form-grid-2">
              <div>
                <label className="form-label" htmlFor="title">Title *</label>
                <input
                  id="title"
                  className="form-input"
                  required
                  value={title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="Project title"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="slug">Slug</label>
                <input
                  id="slug"
                  className="form-input"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated"
                />
              </div>
            </div>

            <div className="admin-form-grid-3">
              <div>
                <label className="form-label" htmlFor="category">Category *</label>
                <select id="category" name="category" className="form-select" required>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="shoot_date">Shoot Date</label>
                <input id="shoot_date" name="shoot_date" type="date" className="form-input" />
              </div>
              <div>
                <label className="form-label" htmlFor="location">Location</label>
                <input id="location" name="location" className="form-input" placeholder="City, Country" />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="client_name">Client Name</label>
              <input id="client_name" name="client_name" className="form-input" placeholder="Client or couple name" />
            </div>

            <div>
              <label className="form-label" htmlFor="short_description">Short Description</label>
              <textarea id="short_description" name="short_description" className="form-textarea" style={{ minHeight: "80px" }} placeholder="One-line summary..." />
            </div>

            <div>
              <label className="form-label" htmlFor="full_description">Full Description</label>
              <textarea id="full_description" name="full_description" className="form-textarea" style={{ minHeight: "140px" }} placeholder="Full project description..." />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="form-label" htmlFor="seo_title">SEO Title</label>
                <input id="seo_title" name="seo_title" className="form-input" placeholder="Custom page title" />
              </div>
              <div>
                <label className="form-label" htmlFor="seo_description">SEO Description</label>
                <input id="seo_description" name="seo_description" className="form-input" placeholder="Meta description" />
              </div>
            </div>

            <div style={{ display: "flex", gap: "2rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <input id="published" name="published" type="checkbox" />
                <span className="form-label" style={{ marginBottom: 0 }}>Published</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <input id="featured" name="featured" type="checkbox" />
                <span className="form-label" style={{ marginBottom: 0 }}>Featured</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem", paddingTop: "0.5rem" }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => router.back()}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
