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

  it("renders Logout button when user is logged in and dropdown opened", () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });
    renderWithRouter(<Header theme={mockTheme} />);
    expect(screen.getByText(/Account/i)).toBeInTheDocument();

    // Open dropdown
    fireEvent.mouseEnter(screen.getByText(/Account/i));
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
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

    // Open dropdown
    fireEvent.mouseEnter(screen.getByText(/Account/i));

    const logoutBtn = screen.getByText(/Logout/i);

    // Test click
    fireEvent.click(logoutBtn);
    expect(apiClient.clearSession).toHaveBeenCalled();
    expect(window.location.href).toBe("/home");
  });

  it("handles cognito logout click", () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test", type: "cognito" });
    jest.spyOn(apiClient, "clearSession").mockImplementation(() => {});

    // Mock window.location.href
    delete window.location;
    window.location = { href: "", origin: "http://localhost:3000" };
    process.env.REACT_APP_COGNITO_CLIENT_ID = "mock-client-id";

    renderWithRouter(<Header theme={mockTheme} />);

    // Open dropdown
    fireEvent.mouseEnter(screen.getByText(/Account/i));

    const logoutBtn = screen.getByText(/Logout/i);

    fireEvent.click(logoutBtn);
    expect(apiClient.clearSession).toHaveBeenCalled();
    expect(window.location.href).toContain("mock-client-id");
    expect(window.location.href).toContain("logout_uri=");
  });

  it("handles Manage Account click", () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });
    renderWithRouter(<Header theme={mockTheme} />);

    fireEvent.mouseEnter(screen.getByText(/Account/i));

    const manageAccountBtn = screen.getByText(/Manage Account/i);
    expect(manageAccountBtn.getAttribute("href")).toBe("/account");
  });

  it("handles Change Password click", async () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });

    jest.spyOn(apiClient, "requestPasswordReset").mockResolvedValue({
      success: true,
    });

    window.alert = jest.fn();

    renderWithRouter(<Header theme={mockTheme} />);

    fireEvent.mouseEnter(screen.getByText(/Account/i));

    const changePasswordBtn = screen.getByText(/Change Password/i);
    fireEvent.click(changePasswordBtn);

    await screen.findByText(/Change Password/i); // wait for event tick

    expect(apiClient.requestPasswordReset).toHaveBeenCalledWith("test");
    expect(window.alert).toHaveBeenCalledWith(
      "A password reset link has been sent to your email. Please check your inbox."
    );
  });

  it("handles mouse hover and out on all nav links", () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(<Header theme={mockTheme} />);

    const navTexts = [
      "Home",
      "Education",
      "Experience",
      "Projects",
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

  it("handles Change Password click failure", async () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });
    jest
      .spyOn(apiClient, "requestPasswordReset")
      .mockResolvedValue({ success: false, error: "bad error" });
    window.alert = jest.fn();

    renderWithRouter(<Header theme={mockTheme} />);
    fireEvent.mouseEnter(screen.getByText(/Account/i));

    const changePasswordBtn = screen.getByText(/Change Password/i);
    fireEvent.click(changePasswordBtn);
    await screen.findByText(/Change Password/i); // wait for event tick

    expect(window.alert).toHaveBeenCalledWith(
      "Failed to send password reset link: bad error"
    );
  });

  it("handles Change Password missing email/username", async () => {
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue({ role: "admin" });
    window.alert = jest.fn();

    renderWithRouter(<Header theme={mockTheme} />);
    fireEvent.mouseEnter(screen.getByText(/Account/i));

    const changePasswordBtn = screen.getByText(/Change Password/i);
    fireEvent.click(changePasswordBtn);

    expect(window.alert).toHaveBeenCalledWith(
      "Unable to find your email address. Please log out and use the Forgot Password link."
    );
  });

  it("closes dropdown on mouse leave", () => {
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "test" });
    renderWithRouter(<Header theme={mockTheme} />);

    const accountToggle = screen.getByText(/Account/i);
    fireEvent.mouseEnter(accountToggle);
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    // The container has the onMouseLeave
    const container = accountToggle.closest(".account-dropdown-container");
    fireEvent.mouseLeave(container);

    expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
  });
});
