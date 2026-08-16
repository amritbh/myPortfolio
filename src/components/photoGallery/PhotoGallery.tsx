import React, { useState, useEffect, useCallback } from "react";
import "./PhotoGallery.css";
import { GalleryImage } from "../../portfolio";

interface PhotoGalleryProps {
  destinationId: string;
  columns?: number;
  maxVisible?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ destinationId, columns = 3, maxVisible = 6 }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // touchstart X position for swipe detection
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`https://amrit.cloud/media/travel/${destinationId}/gallery/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Manifest not found");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setImages(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load gallery manifest for", destinationId, err);
        if (isMounted) {
          setImages([]);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [destinationId]);

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

  if (loading) return null; // or a skeleton loader
  if (!images || images.length === 0) return null;

  const activeImage = activeIndex !== null ? images[activeIndex] : null;

  const visibleImages = images.slice(0, maxVisible);
  const remainingCount = images.length - maxVisible;

  return (
    <div
      className="photo-gallery"
      style={{ "--gallery-cols": columns } as React.CSSProperties}
    >
      <div className="photo-gallery-grid">
        {visibleImages.map((img, index) => {
          const isLastVisible = index === maxVisible - 1 && remainingCount > 0;
          return (
            <button
              key={index}
              type="button"
              className="gallery-thumb-btn"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              aria-label={`View image ${index + 1}`}
              data-testid={`gallery-thumb-${index}`}
            >
              <div className="gallery-thumb-wrapper">
                <img
                  src={img.thumb}
                  alt={img.alt || `Gallery image ${index + 1}`}
                  className="gallery-thumb"
                  loading="lazy"
                />
                {isLastVisible && (
                  <div className="gallery-more-overlay">
                    <span>+{remainingCount}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
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
            {activeImage.type === "video" ? (
              <video
                src={activeImage.src}
                controls
                autoPlay
                className="lightbox-image"
                data-testid="lightbox-video"
                style={{ maxHeight: "80vh", maxWidth: "90vw" }}
              />
            ) : (
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="lightbox-image"
                data-testid="lightbox-image"
              />
            )}
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
