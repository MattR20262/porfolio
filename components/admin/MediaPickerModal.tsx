"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Search, Upload, Check } from "lucide-react";
import type { MediaAsset } from "@/types";
import { formatBytes } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRef } from "react";

interface Props {
  onSelect: (asset: MediaAsset) => void;
  onClose: () => void;
  title?: string;
}

export default function MediaPickerModal({ onSelect, onClose, title = "Pick from Media Library" }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
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

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) throw new Error();
        toast.success(`Uploaded ${file.name}`);
      } catch {
        toast.error(`Failed: ${file.name}`);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    load();
  }

  const filtered = query.trim()
    ? assets.filter((a) =>
        a.filename.toLowerCase().includes(query.toLowerCase()) ||
        (a.alt_text ?? "").toLowerCase().includes(query.toLowerCase())
      )
    : assets;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
          zIndex: 8000, backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(900px, 95vw)", maxHeight: "85vh",
          background: "#0d0d0d", border: "1px solid rgba(201,168,76,0.2)",
          zIndex: 8001, display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(245,243,239,0.06)",
        }}>
          <p style={{
            fontFamily: "var(--font-cormorant), serif", fontSize: "1.2rem",
            fontWeight: 300, color: "#f5f3ef",
          }}>
            {title}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                display: "flex", alignItems: "center", gap: "0.4rem",
                background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)",
                color: "#c9a84c", padding: "0.4rem 0.9rem", cursor: "pointer",
                fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}
            >
              <Upload size={11} />
              {uploading ? "Uploading..." : "Upload New"}
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b6b6b", cursor: "pointer" }}>
              <X size={18} />
            </button>
          </div>
          <input ref={fileRef} type="file" multiple accept="image/*,video/*" style={{ display: "none" }}
            onChange={(e) => handleUpload(e.target.files)} />
        </div>

        {/* Search */}
        <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid rgba(245,243,239,0.06)" }}>
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: "0.8rem", top: "50%", transform: "translateY(-50%)", color: "#6b6b6b" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by filename..."
              style={{
                width: "100%", padding: "0.6rem 0.8rem 0.6rem 2.2rem",
                background: "#1a1a1a", border: "1px solid rgba(245,243,239,0.08)",
                color: "#f5f3ef", fontFamily: "var(--font-inter), sans-serif",
                fontSize: "0.85rem", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Grid */}
        <div style={{ overflowY: "auto", flex: 1, padding: "1rem 1.5rem" }}>
          {loading ? (
            <p style={{ color: "#6b6b6b", textAlign: "center", padding: "3rem" }}>Loading...</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "#6b6b6b" }}>
              <p style={{ marginBottom: "1rem" }}>
                {assets.length === 0 ? "No images in library yet." : "No results."}
              </p>
              {assets.length === 0 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    background: "#c9a84c", border: "none", color: "#080808",
                    padding: "0.6rem 1.4rem", cursor: "pointer",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  }}
                >
                  Upload your first image
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "0.6rem" }}>
              {filtered.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => onSelect(asset)}
                  style={{
                    position: "relative", aspectRatio: "1", background: "#1a1a1a",
                    border: "1px solid rgba(245,243,239,0.06)", cursor: "pointer",
                    padding: 0, overflow: "hidden", transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(245,243,239,0.06)")}
                  title={asset.filename}
                >
                  {asset.resource_type === "image" ? (
                    <img
                      src={asset.url}
                      alt={asset.alt_text ?? asset.filename}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <p style={{ color: "#6b6b6b", fontSize: "0.7rem" }}>Video</p>
                    </div>
                  )}
                  {/* Hover overlay */}
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(8,8,8,0.7)",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.2s", gap: "0.3rem", padding: "0.5rem",
                  }}
                    className="picker-hover"
                  >
                    <Check size={20} color="#c9a84c" />
                    <p style={{ color: "#f5f3ef", fontSize: "0.6rem", textAlign: "center",
                      fontFamily: "var(--font-montserrat), sans-serif",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {asset.filename}
                    </p>
                    <p style={{ color: "#6b6b6b", fontSize: "0.55rem" }}>{formatBytes(asset.size)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "0.75rem 1.5rem", borderTop: "1px solid rgba(245,243,239,0.06)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <p style={{ color: "#6b6b6b", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.65rem" }}>
            {filtered.length} of {assets.length} image{assets.length !== 1 ? "s" : ""}
          </p>
          <button onClick={onClose} className="btn btn-outline" style={{ padding: "0.4rem 1rem", fontSize: "0.6rem" }}>
            Cancel
          </button>
        </div>
      </div>

      <style>{`.picker-hover { } button:hover .picker-hover { opacity: 1 !important; }`}</style>
    </>
  );
}
