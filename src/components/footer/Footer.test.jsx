import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  highlight: "#a066fb",
  compImgHighlight: "#f5f5f5",
  jacketColor: "#388BFD",
};

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("Footer Component", () => {
  it("renders the newsletter heading", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    expect(screen.getByText(/Stay updated on new posts/i)).toBeInTheDocument();
  });

  it("renders the email input and Subscribe button", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Subscribe/i })
    ).toBeInTheDocument();
  });

  it("shows confirmation message after submitting with a valid email", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    const input = screen.getByLabelText("Email address");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));
    expect(screen.getByText(/Thanks! You'll be notified/i)).toBeInTheDocument();
  });

  it("does NOT show confirmation when submitting with an empty email", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));
    expect(
      screen.queryByText(/Thanks! You'll be notified/i)
    ).not.toBeInTheDocument();
  });

  it("renders all 4 quick links", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Travel" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders all 4 social icon links", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    expect(
      screen.getByRole("link", { name: "GitHub profile" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "LinkedIn profile" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "YouTube channel" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Send email" })
    ).toBeInTheDocument();
  });

  it("renders the copyright notice", () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("renders correctly without theme prop (fallback branches)", () => {
    renderWithRouter(<Footer />);
    expect(screen.getByText(/Stay updated on new posts/i)).toBeInTheDocument();
  });
});
