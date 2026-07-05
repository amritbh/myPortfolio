import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { BrowserRouter } from "react-router-dom";
import * as apiClient from "../../utils/apiClient";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageDark: "#f5f5f5",
  highlight: "#f0f0f0",
  imageHighlight: "#a066fb",
};

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it("renders sign in form initially", () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);
    expect(screen.getByText(/Admin Access/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Admin Password/i)).toBeInTheDocument();
  });

  it("switches to sign up form when Sign Up tab is clicked", () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);
    const signUpTab = screen.getByRole("button", { name: /^Sign Up$/i });
    fireEvent.click(signUpTab);

    expect(screen.getByText(/Create Admin Account/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/name@example.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Re-enter Password/i)
    ).toBeInTheDocument();
  });

  it("shows error if passwords do not match during sign up", async () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign Up$/i }));

    const inputs = screen.getAllByPlaceholderText(/Password/i);
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
    const submitBtn = screen.getByRole("button", { name: /Create Account/i });

    fireEvent.change(usernameInput, { target: { value: "newadmin" } });
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(inputs[0], { target: { value: "Password123" } });
    fireEvent.change(inputs[1], { target: { value: "DifferentPass" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Passwords do not match/i)
    ).toBeInTheDocument();
  });

  it("signs up user successfully when form is valid", async () => {
    jest.spyOn(apiClient, "signupAdmin").mockResolvedValueOnce({
      success: true,
      token: "signup-jwt-token",
      user: { username: "newadmin", email: "admin@example.com", role: "admin" },
    });

    renderWithRouter(<AdminDashboard theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign Up$/i }));

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
    const passInput = screen.getByPlaceholderText(/^Admin Password$/i);
    const confirmInput = screen.getByPlaceholderText(/Re-enter Password/i);
    const submitBtn = screen.getByRole("button", { name: /Create Account/i });

    fireEvent.change(usernameInput, { target: { value: "newadmin" } });
    fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
    fireEvent.change(passInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(
        /Account created! Please check your email to verify./i
      )
    ).toBeInTheDocument();
  });

  it("authenticates and shows dashboard on valid sign in", async () => {
    jest.spyOn(apiClient, "loginAdmin").mockResolvedValueOnce({
      success: true,
      token: "valid-jwt-token",
      user: { username: "admin", role: "admin" },
    });

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Admin Password/i);
    const loginBtn = screen.getByRole("button", { name: /Sign In to CMS/i });

    fireEvent.change(usernameInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "amrit123" } });
    fireEvent.click(loginBtn);

    expect(await screen.findByText(/Write a New Post/i)).toBeInTheDocument();
  });

  it("logs out user when Logout button is clicked", async () => {
    jest.spyOn(apiClient, "getStoredToken").mockReturnValue("valid-token");

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    const logoutBtn = screen.getByRole("button", { name: /Logout/i });
    fireEvent.click(logoutBtn);

    expect(screen.getByText(/Admin Access/i)).toBeInTheDocument();
  });

  it("handles verifyToken from URL", async () => {
    jest.spyOn(apiClient, "verifyEmail").mockResolvedValueOnce({
      success: true,
      message: "Email verified successfully!",
    });
    window.history.pushState({}, "Verify", "/admin?verifyToken=test-token");
    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    expect(
      await screen.findByText(/Email verified successfully!/i)
    ).toBeInTheDocument();
  });

  it("handles forgot password flow", async () => {
    jest
      .spyOn(apiClient, "requestPasswordReset")
      .mockResolvedValueOnce({ success: true, message: "Reset link sent" });

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    // Click Forgot Password
    fireEvent.click(screen.getByText("Forgot Password?"));

    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /Send Reset Link/i }));

    expect(await screen.findByText(/Reset link sent/i)).toBeInTheDocument();
  });

  it("handles invalid credentials login flow", async () => {
    jest
      .spyOn(apiClient, "loginAdmin")
      .mockResolvedValueOnce({ error: "Invalid credentials" });

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Admin Password/i);
    fireEvent.change(usernameInput, { target: { value: "wrong" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });

    fireEvent.click(screen.getByRole("button", { name: /Sign In to CMS/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("triggers Google login redirect when Continue with Google is clicked", () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      href: "",
      origin: "http://localhost:3000",
    };

    process.env.REACT_APP_COGNITO_CLIENT_ID = "test-client-id";

    renderWithRouter(<AdminDashboard theme={mockTheme} />);
    const googleBtn = screen.getByRole("button", {
      name: /Continue with Google/i,
    });
    fireEvent.click(googleBtn);

    expect(window.location.href).toContain("test-client-id");
    expect(window.location.href).toContain("response_type=token");

    window.location = originalLocation;
  });

  it("parses Cognito id_token from URL hash and logs in", async () => {
    const originalLocation = window.location;
    delete window.location;

    // Create a fake id_token with base64 payload
    const fakePayload = { email: "admin@example.com" };
    const fakeToken = "header." + btoa(JSON.stringify(fakePayload)) + ".sig";

    window.location = {
      ...originalLocation,
      hash: `#id_token=${fakeToken}`,
      pathname: "/admin",
    };

    // Mock history.replaceState so it doesn't throw
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = jest.fn();

    const setSessionSpy = jest
      .spyOn(apiClient, "setSession")
      .mockImplementation(() => {});

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
    });

    expect(setSessionSpy).toHaveBeenCalledWith(
      fakeToken,
      expect.objectContaining({ username: "admin@example.com" })
    );

    window.location = originalLocation;
    window.history.replaceState = originalReplaceState;
  });

  it("shows error if Cognito id_token is invalid", async () => {
    const originalLocation = window.location;
    delete window.location;

    // Invalid base64 payload
    const fakeToken = "header.invalidBase64!!!.sig";

    window.location = {
      ...originalLocation,
      hash: `#id_token=${fakeToken}`,
      pathname: "/admin",
    };

    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText(/Social login failed/i)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
    window.location = originalLocation;
    window.history.replaceState = originalReplaceState;
  });

  it("shows error if username is less than 3 characters", async () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Admin Password/i);
    fireEvent.change(usernameInput, { target: { value: "ab" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /Sign In to CMS/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Username must be at least 3 characters long/i)
      ).toBeInTheDocument();
    });
  });

  it("shows error if password is less than 6 characters", async () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Admin Password/i);
    fireEvent.change(usernameInput, { target: { value: "admin" } });
    fireEvent.change(passwordInput, { target: { value: "12345" } });

    fireEvent.click(screen.getByRole("button", { name: /Sign In to CMS/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters long/i)
      ).toBeInTheDocument();
    });
  });

  it("handles resetToken from URL and submits new password", async () => {
    jest.spyOn(apiClient, "resetPassword").mockResolvedValueOnce({
      success: true,
      message: "Password reset successfully!",
    });
    window.history.pushState({}, "Reset", "/admin?resetToken=reset-token");

    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    expect(screen.getByText(/Set New Password/i)).toBeInTheDocument();

    const passInput = screen.getByPlaceholderText(/^New Password$/i);
    const confirmInput = screen.getByPlaceholderText(/Re-enter Password/i);

    fireEvent.change(passInput, { target: { value: "NewPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "NewPass123!" } });

    fireEvent.click(screen.getByRole("button", { name: /Update Password/i }));

    expect(
      await screen.findByText(/Password reset successful! Please log in\./i)
    ).toBeInTheDocument();
  });
});
