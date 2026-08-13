import React, { useEffect, useRef, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./TravelMap.css";
import { CountryEntry } from "../../portfolio";
import L from "leaflet";

interface TravelMapProps {
  countries: CountryEntry[];
  theme: {
    body: string;
    text: string;
    secondaryText: string;
    // ... other theme properties
  };
  onPinClick: (destinationId: string) => void;
}

const TravelMap: React.FC<TravelMapProps> = ({ countries, theme, onPinClick }) => {
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Detect dark mode based on theme body color
  const isDark =
    theme.body !== "#FFFFFF" &&
    theme.body !== "#ffffff" &&
    !theme.body.toLowerCase().startsWith("#f");

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  // Lazy loading observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerWrapperRef.current) {
      observer.observe(containerWrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Compute markers and bounds
  const { markers, bounds } = useMemo(() => {
    const markersData: Array<{
      id: string;
      name: string;
      latLng: [number, number];
      color: string;
    }> = [];
    const latLngs: L.LatLngExpression[] = [];

    countries.forEach((country) => {
      country.destinations.forEach((dest) => {
        if (dest.coordinates && dest.coordinates.length === 2) {
          // Leaflet uses [lat, lng] which matches our schema natively
          const latLng: [number, number] = [dest.coordinates[0], dest.coordinates[1]];
          markersData.push({
            id: dest.id,
            name: dest.name,
            latLng,
            color: country.accentColor,
          });
          latLngs.push(latLng);
        }
      });
    });

    // Create bounds if we have points, else default bounds
    const mapBounds = latLngs.length > 0 ? L.latLngBounds(latLngs).pad(0.2) : undefined;

    return { markers: markersData, bounds: mapBounds };
  }, [countries]);

  return (
    <div
      className="travel-map-container"
      ref={containerWrapperRef}
      style={
        {
          "--bg": theme.body,
          "--shimmer": theme.secondaryText,
        } as React.CSSProperties
      }
      data-testid="travel-map-container"
    >
      {!inView && <div className="travel-map-skeleton" data-testid="travel-map-skeleton" />}

      {inView && (
        <div className="travel-map-wrapper loaded" data-testid="leaflet-wrapper">
          <MapContainer
            bounds={bounds}
            center={bounds ? undefined : [20, 0]}
            zoom={bounds ? undefined : 2}
            scrollWheelZoom={false}
            className="leaflet-map-instance"
          >
            <TileLayer url={tileUrl} attribution={tileAttribution} />
            {markers.map((marker) => (
              <CircleMarker
                key={marker.id}
                center={marker.latLng}
                radius={6}
                pathOptions={{
                  color: isDark ? "#222" : "#fff",
                  weight: 2,
                  fillColor: marker.color,
                  fillOpacity: 1,
                }}
                eventHandlers={{
                  click: () => onPinClick(marker.id),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <span style={{ fontWeight: 600 }}>{marker.name}</span>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default TravelMap;
