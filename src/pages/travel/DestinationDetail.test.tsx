import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import DestinationDetail from "./DestinationDetail";
import { travelData } from "../../portfolio";

// ── Minimal mocks ──────────────────────────────────────────────────────────

// Suppress react-reveal SSR warning in JSDOM
vi.mock("react-reveal", () => ({
  Fade: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// PhotoGallery makes real fetch calls — stub it out
vi.mock("../../components/photoGallery/PhotoGallery", () => ({
  default: ({ destinationId }: { destinationId: string }) => (
    <div data-testid="mock-photo-gallery" data-destination={destinationId} />
  ),
}));

// Header / Footer — avoid rendering full component trees
vi.mock("../../components/header/Header", () => ({
  default: () => <header data-testid="mock-header" />,
}));
vi.mock("../../components/footer/Footer", () => ({
  default: () => <footer data-testid="mock-footer" />,
}));

// ── Theme fixture ──────────────────────────────────────────────────────────
const theme = {
  body: "#0A0F1E",
  text: "#FFFFFF",
  secondaryText: "#8B9BB4",
  highlight: "#1e2a45",
  headerColor: "#12182e",
  dark: "#000",
  expTxtColor: "#AAA",
  imageHighlight: "#DC143C",
  compImgHighlight: "#1a2035",
  jacketColor: "#DC143C",
  splashBg: "#0A0F1E",
};

// ── Helpers ────────────────────────────────────────────────────────────────
const renderAt = (countryId: string, destinationId: string) =>
  render(
    <MemoryRouter initialEntries={[`/travel/${countryId}/${destinationId}`]}>
      <Route path="/travel/:countryId/:destinationId">
        <DestinationDetail theme={theme} />
      </Route>
      {/* Catch-all to verify redirects */}
      <Route path="/travel" exact>
        <div data-testid="travel-hub">Travel Hub</div>
      </Route>
    </MemoryRouter>
  );

// Pick a known trek destination
const nepalCountry = travelData.countries.find((c) => c.id === "nepal")!;
const abcDest = nepalCountry.destinations.find(
  (d) => d.id === "annapurna-base-camp"
)!;

// Pick a known non-trek destination (city)
const usaCountry = travelData.countries.find((c) => c.id === "usa")!;
const cityDest = usaCountry.destinations.find((d) => d.type === "city")!;

describe("DestinationDetail", () => {
  beforeEach(() => {
    // Reset DOM title
    document.title = "Test";
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Clean up any injected ld+json scripts
    const el = document.getElementById("destination-ld-json");
    if (el) el.remove();
  });

  // ── Basic render ─────────────────────────────────────────────────────────

  it("renders the destination name as h1", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-detail-h1")).toHaveTextContent(abcDest.name);
  });

  it("renders the header and footer", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
  });

  it("renders the hero section", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-detail-hero")).toBeInTheDocument();
  });

  it("renders the sidebar with quick facts", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-detail-sidebar")).toBeInTheDocument();
    expect(screen.getByText("Quick Facts")).toBeInTheDocument();
  });

  // ── Trek-specific stats ──────────────────────────────────────────────────

  it("renders the trail stats bar for trek destinations", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-trail-stats-bar")).toBeInTheDocument();
  });

  it("shows elevation, duration, and difficulty in the trail stats bar", () => {
    renderAt("nepal", "annapurna-base-camp");
    const bar = screen.getByTestId("dest-trail-stats-bar");
    expect(bar.textContent).toContain(abcDest.elevation);
    expect(bar.textContent).toContain(abcDest.duration);
    expect(bar.textContent).toContain(abcDest.difficulty);
  });

  it("shows the destination highlight quote", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-highlight")).toBeInTheDocument();
    expect(screen.getByTestId("dest-highlight").textContent).toContain(
      abcDest.highlight
    );
  });

  // ── City-type destinations ───────────────────────────────────────────────

  it("does NOT render the trail stats bar for city destinations", () => {
    renderAt("usa", cityDest.id);
    expect(screen.queryByTestId("dest-trail-stats-bar")).not.toBeInTheDocument();
  });

  it("does NOT render the highlight quote for city destinations without one", () => {
    // City destinations don't have a highlight
    if (!cityDest.highlight) {
      renderAt("usa", cityDest.id);
      expect(screen.queryByTestId("dest-highlight")).not.toBeInTheDocument();
    }
  });

  // ── Photo gallery ────────────────────────────────────────────────────────

  it("renders the photo gallery section when hasGallery is true", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-gallery-section")).toBeInTheDocument();
    const gallery = screen.getByTestId("mock-photo-gallery");
    expect(gallery).toBeInTheDocument();
    expect(gallery.getAttribute("data-destination")).toBe("annapurna-base-camp");
  });

  it("does NOT render the gallery section when hasGallery is false/absent", () => {
    // Find a dest without hasGallery
    const noGalleryDest = nepalCountry.destinations.find((d) => !d.hasGallery);
    if (noGalleryDest) {
      renderAt("nepal", noGalleryDest.id);
      expect(screen.queryByTestId("dest-gallery-section")).not.toBeInTheDocument();
    }
  });

  // ── Blog CTA ─────────────────────────────────────────────────────────────

  it("renders the Read Story button when blogSlug is set", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(screen.getByTestId("dest-blog-link")).toBeInTheDocument();
    expect(screen.getByTestId("dest-blog-link")).toHaveAttribute(
      "href",
      `/blogs/${abcDest.blogSlug}`
    );
  });

  it("does NOT render the Read Story button when blogSlug is null", () => {
    const noSlugDest = nepalCountry.destinations.find((d) => !d.blogSlug);
    if (noSlugDest) {
      renderAt("nepal", noSlugDest.id);
      expect(screen.queryByTestId("dest-blog-link")).not.toBeInTheDocument();
    }
  });

  // ── Related destinations sidebar ─────────────────────────────────────────

  it("renders related destinations of the same type", () => {
    // ABC is a trek — there should be other treks in Nepal
    renderAt("nepal", "annapurna-base-camp");
    const relatedCard = screen.queryByTestId("dest-related-card");
    const otherTreks = nepalCountry.destinations.filter(
      (d) => d.id !== "annapurna-base-camp" && d.type === "trek"
    );
    if (otherTreks.length > 0) {
      expect(relatedCard).toBeInTheDocument();
    }
  });

  it("does not show a related card when there are no same-type peers", () => {
    // Find a destination type with only one entry in its country
    const usaDestinations = usaCountry.destinations;
    const motoEntry = usaDestinations.find((d) => d.type === "moto");
    const motos = usaDestinations.filter((d) => d.type === "moto");
    if (motoEntry && motos.length === 1) {
      renderAt("usa", motoEntry.id);
      expect(screen.queryByTestId("dest-related-card")).not.toBeInTheDocument();
    }
  });

  // ── 404 / redirect ────────────────────────────────────────────────────────

  it("redirects to /travel for an invalid countryId", () => {
    renderAt("invalid-country", "some-dest");
    expect(screen.getByTestId("travel-hub")).toBeInTheDocument();
  });

  it("redirects to /travel for an invalid destinationId", () => {
    renderAt("nepal", "non-existent-dest");
    expect(screen.getByTestId("travel-hub")).toBeInTheDocument();
  });

  // ── JSON-LD structured data ───────────────────────────────────────────────

  it("injects a JSON-LD script tag with TouristAttraction schema", () => {
    renderAt("nepal", "annapurna-base-camp");
    const script = document.getElementById("destination-ld-json");
    expect(script).toBeInTheDocument();
    expect(script?.getAttribute("type")).toBe("application/ld+json");

    const parsed = JSON.parse(script?.innerHTML ?? "{}");
    expect(parsed["@type"]).toBe("TouristAttraction");
    expect(parsed.name).toBe(abcDest.name);
    expect(parsed.description).toBe(abcDest.description);
  });

  it("includes geo coordinates in JSON-LD when destination has coordinates", () => {
    renderAt("nepal", "annapurna-base-camp");
    const script = document.getElementById("destination-ld-json");
    const parsed = JSON.parse(script?.innerHTML ?? "{}");

    if (abcDest.coordinates) {
      expect(parsed.geo).toBeDefined();
      expect(parsed.geo.latitude).toBe(abcDest.coordinates[0]);
      expect(parsed.geo.longitude).toBe(abcDest.coordinates[1]);
    }
  });

  it("updates the document title on render", () => {
    renderAt("nepal", "annapurna-base-camp");
    expect(document.title).toContain(abcDest.name);
    expect(document.title).toContain("Nepal");
  });
});
