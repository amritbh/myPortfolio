import React from "react";
import { upcomingProjectsData } from "../../portfolio";
import { Fade } from "react-reveal";
import "./UpcomingProjectsSection.css";

export default function UpcomingProjectsSection(props) {
  const theme = props.theme;
  return (
    <div className="upcoming-main">
      <div className="upcoming-header-div">
        <Fade bottom duration={2000} distance="20px">
          <h1 className="upcoming-header" style={{ color: theme.text }}>
            {upcomingProjectsData.title}
          </h1>
        </Fade>
      </div>
      <div className="upcoming-body-div">
        {upcomingProjectsData.data.map((project) => {
          return (
            <Fade bottom duration={2000} distance="40px" key={project.id}>
              <div
                className="upcoming-card"
                style={{
                  backgroundColor: theme.imageDark,
                  border: `1px solid ${theme.imageHighlight}`,
                }}
              >
                <div className="upcoming-name-div">
                  <p className="upcoming-name" style={{ color: theme.text }}>
                    {project.name}
                  </p>
                  <span
                    className="upcoming-status"
                    style={{
                      backgroundColor: theme.imageHighlight,
                      color: theme.text,
                    }}
                  >
                    {project.status}
                  </span>
                </div>
                <p
                  className="upcoming-description"
                  style={{ color: theme.secondaryText }}
                >
                  {project.description}
                </p>
              </div>
            </Fade>
          );
        })}
      </div>
    </div>
  );
}
