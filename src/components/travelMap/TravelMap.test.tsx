import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import TravelMap from "./TravelMap";
import { travelData } from "../../portfolio";

// Mock React Leaflet components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: any) => <div data-testid="leaflet-map-container">{children}</div>,
  TileLayer: () => <div data-testid="leaflet-tile-layer" />,
  CircleMarker: ({ children }: any) => <div data-testid="leaflet-circle-marker">{children}</div>,
  Tooltip: ({ children }: any) => <div data-testid="leaflet-tooltip">{children}</div>,
}));

// Mock Leaflet core methods
vi.mock("leaflet", () => ({
  default: {
    latLngBounds: vi.fn(() => ({
      pad: vi.fn(() => ({})),
    })),
  },
}));

const mockTheme = {
  body: "#0A0F1E",
  text: "#FFFFFF",
  secondaryText: "#8B9BB4",
};

describe("TravelMap Component (Leaflet)", () => {
  let mockIntersectionObserver: any;
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    mockIntersectionObserver = vi.fn((callback) => {
      // Keep a reference if we want to simulate intersections
      // For now, we'll just test the initial un-intersected state
      return {
        observe: observeMock,
        disconnect: disconnectMock,
      };
    });

    global.IntersectionObserver = mockIntersectionObserver as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders map container and skeleton initially (before intersect)", () => {
    render(
      <TravelMap
        countries={travelData.countries}
        theme={mockTheme}
        onPinClick={vi.fn()}
      />
    );

    const container = screen.getByTestId("travel-map-container");
    expect(container).toBeInTheDocument();

    const skeleton = screen.getByTestId("travel-map-skeleton");
    expect(skeleton).toBeInTheDocument();

    // Mapbox/Leaflet wrapper shouldn't exist until intersected
    const map = screen.queryByTestId("leaflet-wrapper");
    expect(map).not.toBeInTheDocument();
  });

  it("sets up IntersectionObserver", () => {
    render(
      <TravelMap
        countries={travelData.countries}
        theme={mockTheme}
        onPinClick={vi.fn()}
      />
    );

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(observeMock).toHaveBeenCalled();
  });
});
