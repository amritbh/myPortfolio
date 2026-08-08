// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Projects from "./Projects";

vi.mock("../../components/githubRepoCard/GithubRepoCard", () => ({
  default: () => <div data-testid="github-repo-card">GithubRepoCard</div>,
}));
vi.mock("../../components/aiOpenSource/AiOpenSourceSection", () => ({
  default: () => <div data-testid="ai-section">AiOpenSourceSection</div>,
}));
vi.mock("../../components/upcomingProjects/UpcomingProjectsSection", () => ({
  default: () => <div data-testid="upcoming-section">UpcomingProjectsSection</div>,
}));
vi.mock("./ProjectsImg", () => ({
  default: () => <div data-testid="projects-img">ProjectsImg</div>,
}));
vi.mock("../../components/header/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));
vi.mock("../../components/footer/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

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
