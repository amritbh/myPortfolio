import React, { useState, useEffect, useCallback } from "react";
import "./PhotoGallery.css";
import { GalleryImage } from "../../portfolio";

interface PhotoGalleryProps {
  images: GalleryImage[];
  columns?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, columns = 3 }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // touchstart X position for swipe detection
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const isOpen = activeIndex !== null;
  const total = images.length;

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") setActiveIndex(null);
      if (e.key === "ArrowRight")
        setActiveIndex((i) => (i !== null ? (i + 1) % total : 0));
      if (e.key === "ArrowLeft")
        setActiveIndex((i) => (i !== null ? (i - 1 + total) % total : 0));
    },
    [isOpen, total]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const goNext = () => setActiveIndex((i) => (i !== null ? (i + 1) % total : 0));
  const goPrev = () => setActiveIndex((i) => (i !== null ? (i - 1 + total) % total : 0));
  const close = () => setActiveIndex(null);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.changedTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? goNext() : goPrev();
    }
    setTouchStartX(null);
  };

  if (!images || images.length === 0) return null;

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  return (
    <div
      className="photo-gallery"
      style={{ "--gallery-cols": columns } as React.CSSProperties}
    >
      <div className="photo-gallery-grid" data-testid="photo-gallery-grid">
        {images.map((img, idx) => (
          <button
            key={img.src}
            type="button"
            className="gallery-thumb-btn"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Open photo: ${img.alt}`}
            data-testid={`gallery-thumb-${idx}`}
          >
            <img
              src={img.thumb}
              alt={img.alt}
              className="gallery-thumb"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {isOpen && activeImage && (
        <div
          className="lightbox-overlay"
          data-testid="lightbox-overlay"
        >
          <button
            type="button"
            className="lightbox-backdrop"
            onClick={close}
            aria-label="Close lightbox"
            style={{ position: "absolute", inset: 0, opacity: 0, zIndex: -1, cursor: "default" }}
          />
          {/* Preload adjacent images */}
          {activeIndex !== null && activeIndex > 0 && (
            <link rel="preload" as="image" href={images[activeIndex - 1].src} />
          )}
          {activeIndex !== null && activeIndex < total - 1 && (
            <link rel="preload" as="image" href={images[activeIndex + 1].src} />
          )}

          <button
            type="button"
            className="lightbox-nav-btn lightbox-prev"
            onClick={goPrev}
            aria-label="Previous photo"
            data-testid="lightbox-prev"
          >
            ‹
          </button>

          <div
            className="lightbox-content"
            data-testid="lightbox-content"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={activeImage.src}
              alt={activeImage.alt}
              className="lightbox-image"
              data-testid="lightbox-image"
            />
            {activeImage.caption && (
              <p className="lightbox-caption" data-testid="lightbox-caption">
                {activeImage.caption}
              </p>
            )}
            <p className="lightbox-counter" data-testid="lightbox-counter">
              {(activeIndex ?? 0) + 1} / {total}
            </p>
          </div>

          <button
            type="button"
            className="lightbox-nav-btn lightbox-next"
            onClick={goNext}
            aria-label="Next photo"
            data-testid="lightbox-next"
          >
            ›
          </button>

          <button
            type="button"
            className="lightbox-close"
            onClick={close}
            aria-label="Close lightbox"
            data-testid="lightbox-close"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
