import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, afterEach, beforeEach } from "vitest";
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
    src: "https://amrit.cloud/media/travel/test/gallery/videos/04.mp4",
    thumb: "https://amrit.cloud/media/travel/test/gallery/thumbs/04-thumb.jpg",
    alt: "Test video 4",
    caption: "Caption for video",
    type: "video"
  },
];

const mockFetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockImages),
  } as Response)
);

describe("PhotoGallery Inline Carousel", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("does not render anything if gallery is empty", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response)
    );
    let container: HTMLElement;
    await act(async () => {
      const result = render(<PhotoGallery destinationId="empty-dest" />);
      container = result.container;
    });
    expect(container!.firstChild).toBeNull();
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error("Network Error")));
    let container: HTMLElement;
    await act(async () => {
      const result = render(<PhotoGallery destinationId="error-dest" />);
      container = result.container;
    });
    expect(container!.firstChild).toBeNull();
  });

  it("renders a single initial image", async () => {
    await act(async () => {
      render(<PhotoGallery destinationId="test-dest" />);
    });
    const img = screen.getByTestId("gallery-image");
    expect(img).toHaveAttribute("src", mockImages[0].src);
  });

  it("shows correct counter text for first image (1 / 3)", async () => {
    await act(async () => {
      render(<PhotoGallery destinationId="test-dest" />);
    });
    expect(screen.getByTestId("carousel-counter")).toHaveTextContent("1 / 3");
  });

  it("navigates correctly to the next image", async () => {
    await act(async () => {
      render(<PhotoGallery destinationId="test-dest" />);
    });
    const nextBtn = screen.getByTestId("carousel-next");
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("gallery-image")).toHaveAttribute("src", mockImages[1].src);
    expect(screen.getByTestId("carousel-counter")).toHaveTextContent("2 / 3");
  });

  it("navigates correctly to the previous image", async () => {
    await act(async () => {
      render(<PhotoGallery destinationId="test-dest" />);
    });
    const prevBtn = screen.getByTestId("carousel-prev");
    fireEvent.click(prevBtn); // from index 0 goes to last item
    const video = screen.getByTestId("gallery-video");
    expect(video.tagName).toBe("VIDEO");
    expect(video).toHaveAttribute("src", mockImages[2].src);
    expect(screen.getByTestId("carousel-counter")).toHaveTextContent("3 / 3");
  });

  it("stops propagation on arrow clicks to prevent card navigation", async () => {
    await act(async () => {
      render(<PhotoGallery destinationId="test-dest" />);
    });
    const nextBtn = screen.getByTestId("carousel-next");
    const clickEvent = new MouseEvent("click", { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, "stopPropagation");
    fireEvent(nextBtn, clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
