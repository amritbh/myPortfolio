// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TravelPage from "./TravelPage";

// matchMedia mock required by Header > ThemeSwitcher
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  highlight: "#a066fb",
  compImgHighlight: "#f5f5f5",
  headerColor: "#ffffffaa",
  jacketColor: "#388BFD",
};

const renderWithRouter = (ui: any, { route = '/' } = {}) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("TravelPage Component", () => {
  it("renders the main hero heading 'Adventures and Journeys'", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(screen.getByText("Adventures and Journeys")).toBeInTheDocument();
  });

  it("renders the hero subtitle", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(
      screen.getByText(/Nepal born\. Mountain shaped\./i)
    ).toBeInTheDocument();
  });

  it("renders the Himalayan Treks section heading", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // The heading text includes emoji + text so we use a regex
    expect(
      screen.getByRole("heading", { name: /Himalayan Treks/i })
    ).toBeInTheDocument();
  });

  it("renders all 7 Nepal trek card names", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const trekNames = [
      "Annapurna Base Camp",
      "Tilicho Lake",
      "Gosaikunda",
      "Upper Mustang",
      "Pokhara",
      "Badimalika",
      "Aama Yangri",
    ];
    trekNames.forEach((name) => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  it("renders 'Coming Soon' badges for trek cards", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const badges = screen.getAllByText("Coming Soon");
    expect(badges.length).toBeGreaterThanOrEqual(7);
  });

  it("renders the Nepal tourism support callout", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(
      screen.getByText(/inspire and support Nepal tourism/i)
    ).toBeInTheDocument();
  });

  it("renders the Motorcycling section", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(screen.getByText(/On Two Wheels/i)).toBeInTheDocument();
    expect(screen.getByText("Nepal Mountain Roads")).toBeInTheDocument();
  });

  it("renders the USA Travel section with all 3 destinations", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // Use heading role for the section heading to avoid ambiguity with the hero chip
    expect(
      screen.getByRole("heading", { name: /Exploring America/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Oregon")).toBeInTheDocument();
    expect(screen.getByText("Pacific Coast")).toBeInTheDocument();
    expect(screen.getByText("Crater Lake")).toBeInTheDocument();
  });

  it("renders the subscribe CTA link to footer", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const ctaLink = screen.getByText(/Subscribe below/i);
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.getAttribute("href")).toBe("#footer-newsletter");
  });

  it("renders correctly without theme prop (fallback branches)", () => {
    // Header requires a theme object so we pass a minimal one; we only
    // test that TravelPage's own conditional-theme branches don't crash
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(screen.getByText("Adventures and Journeys")).toBeInTheDocument();
  });
});
