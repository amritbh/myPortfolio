import React from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import GithubRepoCard from "../../components/githubRepoCard/GithubRepoCard";
import Button from "../../components/button/Button";
import TopButton from "../../components/topButton/TopButton";
import AiOpenSourceSection from "../../components/aiOpenSource/AiOpenSourceSection";
import UpcomingProjectsSection from "../../components/upcomingProjects/UpcomingProjectsSection";
import { Fade } from "react-reveal";
import { projectsHeader, greeting } from "../../portfolio";
import ProjectsData from "../../shared/opensource/projects.json";
import "./Projects.css";
import ProjectsImg from "./ProjectsImg";

const Projects = (props: any) => {
    const theme = props.theme;
    return (
      <div className="projects-main">
        <Header
          theme={theme}
          themeMode={props.themeMode}
          onThemeChange={props.onThemeChange}
        />
        <div className="basic-projects">
          <Fade bottom duration={2000} distance="40px">
            <div className="projects-heading-div">
              <div className="projects-heading-img-div">
                <ProjectsImg theme={theme} />
              </div>
              <div className="projects-heading-text-div">
                <h1
                  className="projects-heading-text"
                  style={{ color: theme.text }}
                >
                  {projectsHeader.title}
                </h1>
                <p
                  className="projects-header-detail-text subTitle"
                  style={{ color: theme.secondaryText }}
                >
                  {projectsHeader["description"]}
                </p>
              </div>
            </div>
          </Fade>
        </div>

        <div className="repo-cards-div-main">
          {ProjectsData.data.map((repo) => {
            return <GithubRepoCard repo={repo} theme={theme} key={repo.id} />;
          })}
        </div>

        <Button
          text={"More Projects"}
          className="project-button"
          href={greeting.githubProfile}
          newTab={true}
          theme={theme}
        />

        <UpcomingProjectsSection theme={theme} />
        <AiOpenSourceSection theme={theme} />

        <Footer theme={props.theme} onToggle={props.onToggle} />
        <TopButton theme={props.theme} />
      </div>
    );
  }
export default Projects;
