// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import UpcomingProjectsSection from "./UpcomingProjectsSection";

describe("UpcomingProjectsSection Component", () => {
  const theme = {
    text: "#000000",
    secondaryText: "#555555",
    imageHighlight: "#f5f5f5",
    imageDark: "#eeeeee",
  };

  it("renders correctly", () => {
    render(<UpcomingProjectsSection theme={theme} />);

    // Check header
    expect(
      screen.getByText("Upcoming & Relevant Projects")
    ).toBeInTheDocument();

    // Check some specific projects
    expect(screen.getByText("Agentic Developer CLI")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });
});
