import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import TravelMap from "./TravelMap";
import { travelData } from "../../portfolio";

// Mock React Leaflet components — expose eventHandlers so we can test pin clicks
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children, bounds, center, zoom, scrollWheelZoom }: any) => (
    <div
      data-testid="leaflet-map-container"
      data-bounds={bounds ? "has-bounds" : "no-bounds"}
      data-center={center ? JSON.stringify(center) : "none"}
      data-zoom={zoom}
      data-scroll-zoom={String(scrollWheelZoom)}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url }: any) => <div data-testid="leaflet-tile-layer" data-url={url} />,
  CircleMarker: ({ children, eventHandlers, pathOptions }: any) => (
    <div
      data-testid="leaflet-circle-marker"
      data-fill={pathOptions?.fillColor}
      data-border={pathOptions?.color}
      onClick={eventHandlers?.click}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: any) => <div data-testid="leaflet-tooltip">{children}</div>,
}));

// Mock Leaflet core methods
vi.mock("leaflet", () => ({
  default: {
    latLngBounds: vi.fn(() => ({
      pad: vi.fn(() => ({ __bounds: true })),
    })),
  },
}));

const darkTheme = {
  body: "#0A0F1E",
  text: "#FFFFFF",
  secondaryText: "#8B9BB4",
};

const lightTheme = {
  body: "#FFFFFF",
  text: "#000000",
  secondaryText: "#666666",
};

// Helper: create a mock IntersectionObserver that captures the callback
// so we can fire intersection events manually
function makeMockObserver() {
  let savedCallback: IntersectionObserverCallback;
  const observeMock = vi.fn();
  const disconnectMock = vi.fn();

  const MockObserver = vi.fn((callback: IntersectionObserverCallback) => {
    savedCallback = callback;
    return { observe: observeMock, disconnect: disconnectMock };
  });

  const triggerIntersect = () => {
    act(() => {
      savedCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
  };

  return { MockObserver, observeMock, disconnectMock, triggerIntersect };
}

describe("TravelMap Component (Leaflet)", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // ── Pre-intersection (skeleton) ──────────────────────────────────────────

  it("renders map container with correct CSS custom properties", () => {
    const { MockObserver } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);

    const container = screen.getByTestId("travel-map-container");
    expect(container).toBeInTheDocument();
    expect(container.style.getPropertyValue("--bg")).toBe("#0A0F1E");
    expect(container.style.getPropertyValue("--shimmer")).toBe("#8B9BB4");
  });

  it("shows skeleton before entering viewport", () => {
    const { MockObserver } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);

    expect(screen.getByTestId("travel-map-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("leaflet-wrapper")).not.toBeInTheDocument();
  });

  it("sets up IntersectionObserver and observes the container", () => {
    const { MockObserver, observeMock } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);

    expect(MockObserver).toHaveBeenCalledWith(expect.any(Function), { threshold: 0.1 });
    expect(observeMock).toHaveBeenCalled();
  });

  // ── Post-intersection (map renders) ─────────────────────────────────────

  it("shows the leaflet map and hides skeleton after intersection", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    expect(screen.queryByTestId("travel-map-skeleton")).not.toBeInTheDocument();
    expect(screen.getByTestId("leaflet-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("leaflet-map-container")).toBeInTheDocument();
    expect(screen.getByTestId("leaflet-tile-layer")).toBeInTheDocument();
  });

  it("disconnects observer after intersection", () => {
    const { MockObserver, disconnectMock, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    expect(disconnectMock).toHaveBeenCalled();
  });

  it("renders a CircleMarker for every destination with coordinates", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    const markers = screen.getAllByTestId("leaflet-circle-marker");
    // Every destination in travelData should have a marker
    const totalDestinations = travelData.countries.reduce(
      (acc, c) => acc + c.destinations.filter((d) => d.coordinates).length,
      0
    );
    expect(markers).toHaveLength(totalDestinations);
  });

  it("renders a tooltip with the destination name for each marker", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    // At minimum the first Nepal destination's name should appear
    const firstDest = travelData.countries[0].destinations[0];
    expect(screen.getByText(firstDest.name)).toBeInTheDocument();
  });

  it("calls onPinClick with the correct destination id when a marker is clicked", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    const onPinClick = vi.fn();
    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={onPinClick} />);
    triggerIntersect();

    const markers = screen.getAllByTestId("leaflet-circle-marker");
    fireEvent.click(markers[0]);

    const firstDestId = travelData.countries[0].destinations[0].id;
    expect(onPinClick).toHaveBeenCalledWith(firstDestId);
  });

  // ── Dark vs Light mode ────────────────────────────────────────────────────

  it("uses CartoDB Dark Matter tiles in dark mode", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    const tile = screen.getByTestId("leaflet-tile-layer");
    expect(tile.getAttribute("data-url")).toContain("dark_all");
  });

  it("uses CartoDB Voyager tiles in light mode", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={lightTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    const tile = screen.getByTestId("leaflet-tile-layer");
    expect(tile.getAttribute("data-url")).toContain("voyager");
  });

  it("uses dark pin border (#222) in dark mode", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    const markers = screen.getAllByTestId("leaflet-circle-marker");
    expect(markers[0].getAttribute("data-border")).toBe("#222");
  });

  it("uses white pin border (#fff) in light mode", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={travelData.countries} theme={lightTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    const markers = screen.getAllByTestId("leaflet-circle-marker");
    expect(markers[0].getAttribute("data-border")).toBe("#fff");
  });

  // ── Empty countries edge case ─────────────────────────────────────────────

  it("renders map with no markers when countries list is empty", () => {
    const { MockObserver, triggerIntersect } = makeMockObserver();
    global.IntersectionObserver = MockObserver as any;

    render(<TravelMap countries={[]} theme={darkTheme} onPinClick={vi.fn()} />);
    triggerIntersect();

    expect(screen.getByTestId("leaflet-map-container")).toBeInTheDocument();
    expect(screen.queryAllByTestId("leaflet-circle-marker")).toHaveLength(0);
  });
});
