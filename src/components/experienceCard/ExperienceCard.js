import React, { Component } from "react";
import "./ExperienceCard.css";
import { Fade } from "react-reveal";

class ExperienceCard extends Component {
  render() {
    const experience = this.props.experience;
    const index = this.props.index;
    const totalCards = this.props.totalCards;
    const theme = this.props.theme;
    return (
      <div
        className="experience-list-item"
        style={{ marginTop: index === 0 ? 30 : 50 }}
      >
        <Fade left duration={2000} distance="40px">
          <div className="experience-card-logo-div">
            {(() => {
              // safe require with fallback to avoid runtime crash when image is missing
              try {
                const img = require(`../../assests/images/${experience["logo_path"]}`);
                return (
                  <img
                    className="experience-card-logo"
                    src={img}
                    alt={experience["company"]}
                  />
                );
              } catch (err) {
                // fallback image bundled in the repo
                try {
                  const fallback = require(`../../assests/images/projects_image.svg`);
                  return (
                    <img
                      className="experience-card-logo"
                      src={fallback}
                      alt={experience["company"]}
                    />
                  );
                } catch (err2) {
                  return null;
                }
              }
            })()}
          </div>
        </Fade>
        <div className="experience-card-stepper">
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: `${theme.headerColor}`,
              borderRadius: 50,
              zIndex: 100,
            }}
          />
          {index !== totalCards - 1 && (
            <div
              style={{
                height: 190,
                width: 2,
                backgroundColor: `${theme.headerColor}`,
                position: "absolute",
                marginTop: 20,
              }}
            />
          )}
        </div>
        <Fade right duration={2000} distance="40px">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div
              className="arrow-left"
              style={{ borderRight: `10px solid ${theme.body}` }}
            ></div>
            <div
              className="experience-card"
              style={{ background: `${theme.body}` }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3
                    className="experience-card-title"
                    style={{ color: theme.text }}
                  >
                    {experience["title"]}
                  </h3>
                  <p
                    className="experience-card-company"
                    style={{ color: theme.text }}
                  >
                    <a
                      href={experience["company_url"]}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {experience["company"]}
                    </a>
                  </p>
                </div>
                <div>
                  <div className="experience-card-heading-right">
                    <p
                      className="experience-card-duration"
                      style={{ color: theme.secondaryText }}
                    >
                      {experience["duration"]}
                    </p>
                    <p
                      className="experience-card-location"
                      style={{ color: theme.secondaryText }}
                    >
                      {experience["location"]}
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginTop: 20,
                }}
              >
                <div className="repo-description" />
                <div style={{ color: theme.secondaryText }}>
                  {
                    // Description can be either an array of strings or a long string
                    Array.isArray(experience["description"]) ? (
                      <ul style={{ marginTop: 0 }}>
                        {experience["description"].map((item, idx) => (
                          <li key={idx} style={{ marginBottom: 6 }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      // parse string: split into paragraphs or bullet lists
                      (() => {
                        const text = experience["description"] || "";
                        const sections = text.split(/\n\n+/).filter(Boolean);
                        return (
                          <div>
                            {sections.map((sec, sidx) => {
                              const lines = sec.split(/\n+/).filter(Boolean);
                              const isBullet = lines.every((l) =>
                                l.trim().startsWith("•")
                              );
                              if (isBullet) {
                                return (
                                  <ul key={sidx} style={{ marginTop: 0 }}>
                                    {lines.map((l, lidx) => (
                                      <li
                                        key={lidx}
                                        style={{ marginBottom: 6 }}
                                      >
                                        {l.replace(/^•\s*/, "")}
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                              return (
                                <p key={sidx} style={{ marginBottom: 8 }}>
                                  {lines.join(" ")}
                                </p>
                              );
                            })}
                          </div>
                        );
                      })()
                    )
                  }
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </div>
    );
  }
}

export default ExperienceCard;
