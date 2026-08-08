// @ts-nocheck
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import SkillImg from "./SkillImg";

describe("SkillImg Component", () => {
  it("renders with light mode blend when theme is light", () => {
    const mockTheme = { body: "#EDF9FE" };
    const { container } = render(
      <SkillImg src="test.png" alt="test" theme={mockTheme} />
    );
    const img = container.querySelector("img");
    expect(img).toHaveClass("skill-img");
    expect(img).toHaveClass("skill-img-light-blend");
  });

  it("renders without blend when theme is dark", () => {
    const mockTheme = { body: "#0D1117" };
    const { container } = render(
      <SkillImg src="test.png" alt="test" theme={mockTheme} />
    );
    const img = container.querySelector("img");
    expect(img).toHaveClass("skill-img");
    expect(img).not.toHaveClass("skill-img-light-blend");
  });

  it("renders correctly when theme is not provided (default fallback)", () => {
    const { container } = render(<SkillImg src="test.png" alt="test" />);
    const img = container.querySelector("img");
    expect(img).toHaveClass("skill-img");
  });

  it("hides the image on error", () => {
    const { container } = render(<SkillImg src="invalid.png" alt="test" />);
    const img = container.querySelector("img");
    fireEvent.error(img);
    expect(img.style.display).toBe("none");
  });
});
