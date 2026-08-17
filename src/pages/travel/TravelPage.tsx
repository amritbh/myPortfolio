import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./Travel.css";
import { travelData } from "../../portfolio";
import type { CountryEntry, DestinationEntry } from "../../portfolio";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TravelMap from "../../components/travelMap/TravelMap";
import PhotoGallery from "../../components/photoGallery/PhotoGallery";
import { Fade } from "react-reveal";
import type { Theme, ThemeMode } from "../../types";

// ── Type label map ───────────────────────────────────────────────────────────
// Add a new entry here only when adding a brand new destination type.
const TYPE_LABELS: Record<string, string> = {
  all: "All",
  trek: "🏔 Treks",
  hike: "🥾 Day Hikes",
  city: "🏙 Cities",
  "road-trip": "🛣 Road Trips",
  nature: "🌿 Nature",
  moto: "🏍 Moto",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#2ea043",
  Moderate: "#d29922",
  Strenuous: "#da3633",
};

/** Converts elevation string like "4,130m" into a 0–100% value relative to 6000m */
const getElevationPct = (elevation: string): string => {
  const meters = parseInt(elevation.replace(/[^0-9]/g, ""), 10);
  return `${Math.min((meters / 6000) * 100, 100).toFixed(1)}%`;
};

interface TravelPageProps {
  theme: Theme;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

const TravelPage: React.FC<TravelPageProps> = ({
  theme,
  themeMode,
  onThemeChange,
}) => {
  const history = useHistory();
  const [activeCountryId, setActiveCountryId] = useState<string>(
    travelData.countries[0].id
  );
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>("all");

  const activeCountry =
    travelData.countries.find((c) => c.id === activeCountryId) ??
    travelData.countries[0];

  const handleCountryChange = (id: string) => {
    setActiveCountryId(id);
    setActiveTypeFilter("all"); // reset filter on country switch
  };

  // ── Hero ─────────────────────────────────────────────────────────────────
  const renderHero = () => (
    <section className="travel-hero" aria-label="Travel hero">
      <div className="travel-hero-overlay" />
      <div className="travel-hero-content">
        <Fade bottom duration={800}>
          <p className="travel-hero-eyebrow">Passport meets Pixel</p>
          <h1 className="travel-hero-title">
            Born in the Himalayas.
            <br />
            Wandering the World.
          </h1>
        </Fade>
        <Fade bottom duration={1000} delay={100}>
          <p className="travel-hero-subtitle">
            Nepal-born, Oregon-based. I trek when I can, travel when I must,
            and document every trail, road, and horizon along the way.
          </p>
        </Fade>
        <Fade bottom duration={1000} delay={200}>
          <div className="travel-hero-stats" aria-label="Travel statistics">
            {travelData.heroStats.map((stat) => (
              <div className="travel-hero-stat" key={stat.label}>
                <span className="travel-hero-stat-value">{stat.value}</span>
                <span className="travel-hero-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </Fade>
        <Fade bottom duration={800} delay={300}>
          <a
            href="#destinations"
            className="travel-scroll-arrow"
            aria-label="Scroll to destinations"
          >
            ↓
          </a>
        </Fade>
      </div>
    </section>
  );

  // ── Story section ─────────────────────────────────────────────────────────
  const renderStorySection = () => (
    <section
      className="travel-story-section"
      style={{ backgroundColor: theme.body }}
      aria-label="My travel story"
    >
      <div className="travel-section-inner travel-story-inner">
        <Fade left duration={800}>
          <div className="travel-story-text">
            <span className="travel-story-eyebrow">My Story</span>
            <h2 className="travel-story-heading" style={{ color: theme.text }}>
              From Himalayan Trails to American Roads
            </h2>
            <p
              className="travel-story-body"
              style={{ color: theme.secondaryText }}
            >
              I grew up surrounded by mountains in Nepal, where trekking is not a
              hobby — it is just life. I have walked to Annapurna Base Camp, sat
              beside the sacred waters of Gosaikunda, and ridden through passes
              that do not appear on most maps. In 2023 I moved to Oregon, and I
              started discovering America with the same curiosity. My mission is
              simple: document every trail and city so that others can find what
              I found — and so Nepal's incredible routes get the attention they
              deserve.
            </p>
          </div>
        </Fade>
        <Fade right duration={800} delay={100}>
          <div className="travel-story-glance">
            {travelData.countries.map((country) => (
              <div
                key={country.id}
                className="travel-glance-card"
                style={{
                  backgroundColor: theme.headerColor,
                  borderColor: country.accentColor + "44",
                  borderLeftColor: country.accentColor,
                }}
              >
                <span className="travel-glance-flag">{country.flag}</span>
                <div>
                  <p
                    className="travel-glance-name"
                    style={{ color: theme.text }}
                  >
                    {country.name}
                  </p>
                  <p
                    className="travel-glance-count"
                    style={{ color: theme.secondaryText }}
                  >
                    {country.destinations.length} destinations
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Fade>
      </div>
    </section>
  );

  // ── Country tabs ──────────────────────────────────────────────────────────
  const renderCountryTabs = () => (
    <div
      className="travel-country-tabs"
      role="tablist"
      aria-label="Select country"
      style={{ backgroundColor: theme.body, borderBottomColor: theme.highlight }}
    >
      <div className="travel-section-inner travel-tabs-inner">
        {travelData.countries.map((country) => {
          const isActive = country.id === activeCountryId;
          return (
            <button
              key={country.id}
              role="tab"
              aria-selected={isActive}
              id={`tab-${country.id}`}
              aria-controls={`panel-${country.id}`}
              className={`travel-country-tab ${isActive ? "active" : ""}`}
              style={
                isActive
                  ? {
                      color: country.accentColor,
                      borderBottomColor: country.accentColor,
                    }
                  : { color: theme.secondaryText }
              }
              onClick={() => handleCountryChange(country.id)}
            >
              <span className="tab-flag">{country.flag}</span>
              <span className="tab-name">{country.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Type filter chips ─────────────────────────────────────────────────────
  const renderTypeFilterChips = (country: CountryEntry) => {
    const types = [
      "all",
      ...Array.from(new Set(country.destinations.map((d) => d.type))),
    ];
    return (
      <div
        className="travel-type-chips"
        role="group"
        aria-label="Filter by type"
        style={{ backgroundColor: theme.body }}
      >
        <div className="travel-section-inner travel-chips-inner">
          {types.map((type) => {
            const isActive = activeTypeFilter === type;
            return (
              <button
                key={type}
                className={`type-chip ${isActive ? "active" : ""}`}
                style={
                  isActive
                    ? {
                        backgroundColor: country.accentColor,
                        color: "#fff",
                        borderColor: country.accentColor,
                      }
                    : {
                        color: theme.secondaryText,
                        borderColor: theme.highlight,
                      }
                }
                onClick={() => setActiveTypeFilter(type)}
                aria-pressed={isActive}
              >
                {TYPE_LABELS[type] ?? type}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Destination card ──────────────────────────────────────────────────────
  const renderDestinationCard = (
    dest: DestinationEntry,
    accentColor: string,
    index: number
  ) => {
    const isTrek = dest.type === "trek";
    const isHike = dest.type === "hike";
    const hasTrail = isTrek || isHike;

    return (
      <Fade bottom duration={600} delay={index * 70} key={dest.id}>
        <div
          id={`dest-${dest.id}`}
          className={`destination-card dest-type-${dest.type} ${dest.blogSlug ? "clickable-card" : ""}`}
          style={
            {
              backgroundColor: theme.headerColor,
              borderColor: theme.highlight,
              "--travel-accent": accentColor,
              cursor: dest.blogSlug ? "pointer" : "default",
            } as React.CSSProperties
          }
          role="article"
          aria-label={dest.name}
          tabIndex={dest.blogSlug ? 0 : undefined}
          onClick={() => {
            if (dest.blogSlug) {
              history.push(`/blogs/${dest.blogSlug}`);
            }
          }}
          onKeyDown={(e) => {
            if (dest.blogSlug && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              history.push(`/blogs/${dest.blogSlug}`);
            }
          }}
        >
          {/* Header row */}
          <div className="dest-card-header">
            <span className="dest-emoji" role="img" aria-label={dest.name}>
              {dest.emoji}
            </span>
            <span
              className="dest-region-badge"
              style={{
                color: accentColor,
                backgroundColor: accentColor + "18",
                borderColor: accentColor + "44",
              }}
            >
              {dest.region}
            </span>
          </div>

          <h3 className="dest-name" style={{ color: theme.text }}>
            {dest.name}
          </h3>

          {/* Trek-specific: elevation gradient bar */}
          {isTrek && dest.elevation && (
            <div className="trek-elevation-wrap" aria-label="Elevation">
              <div
                className="trek-elevation-bar"
                style={
                  { "--elevation-pct": getElevationPct(dest.elevation) } as React.CSSProperties
                }
              />
              <span
                className="trek-elevation-label"
                style={{ color: theme.secondaryText }}
              >
                {dest.elevation}
              </span>
            </div>
          )}

          {/* Trail badges row */}
          {hasTrail && (dest.difficulty || dest.duration) && (
            <div className="dest-trail-badges">
              {dest.difficulty && (
                <span
                  className={`difficulty-badge diff-${dest.difficulty.toLowerCase()}`}
                  style={{
                    backgroundColor:
                      DIFFICULTY_COLOR[dest.difficulty] + "22",
                    color: DIFFICULTY_COLOR[dest.difficulty],
                    borderColor: DIFFICULTY_COLOR[dest.difficulty] + "55",
                  }}
                >
                  {dest.difficulty}
                </span>
              )}
              {dest.duration && (
                <span
                  className="duration-badge"
                  style={{ color: theme.secondaryText, borderColor: theme.highlight }}
                >
                  {isHike ? "⏱ " : "🗓 "}
                  {dest.duration}
                </span>
              )}
              {/* Hike: show plain elevation stat (no bar) */}
              {isHike && dest.elevation && (
                <span
                  className="hike-elevation-stat"
                  style={{ color: theme.secondaryText, borderColor: theme.highlight }}
                >
                  📍 {dest.elevation}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <p
            className="dest-description"
            style={{ color: theme.secondaryText }}
          >
            {dest.description}
          </p>

          {/* Highlight quote */}
          {hasTrail && dest.highlight && (
            <p
              className="dest-highlight"
              style={{ color: accentColor, borderLeftColor: accentColor }}
            >
              &ldquo;{dest.highlight}&rdquo;
            </p>
          )}

          {/* Photo Gallery */}
          {dest.hasGallery && (
            <PhotoGallery destinationId={dest.id} columns={3} />
          )}

          {dest.blogSlug ? (
            <a
              href={`/blogs/${dest.blogSlug}`}
              className="read-story-btn"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              ✍ Read Story
            </a>
          ) : !dest.hasGallery ? (
            <span className="coming-soon-badge">Coming Soon</span>
          ) : null}
        </div>
      </Fade>
    );
  };

  // ── Destination grid ──────────────────────────────────────────────────────
  const renderDestinationGrid = (
    country: CountryEntry,
    typeFilter: string
  ) => {
    const filtered =
      typeFilter === "all"
        ? country.destinations
        : country.destinations.filter((d) => d.type === typeFilter);

    return (
      <section
        className="travel-section"
        role="tabpanel"
        id={`panel-${country.id}`}
        aria-labelledby={`tab-${country.id}`}
        style={{ backgroundColor: theme.body }}
      >
        <div className="travel-section-inner">
          {filtered.length === 0 ? (
            <p
              className="travel-empty-state"
              style={{ color: theme.secondaryText }}
            >
              No destinations of this type yet — check back soon!
            </p>
          ) : (
            <div className="destination-grid">
              {filtered.map((dest, i) =>
                renderDestinationCard(dest, country.accentColor, i)
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

  // ── Nepal mission statement ───────────────────────────────────────────────
  const renderMissionStatement = () => (
    <section
      className="travel-mission-section"
      style={{ backgroundColor: theme.body }}
      aria-label="Nepal tourism mission"
    >
      <div className="travel-section-inner">
        <Fade bottom duration={800}>
          <div
            className="travel-mission-card"
            style={{
              backgroundColor: theme.compImgHighlight,
              borderLeftColor: "#DC143C",
            }}
          >
            <div className="mission-icon-wrap">
              <span role="img" aria-label="Nepal flag" className="mission-flag">
                🇳🇵
              </span>
            </div>
            <div>
              <h3
                className="mission-title"
                style={{ color: theme.text }}
              >
                Why I Document Nepal
              </h3>
              <p
                className="mission-body"
                style={{ color: theme.secondaryText }}
              >
                Nepal's trails shaped everything I am. But most of them remain
                undiscovered by the world. My mission is to change that — one
                documented journey at a time. Every post I write about a
                Himalayan trek is a love letter to my homeland and an invitation
                for you to visit. If you love the mountains, share these stories
                when they go live.
              </p>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );

  // ── Moto banner ───────────────────────────────────────────────────────────
  const renderMotoSection = () => (
    <section
      id="moto"
      className="travel-moto-banner"
      aria-label="Motorcycling adventures"
    >
      <div className="travel-section-inner travel-moto-inner">
        <Fade left duration={800}>
          <div>
            <span className="moto-eyebrow">On Two Wheels</span>
            <h2 className="moto-title">Nepal Mountain Roads</h2>
            <p className="moto-desc">
              Himalayan foothills and high-altitude passes — raw, remote, and
              unforgettable. Series in progress.
            </p>
            <span className="coming-soon-badge moto-badge">Coming Soon</span>
          </div>
        </Fade>
        <Fade right duration={800} delay={100}>
          <div className="moto-icon-wrap" aria-hidden="true">
            🏍️
          </div>
        </Fade>
      </div>
    </section>
  );

  // ── Subscribe CTA ─────────────────────────────────────────────────────────
  const renderSubscribeCta = () => (
    <section
      className="travel-subscribe-cta"
      style={{ backgroundColor: theme.body }}
    >
      <div className="travel-section-inner" style={{ textAlign: "center" }}>
        <Fade bottom duration={800}>
          <p
            className="travel-cta-text"
            style={{ color: theme.secondaryText }}
          >
            More destinations incoming. Don&apos;t miss a story.{" "}
            <a
              href="#footer-newsletter"
              className="travel-cta-link"
              style={{ color: theme.jacketColor }}
            >
              Subscribe below
            </a>
          </p>
        </Fade>
      </div>
    </section>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="travel-page" style={{ backgroundColor: theme.body }}>
      <Header theme={theme} themeMode={themeMode} onThemeChange={onThemeChange} />
      {renderHero()}
      {renderStorySection()}
      <TravelMap 
        countries={travelData.countries} 
        theme={theme} 
        onPinClick={(destId) => {
          document.getElementById(`dest-${destId}`)?.scrollIntoView({
            behavior: "smooth", block: "center"
          });
        }} 
      />
      {renderCountryTabs()}
      {renderTypeFilterChips(activeCountry)}
      {renderDestinationGrid(activeCountry, activeTypeFilter)}
      {renderMissionStatement()}
      {renderMotoSection()}
      {renderSubscribeCta()}
      <Footer theme={theme} />
    </div>
  );
};

export default TravelPage;
