"use client";

import { useEffect, useRef, useState } from "react";
import AdminHeader from "@/components/layout/AdminHeader";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/types";
import toast from "react-hot-toast";
import { Upload, Trash2, Copy } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export default function MediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false });
    setAssets(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/media", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    load();
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selected.size} file(s)?`)) return;
    const supabase = createClient();

    for (const id of selected) {
      const asset = assets.find((a) => a.id === id);
      if (!asset) continue;

      await fetch(`/api/media?public_id=${encodeURIComponent(asset.public_id)}`, { method: "DELETE" });
      await supabase.from("media_assets").delete().eq("id", id);
    }

    toast.success("Deleted");
    setSelected(new Set());
    load();
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <AdminHeader
        title="Media Library"
        action={
          <button
            onClick={() => fileRef.current?.click()}
            className="btn btn-primary"
            disabled={uploading}
            style={{ padding: "0.5rem 1rem", fontSize: "0.6rem" }}
          >
            <Upload size={13} />
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        }
      />
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        style={{ display: "none" }}
        onChange={(e) => handleUpload(e.target.files)}
      />

      <div className="admin-content">
        {/* Upload zone */}
        <div
          className="upload-zone"
          style={{ marginBottom: "1.5rem" }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("drag-over"); }}
          onDragLeave={(e) => e.currentTarget.classList.remove("drag-over")}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("drag-over");
            handleUpload(e.dataTransfer.files);
          }}
        >
          <Upload size={28} color="#c9a84c" strokeWidth={1.5} style={{ marginBottom: "0.75rem" }} />
          <p style={{ color: "#6b6b6b", fontSize: "0.85rem" }}>
            Drag & drop files or click to browse
          </p>
          <p style={{ color: "#3d3d3d", fontSize: "0.75rem", marginTop: "0.3rem" }}>
            PNG, JPG, WebP, MP4 — up to 100MB
          </p>
        </div>

        {/* Selection bar */}
        {selected.size > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.75rem 1rem",
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
              marginBottom: "1rem",
            }}
          >
            <p style={{ color: "#c9a84c", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.7rem" }}>
              {selected.size} selected
            </p>
            <button
              onClick={deleteSelected}
              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.65rem" }}
            >
              <Trash2 size={13} /> Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer", fontFamily: "var(--font-montserrat), Montserrat, sans-serif", fontSize: "0.65rem", marginLeft: "auto" }}
            >
              Clear selection
            </button>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <p style={{ color: "#6b6b6b" }}>Loading...</p>
        ) : assets.length === 0 ? (
          <p style={{ color: "#6b6b6b", textAlign: "center", padding: "4rem" }}>
            No media uploaded yet. Drag & drop files above to get started.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => toggleSelect(asset.id)}
                style={{
                  position: "relative",
                  background: "#1a1a1a",
                  border: `1px solid ${selected.has(asset.id) ? "#c9a84c" : "rgba(245,243,239,0.06)"}`,
                  cursor: "pointer",
                  overflow: "hidden",
                  aspectRatio: "1",
                }}
              >
                {asset.resource_type === "image" ? (
                  <img
                    src={asset.url}
                    alt={asset.alt_text ?? asset.filename}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
                    <p style={{ color: "#6b6b6b", fontSize: "0.75rem" }}>Video</p>
                  </div>
                )}
                {selected.has(asset.id) && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(201,168,76,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 24, height: 24, background: "#c9a84c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#080808", fontSize: "0.9rem" }}>✓</span>
                    </div>
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "0.5rem",
                    background: "rgba(8,8,8,0.8)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  className="media-info"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  <p style={{ color: "#f5f3ef", fontSize: "0.65rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {asset.filename}
                  </p>
                  <p style={{ color: "#6b6b6b", fontSize: "0.6rem" }}>{formatBytes(asset.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(asset.url);
                      toast.success("URL copied");
                    }}
                    style={{ background: "none", border: "none", color: "#c9a84c", cursor: "pointer", padding: 0, marginTop: "0.25rem" }}
                  >
                    <Copy size={11} />
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
