import React from "react";
import "./Greeting.css";
import SocialMedia from "../../components/socialMedia/SocialMedia";
import { greeting } from "../../portfolio";
import { Fade } from "react-reveal";
import { Link } from "react-router-dom";
import heroImage from "../../assests/images/amrit_pic.jpeg";
import type { Theme } from "../../types";

interface GreetingProps {
  theme: Theme;
}

const Greeting: React.FC<GreetingProps> = ({ theme }) => {
  return (
    <Fade bottom duration={2000} distance="40px">
      <section className="hero-section" id="greeting">
        <div className="hero-text-col">
          <p
            className="hero-greeting-label"
            style={{ color: theme.secondaryText }}
          >
            Hi, I'm
          </p>
          <h1 className="hero-name gradient-text">{greeting.title}</h1>

          <div className="hero-chips">
            {greeting.heroChips.map((chip) => {
              const isExternal = chip.link.startsWith("http");
              const ChipContent = (
                <span
                  className="chip"
                  style={{
                    borderColor: theme.secondaryText,
                    color: theme.text,
                    backgroundColor: theme.headerColor,
                  }}
                >
                  <span className="chip-icon">{chip.icon}</span>
                  <span className="chip-label">{chip.label}</span>
                </span>
              );

              return (
                <React.Fragment key={chip.label}>
                  {isExternal ? (
                    <a
                      href={chip.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chip-link"
                    >
                      {ChipContent}
                    </a>
                  ) : (
                    <Link to={chip.link} className="chip-link">
                      {ChipContent}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <p className="hero-subtitle" style={{ color: theme.secondaryText }}>
            {greeting.subTitle}
          </p>

          <div className="hero-cta-row">
            <Link
              to="/blogs"
              className="btn-primary"
              style={{ backgroundColor: theme.jacketColor, color: "#fff" }}
            >
              Read My Blog
            </Link>

            <a
              href={greeting.portfolio_repository}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ color: theme.text, backgroundColor: theme.headerColor, borderColor: theme.secondaryText }}
            >
              <span role="img" aria-label="star">
                ⭐
              </span>{" "}
              Star on GitHub
            </a>

            <Link
              to="/travel"
              className="btn-secondary"
              style={{ color: theme.text, backgroundColor: theme.headerColor, borderColor: theme.secondaryText }}
            >
              <span role="img" aria-label="airplane">
                ✈️
              </span>{" "}
              Travel Blog
            </Link>
          </div>

          <SocialMedia theme={theme} />
        </div>

        <div className="hero-photo-col">
          <div className="hero-photo-ring">
            <img
              src={heroImage}
              alt="Amrit Bhattarai"
              className="hero-photo"
            />
          </div>
          <div
            className="hero-stats-bar"
            style={{ backgroundColor: theme.headerColor }}
          >
            {greeting.heroStats.map((stat) => (
              <div key={stat.label} className="stat">
                <span className="stat-val" style={{ color: theme.text }}>
                  {stat.value}
                </span>
                <span
                  className="stat-label"
                  style={{ color: theme.secondaryText }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Fade>
  );
};

export default Greeting;
