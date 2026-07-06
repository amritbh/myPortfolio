import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";
import { BrowserRouter } from "react-router-dom";
import * as apiClient from "../../utils/apiClient";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  highlight: "#a066fb",
};

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Header Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Login link when no user is logged in", () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(<Header theme={mockTheme} />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("renders Logout button when user is logged in", () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });
    renderWithRouter(<Header theme={mockTheme} />);
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  it("handles logout click", () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });
    jest.spyOn(apiClient, "clearSession").mockImplementation(() => {});

    // Mock window.location.href
    delete window.location;
    window.location = { href: "" };

    renderWithRouter(<Header theme={mockTheme} />);
    const logoutBtn = screen.getByText("Logout");

    // Test hover states
    fireEvent.mouseEnter(logoutBtn);
    fireEvent.mouseOut(logoutBtn);
    fireEvent.blur(logoutBtn);

    // Test click
    fireEvent.click(logoutBtn);
    expect(apiClient.clearSession).toHaveBeenCalled();
    expect(window.location.href).toBe("/home");
  });

  it("handles mouse hover and out on all nav links", () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(<Header theme={mockTheme} />);

    const navTexts = [
      "Home",
      "Education",
      "Experience",
      "Projects",
      "Open Source",
      "Blog",
      "Contact Me",
      "Login",
    ];

    navTexts.forEach((text) => {
      const link = screen.getByText(text);
      fireEvent.mouseEnter(link);
      expect(link.style.backgroundColor).toBe("rgb(160, 102, 251)"); // theme.highlight
      fireEvent.mouseOut(link);
      expect(link.style.backgroundColor).toBe("transparent");
    });
  });
});
