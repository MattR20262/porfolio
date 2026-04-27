"use client";

import { useState, useEffect } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Star, X, Check } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role_or_event: string | null;
  quote: string;
  image: string | null;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

interface FormState {
  name: string;
  role_or_event: string;
  quote: string;
  image: string;
  featured: boolean;
  sort_order: number;
}

const emptyForm: FormState = {
  name: "",
  role_or_event: "",
  quote: "",
  image: "",
  featured: false,
  sort_order: 0,
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) { toast.error(error.message); return; }
    setTestimonials(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditId(null);
    setForm({ ...emptyForm, sort_order: testimonials.length + 1 });
    setShowForm(true);
  }

  function openEdit(t: Testimonial) {
    setEditId(t.id);
    setForm({
      name: t.name,
      role_or_event: t.role_or_event ?? "",
      quote: t.quote,
      image: t.image ?? "",
      featured: t.featured,
      sort_order: t.sort_order,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.quote.trim()) {
      toast.error("Name and quote are required");
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      role_or_event: form.role_or_event.trim() || null,
      quote: form.quote.trim(),
      image: form.image.trim() || null,
      featured: form.featured,
      sort_order: form.sort_order,
    };

    const res = await fetch(
      editId ? "/api/testimonials" : "/api/testimonials",
      {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...payload } : payload),
      }
    );

    setSaving(false);

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Failed to save");
      return;
    }

    toast.success(editId ? "Testimonial updated" : "Testimonial created");
    closeForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!res.ok) { toast.error("Failed to delete"); return; }
    toast.success("Deleted");
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleFeatured(t: Testimonial) {
    const res = await fetch("/api/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, featured: !t.featured }),
    });
    if (!res.ok) { toast.error("Failed to update"); return; }
    setTestimonials((prev) =>
      prev.map((item) => item.id === t.id ? { ...item, featured: !item.featured } : item)
    );
  }

  return (
    <>
      <AdminHeader
        title="Testimonials"
        action={
          <button className="btn btn-primary" onClick={openNew}>
            <Plus size={14} /> Add Testimonial
          </button>
        }
      />
      <div className="admin-content">

        {/* ── SLIDE-IN FORM ─────────────────────────────────────── */}
        {showForm && (
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid rgba(201,168,76,0.15)",
              padding: "2rem",
              marginBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "1.3rem",
                  color: "#f5f3ef",
                  fontWeight: 300,
                }}
              >
                {editId ? "Edit Testimonial" : "New Testimonial"}
              </h3>
              <button
                onClick={closeForm}
                style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="form-label">Name *</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Sofia & Marco"
                />
              </div>
              <div>
                <label className="form-label">Role / Event</label>
                <input
                  className="form-input"
                  value={form.role_or_event}
                  onChange={(e) => setForm((f) => ({ ...f, role_or_event: e.target.value }))}
                  placeholder="Wedding — Santorini, 2025"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Quote *</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: "100px" }}
                value={form.quote}
                onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
                placeholder="Their testimonial..."
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", alignItems: "end" }}>
              <div>
                <label className="form-label">Photo URL (optional)</label>
                <input
                  className="form-input"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="form-label">Sort Order</label>
                <input
                  className="form-input"
                  type="number"
                  style={{ width: "80px" }}
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", paddingBottom: "0.1rem" }}>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                />
                <span className="form-label" style={{ marginBottom: 0 }}>Featured</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editId ? "Save Changes" : "Create"}
              </button>
              <button className="btn btn-outline" onClick={closeForm}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS TABLE ────────────────────────────────── */}
        {loading ? (
          <p style={{ color: "#6b6b6b" }}>Loading...</p>
        ) : testimonials.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              border: "1px solid rgba(245,243,239,0.06)",
              color: "#6b6b6b",
            }}
          >
            <p style={{ marginBottom: "1rem" }}>No testimonials yet.</p>
            <button className="btn btn-primary" onClick={openNew}>
              <Plus size={14} /> Add First Testimonial
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
              border: "1px solid rgba(245,243,239,0.06)",
            }}
          >
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  gap: "1.5rem",
                  alignItems: "center",
                  padding: "1.25rem 1.5rem",
                  borderBottom: i < testimonials.length - 1 ? "1px solid rgba(245,243,239,0.06)" : "none",
                  background: "#111",
                  transition: "background 0.2s",
                }}
              >
                {/* Sort order badge */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(201,168,76,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#c9a84c",
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {t.sort_order}
                </div>

                {/* Content */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                    <p style={{ color: "#f5f3ef", fontSize: "0.95rem", fontWeight: 500 }}>{t.name}</p>
                    {t.featured && (
                      <span
                        style={{
                          fontSize: "0.6rem",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#c9a84c",
                          padding: "2px 6px",
                          border: "1px solid rgba(201,168,76,0.3)",
                        }}
                      >
                        Featured
                      </span>
                    )}
                  </div>
                  {t.role_or_event && (
                    <p style={{ color: "#6b6b6b", fontSize: "0.75rem", marginBottom: "0.5rem" }}>{t.role_or_event}</p>
                  )}
                  <p
                    style={{
                      color: "#9a9a9a",
                      fontSize: "0.85rem",
                      lineHeight: 1.6,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  <button
                    onClick={() => toggleFeatured(t)}
                    title={t.featured ? "Remove from featured" : "Mark as featured"}
                    style={{
                      background: "none",
                      border: "1px solid rgba(245,243,239,0.1)",
                      color: t.featured ? "#c9a84c" : "#6b6b6b",
                      cursor: "pointer",
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Star size={13} fill={t.featured ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => openEdit(t)}
                    style={{
                      background: "none",
                      border: "1px solid rgba(245,243,239,0.1)",
                      color: "#9a9a9a",
                      cursor: "pointer",
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    disabled={deletingId === t.id}
                    style={{
                      background: "none",
                      border: "1px solid rgba(245,243,239,0.1)",
                      color: "#9a9a9a",
                      cursor: "pointer",
                      padding: "6px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
