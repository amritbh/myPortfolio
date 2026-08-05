import React, { Component } from "react";
import "./TravelTeaser.css";
import { travelData } from "../../portfolio";
import { Link } from "react-router-dom";

/* Inline mountain silhouette SVG — no external file needed */
const MountainSvg = ({ opacity }) => (
  <svg
    className="mountain-bg"
    style={{ opacity }}
    viewBox="0 0 1440 320"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d="M0,320L120,288L240,256L360,224L480,192L540,160L600,128L660,96L720,64L780,96L840,128L900,160L960,192L1080,256L1200,288L1320,272L1440,256L1440,320L0,320Z" />
    <path d="M0,320L80,304L160,288L240,304L360,272L480,240L600,208L720,176L800,160L880,176L960,208L1080,240L1200,272L1320,288L1440,272L1440,320L0,320Z" />
  </svg>
);

class TravelTeaser extends Component {
  render() {
    const theme = this.props.theme;
    const allDestinations = [
      ...travelData.destinations.nepal,
      ...travelData.destinations.usa,
      ...travelData.destinations.moto,
    ];
    const svgOpacity = theme && theme.body === "#0D1117" ? 0.04 : 0.035;

    return (
      <section className="travel-teaser-section" id="travel-teaser">
        <MountainSvg opacity={svgOpacity} />

        <div className="travel-teaser-inner">
          <div className="travel-header">
            <h2
              className="section-title"
              style={{ color: theme ? theme.text : undefined }}
            >
              Beyond the Code
            </h2>
            <p
              className="section-subtitle"
              style={{ color: theme ? theme.secondaryText : undefined }}
            >
              {travelData.tagline}
            </p>
          </div>

          <div className="destination-chips-row">
            {allDestinations.map((dest) => (
              <span
                key={dest}
                className="destination-chip"
                style={{
                  color: theme ? theme.text : undefined,
                  borderColor: theme ? theme.highlight : undefined,
                  backgroundColor: theme ? theme.headerColor : undefined,
                }}
              >
                {dest}
              </span>
            ))}
          </div>

          <div className="travel-cards-row">
            <Link
              to={travelData.nepalCard.link}
              className="travel-card nepal-card"
              style={{
                backgroundColor: theme ? theme.headerColor : undefined,
                color: theme ? theme.text : undefined,
              }}
            >
              <span className="travel-card-icon">
                {travelData.nepalCard.icon}
              </span>
              <div className="travel-card-text">
                <strong style={{ color: theme ? theme.text : undefined }}>
                  {travelData.nepalCard.title}
                </strong>
                <span style={{ color: theme ? theme.text : undefined }}>
                  {travelData.nepalCard.subtitle}
                </span>
              </div>
              <span className="travel-card-arrow" style={{ color: "#DC143C" }}>
                →
              </span>
            </Link>

            <Link
              to={travelData.usaCard.link}
              className="travel-card usa-card"
              style={{
                backgroundColor: theme ? theme.headerColor : undefined,
                color: theme ? theme.text : undefined,
              }}
            >
              <span className="travel-card-icon">
                {travelData.usaCard.icon}
              </span>
              <div className="travel-card-text">
                <strong style={{ color: theme ? theme.text : undefined }}>
                  {travelData.usaCard.title}
                </strong>
                <span style={{ color: theme ? theme.text : undefined }}>
                  {travelData.usaCard.subtitle}
                </span>
              </div>
              <span className="travel-card-arrow" style={{ color: "#003893" }}>
                →
              </span>
            </Link>
          </div>

          <div
            className="moto-strip"
            style={{
              backgroundColor: theme ? theme.headerColor : undefined,
              borderColor: theme ? theme.highlight : undefined,
            }}
          >
            <span className="moto-icon" role="img" aria-label="motorcycle">
              🏍️
            </span>
            <span
              className="moto-label"
              style={{ color: theme ? theme.text : undefined }}
            >
              {travelData.motoStrip.label}
            </span>
            <span
              className="coming-soon-badge"
              style={{
                backgroundColor: theme ? theme.highlight : undefined,
                color: theme ? theme.text : undefined,
              }}
            >
              Coming Soon
            </span>
          </div>
        </div>
      </section>
    );
  }
}

export default TravelTeaser;
