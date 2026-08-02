import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Projects from "./Projects";

jest.mock("../../components/githubRepoCard/GithubRepoCard", () => () => (
  <div data-testid="github-repo-card">GithubRepoCard</div>
));
jest.mock("../../components/aiOpenSource/AiOpenSourceSection", () => () => (
  <div data-testid="ai-section">AiOpenSourceSection</div>
));
jest.mock(
  "../../components/upcomingProjects/UpcomingProjectsSection",
  () => () => <div data-testid="upcoming-section">UpcomingProjectsSection</div>
);
jest.mock("./ProjectsImg", () => () => (
  <div data-testid="projects-img">ProjectsImg</div>
));
jest.mock("../../components/header/Header", () => () => (
  <div data-testid="header">Header</div>
));
jest.mock("../../components/footer/Footer", () => () => (
  <div data-testid="footer">Footer</div>
));

describe("Projects Component", () => {
  const theme = {
    text: "#000000",
    secondaryText: "#555555",
    imageHighlight: "#f5f5f5",
  };

  it("renders the projects page correctly", () => {
    render(
      <BrowserRouter>
        <Projects theme={theme} />
      </BrowserRouter>
    );

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("projects-img")).toBeInTheDocument();
    expect(screen.getByText("Projects & AI Trends")).toBeInTheDocument();
    expect(screen.getByTestId("ai-section")).toBeInTheDocument();
    expect(screen.getByTestId("upcoming-section")).toBeInTheDocument();
    expect(screen.getAllByTestId("github-repo-card").length).toBeGreaterThan(0);
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
