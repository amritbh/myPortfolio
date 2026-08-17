import React, { useState, useEffect } from "react";
import "./PhotoGallery.css";
import { GalleryImage } from "../../portfolio";

interface PhotoGalleryProps {
  destinationId: string;
  columns?: number;
  maxVisible?: number;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ destinationId }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isHovered && images.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1500); // cycle every 1.5s
    }
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  if (loading) return null;
  if (!images || images.length === 0) return null;

  const total = images.length;
  const currentImage = images[currentIndex];

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className="photo-gallery">
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
              ‹
            </button>
            <button
              type="button"
              className="carousel-nav-btn carousel-next"
              onClick={goNext}
              aria-label="Next photo"
              data-testid="carousel-next"
            >
              ›
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
