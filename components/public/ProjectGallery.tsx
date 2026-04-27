"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryImage {
  url: string;
  alt: string;
}

interface Props {
  images: GalleryImage[];
}

export default function ProjectGallery({ images }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIdx(null), []);

  const prev = useCallback(() => {
    setLightboxIdx((i) => (i !== null && i > 0 ? i - 1 : i));
  }, []);

  const next = useCallback(() => {
    setLightboxIdx((i) => (i !== null && i < images.length - 1 ? i + 1 : i));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, close, prev, next]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIdx]);

  return (
    <>
      {/* ── MASONRY GALLERY ──────────────────────────────────── */}
      <section
        style={{
          padding: "3rem clamp(1.5rem, 8vw, 8rem) 6rem",
          background: "#080808",
        }}
      >
        <div className="masonry-grid">
          {images.map((img, i) => (
            <div
              key={i}
              className="masonry-item"
              onClick={() => setLightboxIdx(i)}
              style={{ cursor: "zoom-in" }}
            >
              <img
                src={img.url}
                alt={img.alt}
                loading={i === 0 ? "eager" : "lazy"}
                style={{ width: "100%", display: "block" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── LIGHTBOX ─────────────────────────────────────────── */}
      {lightboxIdx !== null && (
        <div
          className="lightbox"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <img
            src={images[lightboxIdx].url}
            alt={images[lightboxIdx].alt}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="lightbox-close"
            onClick={close}
            aria-label="Close lightbox"
          >
            <X size={16} />
          </button>

          {lightboxIdx > 0 && (
            <button
              className="lightbox-nav lightbox-prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {lightboxIdx < images.length - 1 && (
            <button
              className="lightbox-nav lightbox-next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            style={{
              position: "absolute",
              bottom: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                color: "#f5f3ef",
              }}
            >
              {images[lightboxIdx].alt}
            </p>
            <p style={{ color: "#6b6b6b", fontSize: "0.7rem", marginTop: "0.3rem" }}>
              {lightboxIdx + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
