import React, { useState, useEffect } from "react";
import "./PhotoGallery.css";
import { GalleryImage } from "../../portfolio";

interface PhotoGalleryProps {
  destinationId: string;
  columns?: number;
  maxVisible?: number;
  detailMode?: boolean; // disables pop-out hover; nav arrows always visible
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ destinationId, detailMode = false }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch(`https://amrit.cloud/media/travel/${destinationId}/gallery/manifest.json?t=${Date.now()}`, { cache: 'no-store' })
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

  const currentImage = images.length > 0 ? images[currentIndex] : null;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    // Pause interval if it's a video so user can actually watch it!
    if (isHovered && images.length > 1 && currentImage?.type !== "video") {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1500); // cycle every 1.5s
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length, currentImage?.type]);

  if (loading) return null;
  if (!images || images.length === 0 || !currentImage) return null;

  const total = images.length;

  const goNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className={`photo-gallery${detailMode ? " gallery-detail-mode" : ""}`}>
      <div 
        className="gallery-carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {currentImage.type === "video" ? (
          <video
            src={currentImage.src}
            controls
            autoPlay
            muted
            className="gallery-carousel-media"
            data-testid="gallery-video"
            onEnded={() => {
              if (isHovered) goNext();
            }}
          >
            <track kind="captions" />
          </video>
        ) : (
          <img
            src={currentImage.src}
            alt={currentImage.alt || `Gallery image ${currentIndex + 1}`}
            className="gallery-carousel-media"
            loading="lazy"
            data-testid="gallery-image"
          />
        )}
        
        {total > 1 && (
          <>
            <button
              type="button"
              className="carousel-nav-btn carousel-prev"
              onClick={goPrev}
              aria-label="Previous photo"
              data-testid="carousel-prev"
            >
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 18L2 10L10 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              type="button"
              className="carousel-nav-btn carousel-next"
              onClick={goNext}
              aria-label="Next photo"
              data-testid="carousel-next"
            >
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2L10 10L2 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
        
        <div className="carousel-counter" data-testid="carousel-counter">
          {currentIndex + 1} / {total}
        </div>
      </div>
    </div>
  );
};

export default PhotoGallery;
