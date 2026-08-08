// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import ProjectsImg from "./ProjectsImg";

describe("ProjectsImg Component", () => {
  const theme = {
    text: "#000000",
  };

  it("renders correctly", () => {
    render(<ProjectsImg theme={theme} />);
    const img = screen.getByAltText("Projects Header");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/src/assests/images/projects_header.png");
  });
});
