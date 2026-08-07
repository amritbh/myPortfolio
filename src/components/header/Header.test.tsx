// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";
import { BrowserRouter } from "react-router-dom";
import * as apiClient from "../../utils/apiClient";

// matchMedia mock required by ThemeSwitcher
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  highlight: "#a066fb",
};

const mockOnThemeChange = vi.fn();

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Header Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the ThemeSwitcher with all 3 mode buttons", () => {
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(
      <Header
        theme={mockTheme}
        themeMode="system"
        onThemeChange={mockOnThemeChange}
      />
    );
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByLabelText("Light theme")).toBeInTheDocument();
    expect(screen.getByLabelText("System theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Dark theme")).toBeInTheDocument();
  });

  it("calls onThemeChange when a theme mode is selected via ThemeSwitcher", () => {
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(
      <Header
        theme={mockTheme}
        themeMode="system"
        onThemeChange={mockOnThemeChange}
      />
    );
    fireEvent.click(screen.getByLabelText("Dark theme"));
    expect(mockOnThemeChange).toHaveBeenCalledWith("dark");
  });

  it("renders Login link when no user is logged in", () => {
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
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
    vi.spyOn(apiClient, "clearSession").mockImplementation(() => {});

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
    vi.spyOn(apiClient, "clearSession").mockImplementation(() => {});

    // Mock window.location.href
    delete window.location;
    window.location = { href: "", origin: "http://localhost:3000" };
    import.meta.env.VITE_COGNITO_CLIENT_ID = "mock-client-id";

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

    vi.spyOn(apiClient, "requestPasswordReset").mockResolvedValue({
      success: true,
    });

    window.alert = vi.fn();

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

  it("renders the Travel nav link to /travel", () => {
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(
      <Header
        theme={mockTheme}
        themeMode="system"
        onThemeChange={mockOnThemeChange}
      />
    );
    const travelLink = screen.getByText("Travel");
    expect(travelLink).toBeInTheDocument();
    expect(travelLink.closest("a")).toHaveAttribute("href", "/travel");
  });

  it("handles mouse hover and out on all nav links", () => {
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue(null);
    renderWithRouter(<Header theme={mockTheme} />);

    const navTexts = [
      "Home",
      "Education",
      "Experience",
      "Projects",
      "Blog",
      "Travel",
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
    window.alert = vi.fn();

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
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue({ role: "admin" });
    window.alert = vi.fn();

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
