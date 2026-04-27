"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "@/components/layout/AdminHeader";
import MediaPickerModal from "@/components/admin/MediaPickerModal";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Upload, Trash2, ImageIcon, Images } from "lucide-react";
import type { Project, ProjectMedia, MediaAsset } from "@/types";

const categories = ["events", "weddings", "commercial", "corporate", "portraits", "preball"];

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [project, setProject] = useState<Project | null>(null);
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  // Media picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerMode, setPickerMode] = useState<"cover" | "gallery">("cover");

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data: proj, error: projErr }, { data: mediaData }] = await Promise.all([
        supabase.from("projects").select("*").eq("id", id).single(),
        supabase.from("project_media").select("*").eq("project_id", id).order("sort_order"),
      ]);
      if (projErr || !proj) {
        toast.error("Project not found");
        router.push("/admin/projects");
        return;
      }
      setProject(proj);
      setTitle(proj.title);
      setSlug(proj.slug);
      setMedia(mediaData ?? []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const getValue = (name: string) =>
      (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)?.value ?? "";

    const data = {
      title, slug,
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
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) { const e = await res.json(); toast.error(e.error ?? "Failed"); setSaving(false); return; }
    toast.success("Project updated");
    router.push("/admin/projects");
  }

  // Upload new files directly to project gallery
  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("project_id", id);
      const res = await fetch("/api/project-media", { method: "POST", body: fd });
      if (!res.ok) { toast.error(`Failed: ${file.name}`); continue; }
      const newMedia: ProjectMedia = await res.json();
      setMedia((prev) => [...prev, newMedia]);
      toast.success(`${file.name} uploaded`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // Pick from library → set cover OR add to gallery
  async function handlePickFromLibrary(asset: MediaAsset) {
    setPickerOpen(false);
    const supabase = createClient();

    if (pickerMode === "cover") {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, cover_image: asset.url, cover_image_public_id: asset.public_id }),
      });
      if (!res.ok) { toast.error("Failed to set cover"); return; }
      setProject((prev) => prev ? { ...prev, cover_image: asset.url, cover_image_public_id: asset.public_id } : prev);
      toast.success("Cover image set");
    } else {
      // Add to gallery as project_media via API
      const supabase = createClient();
      const nextSort = media.length > 0 ? Math.max(...media.map((m) => m.sort_order)) + 1 : 0;
      const { data, error } = await supabase
        .from("project_media")
        .insert({
          project_id: id,
          media_type: "image",
          url: asset.url,
          public_id: asset.public_id,
          alt_text: asset.alt_text || null,
          sort_order: nextSort,
        })
        .select()
        .single();
      if (error) { toast.error(error.message); return; }
      setMedia((prev) => [...prev, data]);
      toast.success("Added to gallery");
    }
  }

  async function handleSetCover(url: string, publicId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ cover_image: url, cover_image_public_id: publicId })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    setProject((prev) => prev ? { ...prev, cover_image: url, cover_image_public_id: publicId } : prev);
    toast.success("Cover image updated");
  }

  async function handleDeleteMedia(item: ProjectMedia) {
    if (!confirm("Delete this photo?")) return;
    setDeletingMediaId(item.id);
    const res = await fetch(`/api/project-media?id=${item.id}`, { method: "DELETE" });
    setDeletingMediaId(null);
    if (!res.ok) { toast.error("Failed to delete"); return; }
    setMedia((prev) => prev.filter((m) => m.id !== item.id));
    toast.success("Photo deleted");
  }

  if (loading) {
    return (
      <>
        <AdminHeader title="Edit Project" />
        <div className="admin-content"><p style={{ color: "#6b6b6b" }}>Loading...</p></div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={`Edit: ${project?.title ?? ""}`} />
      <div className="admin-content" style={{ maxWidth: "900px" }}>

        {/* ── COVER IMAGE ───────────────────────────────────── */}
        <div style={{
          background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)",
          padding: "1.5rem", marginBottom: "1.5rem",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.1rem", color: "#f5f3ef", fontWeight: 300 }}>
              Cover Image
            </h3>
            <button
              className="btn btn-outline"
              style={{ fontSize: "0.65rem", padding: "0.4rem 1rem" }}
              onClick={() => { setPickerMode("cover"); setPickerOpen(true); }}
            >
              <Images size={12} />
              {project?.cover_image ? "Change Cover" : "Pick from Library"}
            </button>
          </div>

          {project?.cover_image ? (
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <img
                src={project.cover_image}
                alt="Cover"
                style={{ width: "160px", height: "120px", objectFit: "cover", border: "1px solid rgba(201,168,76,0.2)" }}
              />
              <div>
                <p style={{ color: "#9a9a9a", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                  Current cover image
                </p>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.from("projects").update({ cover_image: null, cover_image_public_id: null }).eq("id", id);
                    setProject((prev) => prev ? { ...prev, cover_image: null, cover_image_public_id: null } : prev);
                    toast.success("Cover removed");
                  }}
                  style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}
                >
                  Remove cover
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => { setPickerMode("cover"); setPickerOpen(true); }}
              style={{
                border: "2px dashed rgba(201,168,76,0.2)", padding: "2rem",
                textAlign: "center", cursor: "pointer", color: "#6b6b6b",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.4)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.2)")}
            >
              <ImageIcon size={28} style={{ marginBottom: "0.75rem", opacity: 0.4 }} />
              <p style={{ fontSize: "0.85rem" }}>No cover image — click to pick from library</p>
            </div>
          )}
        </div>

        {/* ── PROJECT DETAILS FORM ──────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div style={{
            background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)",
            padding: "2rem", display: "flex", flexDirection: "column",
            gap: "1.5rem", marginBottom: "1.5rem",
          }}>
            <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.1rem", color: "#f5f3ef", fontWeight: 300, margin: 0 }}>
              Project Details
            </h3>

            <div className="admin-form-grid-2">
              <div>
                <label className="form-label">Title *</label>
                <input className="form-input" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Slug</label>
                <input className="form-input" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>

            <div className="admin-form-grid-3">
              <div>
                <label className="form-label">Category *</label>
                <select name="category" className="form-select" required defaultValue={project?.category}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Shoot Date</label>
                <input name="shoot_date" type="date" className="form-input" defaultValue={project?.shoot_date ?? ""} />
              </div>
              <div>
                <label className="form-label">Location</label>
                <input name="location" className="form-input" defaultValue={project?.location ?? ""} />
              </div>
            </div>

            <div>
              <label className="form-label">Client Name</label>
              <input name="client_name" className="form-input" defaultValue={project?.client_name ?? ""} />
            </div>
            <div>
              <label className="form-label">Short Description</label>
              <textarea name="short_description" className="form-textarea" style={{ minHeight: "80px" }} defaultValue={project?.short_description ?? ""} />
            </div>
            <div>
              <label className="form-label">Full Description</label>
              <textarea name="full_description" className="form-textarea" style={{ minHeight: "140px" }} defaultValue={project?.full_description ?? ""} />
            </div>

            <div className="admin-form-grid-2">
              <div>
                <label className="form-label">SEO Title</label>
                <input name="seo_title" className="form-input" defaultValue={project?.seo_title ?? ""} />
              </div>
              <div>
                <label className="form-label">SEO Description</label>
                <input name="seo_description" className="form-input" defaultValue={project?.seo_description ?? ""} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "2rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <input name="published" type="checkbox" defaultChecked={project?.published} />
                <span className="form-label" style={{ marginBottom: 0 }}>Published</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
                <input name="featured" type="checkbox" defaultChecked={project?.featured} />
                <span className="form-label" style={{ marginBottom: 0 }}>Featured on homepage</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => router.back()}>Cancel</button>
            </div>
          </div>
        </form>

        {/* ── GALLERY ──────────────────────────────────────── */}
        <div style={{ background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.06)", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.1rem", color: "#f5f3ef", fontWeight: 300 }}>
              Gallery ({media.length})
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-outline"
                style={{ fontSize: "0.65rem", padding: "0.4rem 1rem" }}
                onClick={() => { setPickerMode("gallery"); setPickerOpen(true); }}
              >
                <Images size={12} /> From Library
              </button>
              <button
                className="btn btn-outline"
                style={{ fontSize: "0.65rem", padding: "0.4rem 1rem" }}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload size={12} /> {uploading ? "Uploading..." : "Upload New"}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }}
              onChange={(e) => handleUpload(e.target.files)} />
          </div>

          {media.length === 0 ? (
            <div style={{
              border: "2px dashed rgba(201,168,76,0.15)", padding: "3rem",
              textAlign: "center", color: "#6b6b6b",
            }}>
              <ImageIcon size={28} style={{ marginBottom: "0.75rem", opacity: 0.3 }} />
              <p style={{ fontSize: "0.85rem", marginBottom: "1rem" }}>No gallery images yet</p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button className="btn btn-outline" style={{ fontSize: "0.6rem", padding: "0.4rem 1rem" }}
                  onClick={() => { setPickerMode("gallery"); setPickerOpen(true); }}>
                  <Images size={11} /> Pick from Library
                </button>
                <button className="btn btn-outline" style={{ fontSize: "0.6rem", padding: "0.4rem 1rem" }}
                  onClick={() => fileInputRef.current?.click()}>
                  <Upload size={11} /> Upload New
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.6rem" }}>
              {media.map((item) => (
                <div key={item.id} style={{ position: "relative", aspectRatio: "1", background: "#111", overflow: "hidden" }}
                  className="media-thumb">
                  <img src={item.url} alt={item.alt_text ?? ""} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {project?.cover_image === item.url && (
                    <div style={{
                      position: "absolute", top: 6, left: 6, background: "#c9a84c", color: "#080808",
                      fontSize: "0.5rem", fontFamily: "var(--font-montserrat), sans-serif",
                      fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 5px",
                    }}>Cover</div>
                  )}
                  <div className="media-overlay" style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: "0.4rem", opacity: 0, transition: "opacity 0.2s",
                  }}>
                    {project?.cover_image !== item.url && (
                      <button onClick={() => handleSetCover(item.url, item.public_id)} style={{
                        background: "rgba(201,168,76,0.9)", border: "none", color: "#080808",
                        fontSize: "0.55rem", fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "4px 8px", cursor: "pointer", width: "90%",
                      }}>Set Cover</button>
                    )}
                    <button onClick={() => handleDeleteMedia(item)} disabled={deletingMediaId === item.id}
                      style={{
                        background: "rgba(180,60,60,0.85)", border: "none", color: "#fff",
                        fontSize: "0.55rem", fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                        padding: "4px 8px", cursor: "pointer", width: "90%",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 3,
                      }}>
                      <Trash2 size={10} /> {deletingMediaId === item.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media picker modal */}
      {pickerOpen && (
        <MediaPickerModal
          title={pickerMode === "cover" ? "Pick Cover Image" : "Add to Gallery"}
          onSelect={handlePickFromLibrary}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <style>{`.media-thumb:hover .media-overlay { opacity: 1 !important; }`}</style>
    </>
  );
}
