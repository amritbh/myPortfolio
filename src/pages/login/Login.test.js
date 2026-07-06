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
});
