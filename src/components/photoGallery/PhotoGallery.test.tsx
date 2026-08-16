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

const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockImages),
  } as Response)
);

describe("PhotoGallery Component", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    // Ensure body scroll is always restored after each test
    document.body.style.overflow = "";
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // ── Rendering ───────────────────────────────────────────────────────────

  it("renders the correct number of thumbnails", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    expect(thumbs).toHaveLength(mockImages.length);
  });

  it("does not render anything if gallery is empty", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    );
    const { container } = render(<PhotoGallery destinationId="empty-dest" />);
    // Wait for the fetch to resolve
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(container.firstChild).toBeNull();
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error("Network Error")));
    const { container } = render(<PhotoGallery destinationId="error-dest" />);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when images prop is undefined-like (empty array)", () => {
    const { container } = render(<PhotoGallery images={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders thumbnail images with correct alt text", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    expect(await screen.findByAltText("Test image 1")).toBeInTheDocument();
    expect(screen.getByAltText("Test image 2")).toBeInTheDocument();
    expect(screen.getByAltText("Test image 3")).toBeInTheDocument();
  });

  it("renders thumbnails with loading=lazy attribute", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const imgs = await screen.findAllByRole("img");
    imgs.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
    });
  });

  // ── Lightbox: Open/Close ────────────────────────────────────────────────

  it("lightbox is closed by default", () => {
    render(<PhotoGallery destinationId="test-dest" />);
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("opens the lightbox when a thumbnail is clicked", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);

    expect(screen.getByTestId("lightbox-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[0].src);
    expect(screen.getByTestId("lightbox-caption")).toHaveTextContent("Caption for image one");
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("1 / 3");
  });

  it("shows the correct image in the lightbox", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[1]);
    const lightboxImg = screen.getByTestId("lightbox-image");
    expect(lightboxImg).toHaveAttribute("src", mockImages[1].src);
    expect(lightboxImg).toHaveAttribute("alt", mockImages[1].alt);
  });

  it("shows caption when image has one", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);
    expect(screen.getByTestId("lightbox-caption")).toHaveTextContent("Caption for image one");
  });

  it("does not show caption element when image has no caption", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[2]); // image 3 has no caption
    expect(screen.queryByTestId("lightbox-caption")).not.toBeInTheDocument();
  });

  it("closes the lightbox when close button is clicked", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);

    const closeBtn = screen.getByTestId("lightbox-close");
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("closes lightbox when overlay backdrop is clicked", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);
    fireEvent.click(screen.getByLabelText("Close lightbox", { selector: ".lightbox-backdrop" }));
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("does not close lightbox when lightbox content area is clicked", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);
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
  ])("navigates correctly: %s", async (_, startIdx, buttonTestId, expectedIdx) => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[startIdx as number]);
    fireEvent.click(screen.getByTestId(buttonTestId as string));
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[expectedIdx as number].src);
  });

  // ── Counter ─────────────────────────────────────────────────────────────

  it("shows correct counter text for first image (1 / 3)", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("1 / 3");
  });

  it("shows correct counter text for second image (2 / 3)", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[1]);
    expect(screen.getByTestId("lightbox-counter")).toHaveTextContent("2 / 3");
  });

  // ── Keyboard Navigation ─────────────────────────────────────────────────

  it("navigates to next image on ArrowRight key", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[1].src);
  });

  it("navigates to previous image on ArrowLeft key", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[1]);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByTestId("lightbox-image")).toHaveAttribute("src", mockImages[0].src);
  });

  it("closes the lightbox when Escape key is pressed", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  it("does not navigate with keyboard when lightbox is closed", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    // No click to open lightbox
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.queryByTestId("lightbox-overlay")).not.toBeInTheDocument();
  });

  // ── Body Scroll Lock ────────────────────────────────────────────────────

  it("locks body scroll when lightbox is open", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    fireEvent.click(thumbs[0]);
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("updates body overflow when lightbox opens and closes", async () => {
    render(<PhotoGallery destinationId="test-dest" />);
    const thumbs = await screen.findAllByTestId(/gallery-thumb-\d+/);
    
    expect(document.body.style.overflow).toBe("");

    fireEvent.click(thumbs[0]);
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByTestId("lightbox-close"));
    expect(document.body.style.overflow).toBe("");
  });
});
