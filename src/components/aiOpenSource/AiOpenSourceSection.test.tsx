// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import AiOpenSourceSection from "./AiOpenSourceSection";

describe("AiOpenSourceSection Component", () => {
  const theme = {
    text: "#000000",
    secondaryText: "#555555",
    imageHighlight: "#f5f5f5",
    imageDark: "#eeeeee",
  };

  it("renders correctly", () => {
    render(<AiOpenSourceSection theme={theme} />);

    // Check header
    expect(screen.getByText("AI & Agentic AI Ecosystem")).toBeInTheDocument();

    // Check some AI trends items
    expect(screen.getByText("Meta Llama 3")).toBeInTheDocument();
    expect(screen.getByText("LangChain")).toBeInTheDocument();
  });
});
