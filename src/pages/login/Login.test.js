import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter, Route } from "react-router-dom";
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
  return render(
    <BrowserRouter>
      <Route render={(props) => React.cloneElement(ui, { ...props })} />
    </BrowserRouter>
  );
};

describe("Login Component", () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it("renders sign in modal initially", () => {
    renderWithRouter(<Login theme={mockTheme} />);
    expect(screen.getByText(/Welcome back./i)).toBeInTheDocument();
  });

  it("signs up user successfully when form is valid", async () => {
    jest.spyOn(apiClient, "signupAdmin").mockResolvedValueOnce({
      success: true,
      token: "signup-jwt-token",
      user: { username: "newuser", email: "user@example.com", role: "user" },
    });

    renderWithRouter(<Login theme={mockTheme} />);

    // Switch to Create Account mode
    fireEvent.click(screen.getByText(/Create one/i));

    // Expand the email form
    fireEvent.click(screen.getByText(/Sign up with email/i));

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/Email address/i);
    const passInput = screen.getByPlaceholderText(/Password \(min 6 chars\)/i);
    const confirmInput = screen.getByPlaceholderText(/Confirm password/i);
    const submitBtn = document.getElementById("login-submit-btn");

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Account created! Check your email to verify./i)
    ).toBeInTheDocument();
  });

  it("authenticates and redirects on valid sign in", async () => {
    jest.spyOn(apiClient, "loginAdmin").mockResolvedValueOnce({
      success: true,
      token: "valid-jwt-token",
      user: { username: "admin", role: "admin" },
    });

    renderWithRouter(<Login theme={mockTheme} />);

    // Expand the email form
    fireEvent.click(screen.getByText(/Sign in with email/i));

    const emailInput = screen.getByPlaceholderText(/Email address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const loginBtn = document.getElementById("login-submit-btn");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "amrit123" } });
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(apiClient.loginAdmin).toHaveBeenCalled();
    });
  });

  it("calls verifyEmail when verifyToken and email are in query params", async () => {
    jest
      .spyOn(apiClient, "verifyEmail")
      .mockResolvedValueOnce({ success: true });
    window.history.pushState(
      {},
      "Test Title",
      "/login?verifyToken=123&email=test@test.com"
    );

    renderWithRouter(<Login theme={mockTheme} />);

    await waitFor(() => {
      expect(apiClient.verifyEmail).toHaveBeenCalledWith("123");
      expect(
        screen.getByText(/Email verified! You can now sign in./i)
      ).toBeInTheDocument();
    });
  });

  it("handles forgot password and reset flows", async () => {
    jest
      .spyOn(apiClient, "requestPasswordReset")
      .mockResolvedValueOnce({ success: true, message: "Reset link sent!" });

    renderWithRouter(<Login theme={mockTheme} />);

    // Expand email form
    fireEvent.click(screen.getByText(/Sign in with email/i));

    // Click forgot password link
    const forgotLink = screen.getByText(/Forgot your password\?/i);
    fireEvent.click(forgotLink);

    const emailInput = screen.getByPlaceholderText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });

    const sendResetBtn = screen.getByRole("button", {
      name: /Send Reset Link/i,
    });
    fireEvent.click(sendResetBtn);

    await waitFor(() => {
      expect(apiClient.requestPasswordReset).toHaveBeenCalledWith(
        "test@test.com"
      );
    });
  });

  it("handles reset password flow with resetToken", async () => {
    jest
      .spyOn(apiClient, "resetPassword")
      .mockResolvedValueOnce({ success: true });
    window.history.pushState({}, "Test Title", "/login?resetToken=abc");

    renderWithRouter(<Login theme={mockTheme} />);

    const passwordInput = screen.getByPlaceholderText(
      /New password \(min 6 chars\)/i
    );
    const confirmInput = screen.getByPlaceholderText(/Confirm new password/i);

    fireEvent.change(passwordInput, { target: { value: "NewPass123!" } });
    fireEvent.change(confirmInput, { target: { value: "NewPass123!" } });

    const resetBtn = screen.getByRole("button", { name: /Set New Password/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(apiClient.resetPassword).toHaveBeenCalledWith(
        "abc",
        "NewPass123!"
      );
      expect(
        screen.getByText(/Password reset! Please sign in./i)
      ).toBeInTheDocument();
    });
  });

  it("handles login error", async () => {
    jest.spyOn(apiClient, "loginAdmin").mockResolvedValueOnce({
      success: false,
      error: "Invalid credentials",
    });

    renderWithRouter(<Login theme={mockTheme} />);

    fireEvent.click(screen.getByText(/Sign in with email/i));

    const emailInput = screen.getByPlaceholderText(/Email address/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const loginBtn = document.getElementById("login-submit-btn");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("handles Cognito JWT in URL hash", () => {
    const payload = { email: "amrit.bhattarai990@gmail.com", sub: "123" };
    const token = "header." + btoa(JSON.stringify(payload)) + ".signature";
    window.location.hash = "#id_token=" + token;

    renderWithRouter(<Login theme={mockTheme} />);
    window.location.hash = "";
  });

  it("handles Google Login button click", () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = {
      origin: "http://localhost",
      href: "",
      hash: "",
      search: "",
    };
    renderWithRouter(<Login theme={mockTheme} />);
    const googleBtn = screen.getByText(/Sign in with Google/i);
    fireEvent.click(googleBtn);
    expect(window.location.href).toContain("cognito");
    window.location = originalLocation;
  });

  it("handles auth mode switching", () => {
    renderWithRouter(<Login theme={mockTheme} />);
    fireEvent.click(screen.getByText(/Create one/i));
    expect(screen.getByText(/Join us./i)).toBeInTheDocument();
  });

  it("handles signup validation errors", () => {
    renderWithRouter(<Login theme={mockTheme} />);
    fireEvent.click(screen.getByText(/Create one/i));
    fireEvent.click(screen.getByText(/Sign up with email/i));

    const submitBtn = document.getElementById("login-submit-btn");

    // Short username
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "ab" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password \(min 6 chars\)/i), {
      target: { value: "validpassword" },
    });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Username must be at least 3 characters/i)
    ).toBeInTheDocument();

    // Short password
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "validUser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password \(min 6 chars\)/i), {
      target: { value: "short" },
    });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Password must be at least 6 characters/i)
    ).toBeInTheDocument();

    // Invalid email
    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: "notanemail" },
    });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Please enter a valid email address/i)
    ).toBeInTheDocument();
  });

  it("handles forgot password errors", async () => {
    jest
      .spyOn(apiClient, "requestPasswordReset")
      .mockResolvedValueOnce({ success: false, error: "User not found" });
    renderWithRouter(<Login theme={mockTheme} />);

    fireEvent.click(screen.getByText(/Sign in with email/i));
    fireEvent.click(screen.getByText(/Forgot your password\?/i));

    const sendBtn = screen.getByRole("button", { name: /Send Reset Link/i });
    fireEvent.click(sendBtn); // Empty email triggers front-end validation
    expect(
      screen.getByText(/Please enter a valid email address./i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Email address/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/User not found/i)).toBeInTheDocument();
    });
  });

  it("handles verifyEmail error", async () => {
    jest
      .spyOn(apiClient, "verifyEmail")
      .mockResolvedValueOnce({ success: false, error: "Invalid token" });
    const originalLocation = window.location;
    delete window.location;
    window.location = {
      ...originalLocation,
      search: "?verifyToken=badtoken",
      hash: "",
    };
    renderWithRouter(<Login theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
    });
    window.location = originalLocation;
  });
});
