import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter, Route, MemoryRouter } from "react-router-dom";
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

  it("renders sign in form initially", () => {
    renderWithRouter(<Login theme={mockTheme} />);
    expect(screen.getAllByText(/Sign In/i)[0]).toBeInTheDocument();
  });

  it("signs up user successfully when form is valid", async () => {
    jest.spyOn(apiClient, "signupAdmin").mockResolvedValueOnce({
      success: true,
      token: "signup-jwt-token",
      user: { username: "newuser", email: "user@example.com", role: "user" },
    });

    renderWithRouter(<Login theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign Up$/i }));

    const usernameInput = screen.getByPlaceholderText(
      /Username \(e\.g\. amrit\)/i
    );
    const emailInput = screen.getByPlaceholderText(/name@example\.com/i);
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    const passInput = passwordInputs[0];
    const confirmInput = passwordInputs[1];
    const submitBtn = screen.getByRole("button", { name: /Create Account/i });

    fireEvent.change(usernameInput, { target: { value: "newuser" } });
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passInput, { target: { value: "Password123!" } });
    fireEvent.change(confirmInput, { target: { value: "Password123!" } });

    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(
        /Account created! Please check your email to verify./i
      )
    ).toBeInTheDocument();
  });

  it("authenticates and redirects on valid sign in", async () => {
    jest.spyOn(apiClient, "loginAdmin").mockResolvedValueOnce({
      success: true,
      token: "valid-jwt-token",
      user: { username: "admin", role: "admin" },
    });

    renderWithRouter(<Login theme={mockTheme} />);

    const usernameInput = screen.getByPlaceholderText(
      /Username \(e\.g\. amrit\)/i
    );
    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];

    // There are tabs with text 'Sign In' and a button with 'Sign In'
    const loginBtns = screen.getAllByRole("button", { name: /^Sign In$/i });
    const loginBtn = loginBtns[loginBtns.length - 1]; // Submit button

    fireEvent.change(usernameInput, { target: { value: "admin" } });
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
        screen.getByText(/Email verified successfully!/i)
      ).toBeInTheDocument();
    });
  });

  it("handles forgot password and reset flows", async () => {
    jest
      .spyOn(apiClient, "requestPasswordReset")
      .mockResolvedValueOnce({ success: true });

    renderWithRouter(<Login theme={mockTheme} />);

    // Click forgot password
    const forgotLink = screen.getByText(/Forgot Password\?/i);
    fireEvent.click(forgotLink);

    const emailInput = screen.getByPlaceholderText(/name@example.com/i);
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

    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordInputs[0], { target: { value: "NewPass123!" } });
    fireEvent.change(passwordInputs[1], { target: { value: "NewPass123!" } });

    const resetBtn = screen.getByRole("button", { name: /Update Password/i });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(apiClient.resetPassword).toHaveBeenCalledWith(
        "abc",
        "NewPass123!"
      );
      expect(
        screen.getByText(/Password reset successful! Please log in./i)
      ).toBeInTheDocument();
    });
  });

  it("handles login error", async () => {
    jest.spyOn(apiClient, "loginAdmin").mockResolvedValueOnce({
      success: false,
      error: "Invalid credentials",
    });

    renderWithRouter(<Login theme={mockTheme} />);

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
    const loginBtns = screen.getAllByRole("button", { name: /^Sign In$/i });
    const loginBtn = loginBtns[loginBtns.length - 1];

    fireEvent.change(usernameInput, { target: { value: "admin" } });
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
    // Should have redirected to admin due to email match
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
    const googleBtn = screen.getByText(/Continue with Google/i);
    fireEvent.click(googleBtn);
    expect(window.location.href).toContain("cognito");
    window.location = originalLocation;
  });

  it("handles auth mode switching", () => {
    renderWithRouter(<Login theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign Up$/i }));
    expect(
      screen.getByRole("button", { name: /Create Account/i })
    ).toBeInTheDocument();
  });

  it("handles signup validation errors", () => {
    renderWithRouter(<Login theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /^Sign Up$/i }));
    const submitBtn = screen.getByRole("button", { name: /Create Account/i });

    // Short username
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "ab" },
    });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Username must be at least 3 characters long/i)
    ).toBeInTheDocument();

    // Short password
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "validUser" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: "short" },
    });
    fireEvent.click(submitBtn);
    expect(
      screen.getByText(/Password must be at least 6 characters long/i)
    ).toBeInTheDocument();
  });

  it("handles forgot password errors", async () => {
    jest
      .spyOn(apiClient, "requestPasswordReset")
      .mockResolvedValueOnce({ success: false, error: "User not found" });
    renderWithRouter(<Login theme={mockTheme} />);
    fireEvent.click(screen.getByText(/Forgot Password\?/i));

    const sendBtn = screen.getByRole("button", { name: /Send Reset Link/i });
    fireEvent.click(sendBtn); // Empty email
    expect(
      screen.getByText(/Valid email address is required/i)
    ).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
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
