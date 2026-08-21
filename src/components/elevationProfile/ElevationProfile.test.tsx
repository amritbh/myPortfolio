import React from "react";
import { render, screen } from "@testing-library/react";
import ElevationProfile from "./ElevationProfile";
import { ElevationPoint } from "../../portfolio";

const mockData: ElevationPoint[] = [
  { day: 1, altitude: 1000, campName: "Camp 1" },
  { day: 2, altitude: 2000, campName: "Camp 2", note: "Hard day" },
  { day: 3, altitude: 3000, campName: "Camp 3" },
];

describe("ElevationProfile", () => {
  it("renders correctly with data", () => {
    render(<ElevationProfile data={mockData} accentColor="#ff0000" theme={{ text: "#fff", secondaryText: "#ccc" }} />);
    
    // Check header renders
    expect(screen.getByText("Elevation Profile")).toBeInTheDocument();
    
    // Check SVG container renders
    expect(screen.getByTestId("elevation-profile")).toBeInTheDocument();
  });

  it("does not render when data is empty", () => {
    const { container } = render(<ElevationProfile data={[]} accentColor="#ff0000" theme={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render when data is undefined", () => {
    const { container } = render(<ElevationProfile data={undefined as any} accentColor="#ff0000" theme={{}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
