"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, ExternalLink } from "lucide-react";
import { slugify, formatDate } from "@/lib/utils";
import Link from "next/link";

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  show_in_nav: boolean;
  nav_parent: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const NAV_PARENTS = ["Portfolio", "About", "Services", "Contact"];

const emptyForm = {
  title: "", slug: "", content: "",
  published: false, show_in_nav: false, nav_parent: "",
  seo_title: "", seo_description: "",
};

export default function PagesAdminPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase.from("pages").select("*").order("sort_order");
    if (error) { toast.error(error.message); return; }
    setPages(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm);
    setShowEditor(true);
  }

  function openEdit(p: Page) {
    setEditingId(p.id);
    setForm({
      title: p.title, slug: p.slug, content: p.content,
      published: p.published, show_in_nav: p.show_in_nav,
      nav_parent: p.nav_parent ?? "",
      seo_title: p.seo_title ?? "", seo_description: p.seo_description ?? "",
    });
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) { toast.error("Title and slug required"); return; }
    setSaving(true);

    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content,
      published: form.published,
      show_in_nav: form.show_in_nav,
      nav_parent: form.show_in_nav && form.nav_parent ? form.nav_parent : null,
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
    };

    const res = await fetch("/api/pages", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });
    setSaving(false);
    if (!res.ok) { const e = await res.json(); toast.error(e.error ?? "Failed"); return; }
    toast.success(editingId ? "Page updated" : "Page created");
    closeEditor();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/pages?id=${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) { toast.error("Failed"); return; }
    toast.success("Deleted");
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  async function togglePublished(p: Page) {
    const res = await fetch("/api/pages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, published: !p.published }),
    });
    if (!res.ok) { toast.error("Failed"); return; }
    setPages((prev) => prev.map((x) => x.id === p.id ? { ...x, published: !x.published } : x));
  }

  return (
    <>
      <AdminHeader
        title="Pages"
        action={
          <button className="btn btn-primary" onClick={openNew} style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}>
            <Plus size={13} /> New Page
          </button>
        }
      />
      <div className="admin-content">

        {/* ── EDITOR PANEL ─────────────────────────────────── */}
        {showEditor && (
          <div style={{
            background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.15)",
            padding: "2rem", marginBottom: "2rem",
          }}>
            {/* Editor header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.3rem", fontWeight: 300, color: "#f5f3ef" }}>
                {editingId ? "Edit Page" : "New Page"}
              </h3>
              <button onClick={closeEditor} style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Title + Slug */}
              <div className="admin-form-grid-2">
                <div>
                  <label className="form-label">Page Title *</label>
                  <input className="form-input" value={form.title}
                    onChange={(e) => {
                      const t = e.target.value;
                      setForm((f) => ({ ...f, title: t, slug: editingId ? f.slug : slugify(t) }));
                    }}
                    placeholder="e.g. Pricing" />
                </div>
                <div>
                  <label className="form-label">URL Slug *</label>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ color: "#6b6b6b", fontSize: "0.85rem", padding: "0.9rem 0.6rem 0.9rem 1.2rem",
                      background: "#111", border: "1px solid rgba(245,243,239,0.1)", borderRight: "none", whiteSpace: "nowrap" }}>
                      /
                    </span>
                    <input className="form-input" value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                      placeholder="pricing" />
                  </div>
                  {form.slug && (
                    <p style={{ color: "#6b6b6b", fontSize: "0.65rem", marginTop: "0.3rem" }}>
                      Will be live at: <span style={{ color: "#c9a84c" }}>/{form.slug}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="form-label">Page Content</label>
                <p style={{ color: "#6b6b6b", fontSize: "0.65rem", marginBottom: "0.5rem" }}>
                  You can use plain text or basic HTML tags ({"<h2>, <p>, <strong>, <em>, <ul>, <li>, <a href>"}).
                </p>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "280px", fontFamily: "monospace", fontSize: "0.85rem", lineHeight: 1.7 }}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder={"<h2>Heading</h2>\n<p>Your paragraph text here...</p>\n\n<h3>Subheading</h3>\n<ul>\n  <li>Item one</li>\n  <li>Item two</li>\n</ul>"}
                />
              </div>

              {/* SEO */}
              <div className="admin-form-grid-2">
                <div>
                  <label className="form-label">SEO Title</label>
                  <input className="form-input" value={form.seo_title}
                    onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
                    placeholder="Defaults to page title" />
                </div>
                <div>
                  <label className="form-label">SEO Description</label>
                  <input className="form-input" value={form.seo_description}
                    onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
                    placeholder="Short description for search engines" />
                </div>
              </div>

              {/* Toggles + nav parent */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.published}
                    onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Published</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.show_in_nav}
                    onChange={(e) => setForm((f) => ({ ...f, show_in_nav: e.target.checked, nav_parent: e.target.checked ? f.nav_parent : "" }))} />
                  <span className="form-label" style={{ marginBottom: 0 }}>Show in navigation</span>
                </label>
                {form.show_in_nav && (
                  <div>
                    <label className="form-label">Appears under</label>
                    <select
                      className="form-select"
                      value={form.nav_parent}
                      onChange={(e) => setForm((f) => ({ ...f, nav_parent: e.target.value }))}
                      style={{ minWidth: "160px" }}
                    >
                      <option value="">— Top level —</option>
                      {NAV_PARENTS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Page"}
                </button>
                <button className="btn btn-outline" onClick={closeEditor}>Cancel</button>
                {editingId && form.slug && form.published && (
                  <Link href={`/${form.slug}`} target="_blank"
                    className="btn btn-ghost" style={{ marginLeft: "auto" }}>
                    <ExternalLink size={12} /> Preview
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PAGES TABLE ──────────────────────────────────── */}
        {loading ? (
          <p style={{ color: "#6b6b6b" }}>Loading...</p>
        ) : pages.length === 0 && !showEditor ? (
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            border: "1px solid rgba(245,243,239,0.06)", color: "#6b6b6b",
          }}>
            <p style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>No custom pages yet.</p>
            <p style={{ fontSize: "0.85rem", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
              Create standalone pages like Pricing, Blog, Press, etc. They'll be live at their slug URL.
            </p>
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={14} /> Create First Page
            </button>
          </div>
        ) : pages.length > 0 ? (
          <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", overflow: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Nav</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td style={{ color: "#f5f3ef" }}>{p.title}</td>
                    <td>
                      <Link href={`/${p.slug}`} target="_blank"
                        style={{ color: "#c9a84c", textDecoration: "none", fontSize: "0.8rem",
                          display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        /{p.slug} <ExternalLink size={10} />
                      </Link>
                    </td>
                    <td>
                      {p.show_in_nav
                        ? <span className="badge badge-new">Nav</span>
                        : <span style={{ color: "#3d3d3d" }}>—</span>}
                    </td>
                    <td>
                      <span className={`badge ${p.published ? "badge-published" : "badge-draft"}`}>
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td style={{ color: "#6b6b6b" }}>{formatDate(p.updated_at)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button onClick={() => togglePublished(p)}
                          title={p.published ? "Unpublish" : "Publish"}
                          style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}>
                          {p.published ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => openEdit(p)}
                          style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}>
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}
                          style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </>
  );
}
