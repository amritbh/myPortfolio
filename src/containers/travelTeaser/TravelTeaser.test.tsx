// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import TravelTeaser from "./TravelTeaser";

const mockTheme = {
  text: "#000",
  secondaryText: "#666",
  headerColor: "#fff",
  highlight: "#ccc",
  compImgHighlight: "#f0f0f0",
  body: "#fff",
};

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("TravelTeaser Component", () => {
  it("renders the section heading 'Beyond the Code'", () => {
    renderWithRouter(<TravelTeaser theme={mockTheme} />);
    expect(screen.getByText("Beyond the Code")).toBeInTheDocument();
  });

  it("renders all Nepal trek destination chips", () => {
    renderWithRouter(<TravelTeaser theme={mockTheme} />);
    const nepalDestinations = [
      "ABC",
      "Tilicho Lake",
      "Gosaikunda",
      "Mustang",
      "Pokhara",
      "Badimalika",
      "Aama Yangri",
    ];
    nepalDestinations.forEach((dest) => {
      expect(screen.getByText(dest)).toBeInTheDocument();
    });
  });

  it("renders the Nepal card with link to /travel", () => {
    renderWithRouter(<TravelTeaser theme={mockTheme} />);
    expect(screen.getByText("Himalayan Adventures")).toBeInTheDocument();
    const nepalLinks = screen
      .getAllByRole("link")
      .filter((el) => el.getAttribute("href") === "/travel");
    expect(nepalLinks.length).toBeGreaterThan(0);
  });

  it("renders the USA card", () => {
    renderWithRouter(<TravelTeaser theme={mockTheme} />);
    expect(screen.getByText("Exploring America")).toBeInTheDocument();
  });

  it("renders the motorcycling strip with Coming Soon badge", () => {
    renderWithRouter(<TravelTeaser theme={mockTheme} />);
    expect(screen.getByText(/Motorcycling/i)).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    renderWithRouter(<TravelTeaser theme={mockTheme} />);
    expect(
      screen.getByText(/Himalayas to the roads of Oregon/i)
    ).toBeInTheDocument();
  });

  it("renders correctly when theme is not provided (default fallback)", () => {
    // This covers all the `theme ? ... : undefined` branch conditions
    renderWithRouter(<TravelTeaser />);
    expect(screen.getByText("Beyond the Code")).toBeInTheDocument();
  });
});
