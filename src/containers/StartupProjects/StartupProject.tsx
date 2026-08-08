// @ts-nocheck
import React from "react";
import "./StartupProjects.css";
import { bigProjects } from "../../portfolio";

export default function StartupProject() {
  return (
    <div className="main" id="projects">
      <div>
        <h1 className="skills-heading">{bigProjects.title}</h1>
        <p className="subTitle project-subtitle">{bigProjects.subtitle}</p>
        <div className="startup-projects-main">
          <div className="startup-project-text">
            {bigProjects.projects.map((project) => {
              return (
                <a
                  key={project.link}
                  className="saaya-health-div"
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "block" }}
                >
                  <img alt="Saad Working" src={project.image}></img>
                </a>
              );
            })}
          </div>
          <div className="starup-project-image"></div>
        </div>
      </div>
    </div>
  );
}
