"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { Collection } from "@/types";
import toast from "react-hot-toast";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("collections").select("*").order("sort_order");
    setCollections(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleVisible(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("collections").update({ visible: !current }).eq("id", id);
    setCollections((prev) => prev.map((c) => c.id === id ? { ...c, visible: !current } : c));
  }

  async function deleteCollection(id: string) {
    if (!confirm("Delete this collection?")) return;
    const supabase = createClient();
    await supabase.from("collections").delete().eq("id", id);
    toast.success("Deleted");
    load();
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;

    const supabase = createClient();
    const { error } = await supabase.from("collections").insert({
      name, slug, description: description || null,
      sort_order: collections.length + 1,
    });

    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Collection created");
    setShowForm(false);
    load();
    setSaving(false);
  }

  return (
    <>
      <AdminHeader
        title="Collections"
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}>
            <Plus size={13} /> New Collection
          </button>
        }
      />
      <div className="admin-content">
        {showForm && (
          <form onSubmit={handleCreate} style={{ background: "#1a1a1a", border: "1px solid rgba(201,168,76,0.2)", padding: "1.5rem", marginBottom: "1.5rem" }}>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.2rem", fontWeight: 300, color: "#f5f3ef", marginBottom: "1rem" }}>
              New Collection
            </p>
            <div className="admin-form-grid-2" style={{ marginBottom: "1rem" }}>
              <div>
                <label className="form-label">Name *</label>
                <input name="name" className="form-input" required placeholder="Collection name" />
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label className="form-label">Description</label>
              <textarea name="description" className="form-textarea" style={{ minHeight: "80px" }} placeholder="Brief description..." />
            </div>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: "0.5rem 1.2rem" }}>
                {saving ? "Creating..." : "Create"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} style={{ padding: "0.5rem 1.2rem" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {loading ? (
            <p style={{ color: "#6b6b6b" }}>Loading...</p>
          ) : collections.map((col) => (
            <div
              key={col.id}
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(245,243,239,0.06)",
                padding: "1.5rem",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div>
                  <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif", fontSize: "1.3rem", fontWeight: 300, color: "#f5f3ef" }}>
                    {col.name}
                  </p>
                  <p style={{ color: "#6b6b6b", fontSize: "0.7rem", marginTop: "0.15rem" }}>/{col.slug}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => toggleVisible(col.id, col.visible)} style={{ background: "none", border: "none", color: col.visible ? "#50c878" : "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}>
                    {col.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => deleteCollection(col.id)} style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", padding: "0.25rem" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {col.description && (
                <p style={{ color: "#9a9a9a", fontSize: "0.8rem", lineHeight: 1.7 }}>{col.description}</p>
              )}
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                {col.featured && <span className="badge badge-new">Featured</span>}
                <span className={`badge ${col.visible ? "badge-published" : "badge-draft"}`}>
                  {col.visible ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>
          ))}
          {!loading && collections.length === 0 && (
            <p style={{ color: "#6b6b6b" }}>No collections yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
