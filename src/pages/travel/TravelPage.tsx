import React from "react";
import "./Travel.css";
import { travelData } from "../../portfolio";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { Fade } from "react-reveal";
import type { Theme, ThemeMode } from "../../types";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#2ea043",
  Moderate: "#d29922",
  Strenuous: "#da3633",
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
  const renderHero = () => (
    <section className="travel-hero" aria-label="Travel hero">
      <div className="travel-hero-content">
        <Fade bottom duration={800}>
          <h1 className="travel-hero-title" style={{ color: theme.text }}>
            Adventures and Journeys
          </h1>
        </Fade>
        <Fade bottom duration={1000} delay={100}>
          <p
            className="travel-hero-subtitle"
            style={{ color: theme.secondaryText }}
          >
            Nepal born. Mountain shaped. Documenting every trail, road, and
            horizon.
          </p>
        </Fade>
        <Fade bottom duration={1000} delay={200}>
          <div className="travel-hero-chips">
            <span
              className="travel-chip"
              style={{
                backgroundColor: theme.compImgHighlight,
                color: theme.text,
              }}
            >
              <span role="img" aria-label="mountain">
                🏔️
              </span>{" "}
              7+ Himalayan Treks
            </span>
            <span
              className="travel-chip"
              style={{
                backgroundColor: theme.compImgHighlight,
                color: theme.text,
              }}
            >
              <span role="img" aria-label="usa flag">
                🇺🇸
              </span>{" "}
              Exploring America
            </span>
            <span
              className="travel-chip"
              style={{
                backgroundColor: theme.compImgHighlight,
                color: theme.text,
              }}
            >
              <span role="img" aria-label="motorcycle">
                🏍️
              </span>{" "}
              Motorcycling
            </span>
          </div>
        </Fade>
        <a
          href="#nepal"
          className="travel-scroll-arrow"
          aria-label="Scroll to Nepal treks"
        >
          ↓
        </a>
      </div>
    </section>
  );

  const renderNepalTreks = () => (
    <section
      id="nepal"
      className="travel-section"
      aria-label="Himalayan treks"
      style={{ backgroundColor: theme.body }}
    >
      <div className="travel-section-inner">
        <Fade bottom duration={800}>
          <h2 className="travel-section-title" style={{ color: theme.text }}>
            <span role="img" aria-label="mountain">
              ⛰️
            </span>{" "}
            Himalayan Treks
          </h2>
          <p
            className="travel-section-subtitle"
            style={{ color: theme.secondaryText }}
          >
            From the iconic Annapurna Base Camp to the remote trails of
            Mustang, these are the routes that shaped me.
          </p>
        </Fade>

        <div className="trek-grid">
          {travelData.nepalTreks.map((trek, i) => (
            <Fade bottom duration={600} delay={i * 80} key={trek.name}>
              <div
                className="trek-card"
                style={{
                  backgroundColor: theme.headerColor,
                  borderColor: theme.highlight,
                }}
              >
                <div className="trek-card-header">
                  <span
                    className="trek-emoji"
                    role="img"
                    aria-label={trek.name}
                  >
                    {trek.emoji}
                  </span>
                  <span
                    className="trek-difficulty-badge"
                    style={{
                      backgroundColor:
                        DIFFICULTY_COLOR[trek.difficulty] + "22",
                      color: DIFFICULTY_COLOR[trek.difficulty],
                      border: `1px solid ${
                        DIFFICULTY_COLOR[trek.difficulty]
                      }55`,
                    }}
                  >
                    {trek.difficulty}
                  </span>
                </div>
                <h3 className="trek-name" style={{ color: theme.text }}>
                  {trek.name}
                </h3>
                <p
                  className="trek-description"
                  style={{ color: theme.secondaryText }}
                >
                  {trek.description}
                </p>
                <div className="trek-meta">
                  <span
                    className="trek-meta-item"
                    style={{
                      color: theme.secondaryText,
                    }}
                  >
                    <span role="img" aria-label="elevation">
                      📍
                    </span>{" "}
                    {trek.elevation}
                  </span>
                  <span
                    className="trek-meta-item"
                    style={{
                      color: theme.secondaryText,
                    }}
                  >
                    <span role="img" aria-label="duration">
                      🗓️
                    </span>{" "}
                    {trek.duration}
                  </span>
                </div>
                <span className="trek-coming-soon-badge">Coming Soon</span>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );

  const renderCallout = () => (
    <section
      className="nepal-callout-section"
      style={{ backgroundColor: theme.body }}
    >
      <div className="travel-section-inner">
        <Fade bottom duration={800}>
          <div
            className="nepal-callout"
            style={{
              backgroundColor: theme.compImgHighlight,
              borderColor: "#DC143C",
            }}
          >
            <span
              className="nepal-callout-icon"
              role="img"
              aria-label="Nepal flag"
            >
              🇳🇵
            </span>
            <div>
              <p className="nepal-callout-text" style={{ color: theme.text }}>
                I aim to share these trails to inspire and support Nepal
                tourism. If you love the Himalayas, share these posts when
                they go live.
              </p>
            </div>
          </div>
        </Fade>
      </div>
    </section>
  );

  const renderMotoSection = () => (
    <section
      id="moto"
      className="travel-section moto-section"
      aria-label="Motorcycling"
      style={{
        backgroundColor: theme.body,
        borderTop: `1px solid ${theme.highlight}`,
      }}
    >
      <div className="travel-section-inner">
        <Fade bottom duration={800}>
          <h2 className="travel-section-title" style={{ color: theme.text }}>
            <span role="img" aria-label="motorcycle">
              🏍️
            </span>{" "}
            On Two Wheels
          </h2>
          <p
            className="travel-section-subtitle"
            style={{ color: theme.secondaryText }}
          >
            Nepal's mountain roads on a motorcycle. Raw, remote, and
            unforgettable.
          </p>
        </Fade>
        <Fade bottom duration={800} delay={100}>
          <div
            className="moto-featured-card"
            style={{
              backgroundColor: theme.compImgHighlight,
              borderColor: theme.highlight,
            }}
          >
            <span
              className="moto-featured-icon"
              role="img"
              aria-label="motorcycle"
            >
              🏍️
            </span>
            <div>
              <h3
                className="moto-featured-title"
                style={{ color: theme.text }}
              >
                Nepal Mountain Roads
              </h3>
              <p
                className="moto-featured-desc"
                style={{ color: theme.secondaryText }}
              >
                Documenting the raw beauty of riding through the Himalayan
                foothills and high-altitude passes.
              </p>
            </div>
            <span className="trek-coming-soon-badge">Coming Soon</span>
          </div>
        </Fade>
      </div>
    </section>
  );

  const renderUsaTravel = () => (
    <section
      id="usa"
      className="travel-section"
      aria-label="USA travel"
      style={{ backgroundColor: theme.body }}
    >
      <div className="travel-section-inner">
        <Fade bottom duration={800}>
          <h2 className="travel-section-title" style={{ color: theme.text }}>
            <span role="img" aria-label="usa flag">
              🇺🇸
            </span>{" "}
            Exploring America
          </h2>
          <p
            className="travel-section-subtitle"
            style={{ color: theme.secondaryText }}
          >
            Moved to Oregon in 2023. Discovering the Pacific Northwest and
            beyond.
          </p>
        </Fade>
        <div className="usa-grid">
          {travelData.usaDestinations.map((dest, i) => (
            <Fade bottom duration={600} delay={i * 80} key={dest.name}>
              <div
                className="usa-card"
                style={{
                  backgroundColor: theme.headerColor,
                  borderColor: theme.highlight,
                }}
              >
                <span
                  className="usa-card-emoji"
                  role="img"
                  aria-label={dest.name}
                >
                  {dest.emoji}
                </span>
                <h3 className="usa-card-name" style={{ color: theme.text }}>
                  {dest.name}
                </h3>
                <p
                  className="usa-card-desc"
                  style={{ color: theme.secondaryText }}
                >
                  {dest.description}
                </p>
                <span className="trek-coming-soon-badge">Coming Soon</span>
              </div>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );

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
            Get notified when new travel posts go live.{" "}
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

  return (
    <div className="travel-page" style={{ backgroundColor: theme.body }}>
      <Header
        theme={theme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
      />
      {renderHero()}
      {renderNepalTreks()}
      {renderCallout()}
      {renderMotoSection()}
      {renderUsaTravel()}
      {renderSubscribeCta()}
      <Footer theme={theme} />
    </div>
  );
};

export default TravelPage;
