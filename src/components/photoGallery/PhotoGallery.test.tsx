import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import PhotoGallery from "./PhotoGallery";
import { GalleryImage } from "../../portfolio";

const mockImages: GalleryImage[] = [
  {
    src: "https://amrit.cloud/media/travel/test/gallery/01.jpg",
    thumb: "https://amrit.cloud/media/travel/test/gallery/thumbs/01-thumb.jpg",
    alt: "Test image 1",
    caption: "Caption for image one",
  },
  {
    src: "https://amrit.cloud/media/travel/test/gallery/02.jpg",
    thumb: "https://amrit.cloud/media/travel/test/gallery/thumbs/02-thumb.jpg",
    alt: "Test image 2",
    caption: "Caption for image two",
  },
  {
    src: "https://amrit.cloud/media/travel/test/gallery/03.jpg",
    thumb: "https://amrit.cloud/media/travel/test/gallery/thumbs/03-thumb.jpg",
    alt: "Test image 3",
  },
];

describe("PhotoGallery Component", () => {
  afterEach(() => {
    // Ensure body scroll is always restored after each test
    document.body.style.overflow = "";
    vi.clearAllMocks();
  });

  // ── Rendering ───────────────────────────────────────────────────────────

  it("renders the correct number of thumbnails", () => {
    render(<PhotoGallery images={mockImages} />);
    const thumbs = screen.getAllByTestId(/gallery-thumb-\d+/);
    expect(thumbs).toHaveLength(mockImages.length);
  });

  it("renders nothing when images array is empty", () => {
    const { container } = render(<PhotoGallery images={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when images prop is undefined-like (empty array)", () => {
    const { container } = render(<PhotoGallery images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders thumbnail images with correct alt text", () => {
    render(<PhotoGallery images={mockImages} />);
    expect(screen.getByAltText("Test image 1")).toBeInTheDocument();
    expect(screen.getByAltText("Test image 2")).toBeInTheDocument();
    expect(screen.getByAltText("Test image 3")).toBeInTheDocument();
  });

  it("renders thumbnails with loading=lazy attribute", () => {
    render(<PhotoGallery images={mockImages} />);
    const imgs = screen.getAllByRole("img");
    imgs.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  // ── Lightbox: Open/Close ────────────────────────────────────────────────

  it("lightbox is closed by default", () => {
    render(<PhotoGallery images={mockImages} />);
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("opens lightbox when a thumbnail is clicked", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    expect(screen.getByTestId("lightbox-overlay")).toBeInTheDocument();
  });

  it("shows the correct image in the lightbox", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-1"));
    const lightboxImg = screen.getByTestId("lightbox-image");
    expect(lightboxImg).toHaveAttribute("src", mockImages[1].src);
    expect(lightboxImg).toHaveAttribute("alt", mockImages[1].alt);
  });

  it("shows caption when image has one", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    expect(screen.getByTestId("lightbox-caption")).toHaveTextContent("Caption for image one");
  });

  it("does not show caption element when image has no caption", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-2")); // image 3 has no caption
    expect(screen.queryByTestId("lightbox-caption")).not.toBeInTheDocument();
  });

  it("closes lightbox when close button is clicked", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    fireEvent.click(screen.getByTestId("lightbox-close"));
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("closes lightbox when overlay backdrop is clicked", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    fireEvent.click(screen.getByLabelText("Close lightbox", { selector: ".lightbox-backdrop" }));
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("does not close lightbox when lightbox content area is clicked", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    // Since lightbox-content no longer has onClick with stopPropagation,
    // clicking it would normally bubble to overlay and close.
    // Wait, we refactored overlay to use a background button, so clicking content DOES NOT close it.
    fireEvent.click(screen.getByTestId("lightbox-content"));
    expect(screen.getByTestId("lightbox-overlay")).toBeInTheDocument();
  });

  // ── Lightbox: Navigation ────────────────────────────────────────────────

  it.each([
    ["next", 0, "lightbox-next", 1],
    ["prev", 1, "lightbox-prev", 0],
    ["prev from first", 0, "lightbox-prev", 2],
    ["next from last", 2, "lightbox-next", 0],
  ])("navigates correctly: %s", (_, startIdx, buttonTestId, expectedIdx) => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId(`gallery-thumb-${startIdx}`));
    fireEvent.click(screen.getByTestId(buttonTestId as string));
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[expectedIdx as number].src);
  });

  // ── Counter ─────────────────────────────────────────────────────────────

  it("shows correct counter text for first image (1 / 3)", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("1 / 3");
  });

  it("shows correct counter text for second image (2 / 3)", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-1"));
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("2 / 3");
  });

  // ── Keyboard Navigation ─────────────────────────────────────────────────

  it("navigates to next image on ArrowRight key", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[1].src);
  });

  it("navigates to previous image on ArrowLeft key", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-1"));
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[0].src);
  });

  it("closes lightbox on Escape key", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("does not navigate with keyboard when lightbox is closed", () => {
    render(<PhotoGallery images={mockImages} />);
    // No click to open lightbox
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  // ── Body Scroll Lock ────────────────────────────────────────────────────

  it("locks body scroll when lightbox is open", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores body scroll when lightbox is closed", () => {
    render(<PhotoGallery images={mockImages} />);
    fireEvent.click(screen.getByTestId("gallery-thumb-0"));
    fireEvent.click(screen.getByTestId("lightbox-close"));
    expect(document.body.style.overflow).toBe("");
  });
});
