// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TravelPage from "./TravelPage";
import { travelData } from "../../portfolio";

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
  imageHighlight: "#a066fb",
  dark: "#000000",
  expTxtColor: "#444444",
  splashBg: "#0a0f1e",
};

const renderWithRouter = (ui: any) =>
  render(<BrowserRouter>{ui}</BrowserRouter>);

describe("TravelPage — Hero", () => {
  it("renders the cinematic hero headline", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(
      screen.getByText(/Born in the Himalayas/i)
    ).toBeInTheDocument();
  });

  it("renders all hero stats from travelData.heroStats", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    travelData.heroStats.forEach((stat) => {
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });

  it("renders the scroll arrow link", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(screen.getByLabelText(/Scroll to destinations/i)).toBeInTheDocument();
  });
});

describe("TravelPage — Story Section", () => {
  it("renders the personal story heading", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(
      screen.getByText(/From Himalayan Trails to American Roads/i)
    ).toBeInTheDocument();
  });

  it("renders a glance card for each country", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    travelData.countries.forEach((country) => {
      const matches = screen.getAllByText(country.name);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe("TravelPage — Country Tabs", () => {
  it("renders a tab for each country in travelData.countries", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    travelData.countries.forEach((country) => {
      expect(
        screen.getByRole("tab", { name: new RegExp(country.name, "i") })
      ).toBeInTheDocument();
    });
  });

  it("defaults to the first country tab being active", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const firstTab = screen.getByRole("tab", {
      name: new RegExp(travelData.countries[0].name, "i"),
    });
    expect(firstTab).toHaveAttribute("aria-selected", "true");
  });

  it("switches active country when another tab is clicked", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const usaTab = screen.getByRole("tab", { name: /United States/i });
    fireEvent.click(usaTab);
    expect(usaTab).toHaveAttribute("aria-selected", "true");
  });
});

describe("TravelPage — Type Filter Chips", () => {
  it("renders an 'All' chip for the active country", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("renders trek and hike chips for Nepal", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // Nepal is default — should have trek + hike + city + moto chips
    expect(
      screen.getByRole("button", { name: /Treks/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Day Hikes/i })
    ).toBeInTheDocument();
  });

  it("resets type filter to All when switching countries", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // Switch to Treks filter
    const trekChip = screen.getByRole("button", { name: /Treks/i });
    fireEvent.click(trekChip);
    expect(trekChip).toHaveAttribute("aria-pressed", "true");

    // Switch country
    const usaTab = screen.getByRole("tab", { name: /United States/i });
    fireEvent.click(usaTab);

    // All chip should now be active
    const allChip = screen.getByRole("button", { name: "All" });
    expect(allChip).toHaveAttribute("aria-pressed", "true");
  });
});

describe("TravelPage — Nepal Destinations", () => {
  it("renders all Nepal trek names", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const nepalTreks = travelData.countries[0].destinations.filter(
      (d) => d.type === "trek"
    );
    nepalTreks.forEach((trek) => {
      expect(screen.getByText(trek.name)).toBeInTheDocument();
    });
  });

  it("renders Nepal hike names", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const nepalHikes = travelData.countries[0].destinations.filter(
      (d) => d.type === "hike"
    );
    nepalHikes.forEach((hike) => {
      expect(screen.getByText(hike.name)).toBeInTheDocument();
    });
  });

  it("renders a View Details button for all Nepal destinations (no separate Coming Soon badge)", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // Every destination now has a View Details button via data-testid
    const nepalDests = travelData.countries[0].destinations;
    nepalDests.forEach((dest) => {
      expect(
        screen.getByTestId(`view-details-${dest.id}`)
      ).toBeInTheDocument();
    });
  });
});

describe("TravelPage — USA Destinations", () => {
  it("renders all USA destination names when USA tab is clicked", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    fireEvent.click(screen.getByRole("tab", { name: /United States/i }));

    const usaDests = travelData.countries[1].destinations;
    usaDests.forEach((dest) => {
      expect(screen.getByText(dest.name)).toBeInTheDocument();
    });
  });
});

describe("TravelPage — Card type rendering", () => {
  it("does not show duration badge for city-type destinations", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // Pokhara is a city — it should not have a duration badge
    // We verify no duration text appears next to the city card (visual check via aria)
    const pokharaArticle = screen.getByRole("article", { name: /Pokhara/i });
    expect(pokharaArticle).toBeInTheDocument();
    // City cards should not contain a duration badge class child
    expect(pokharaArticle.querySelector(".duration-badge")).toBeNull();
  });

  it("trek cards have an elevation label", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    // Annapurna Base Camp is a trek — it should have elevation label "4,130m"
    expect(screen.getByText("4,130m")).toBeInTheDocument();
  });
});

describe("TravelPage — Mission Statement", () => {
  it("renders the Nepal mission statement", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(
      screen.getByText(/Why I Document Nepal/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/love letter to my homeland/i)
    ).toBeInTheDocument();
  });
});

describe("TravelPage — Moto Section", () => {
  it("renders the moto banner", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    expect(screen.getByText(/On Two Wheels/i)).toBeInTheDocument();
    // Nepal Mountain Roads appears in both destination grid + moto banner
    const motoMatches = screen.getAllByText(/Nepal Mountain Roads/i);
    expect(motoMatches.length).toBeGreaterThanOrEqual(1);
  });
});

describe("TravelPage — Subscribe CTA", () => {
  it("renders the subscribe CTA with link", () => {
    renderWithRouter(<TravelPage theme={mockTheme as any} />);
    const link = screen.getByText(/Subscribe below/i);
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("#footer-newsletter");
  });
});
