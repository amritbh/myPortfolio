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

    expect(await screen.findByText(/Write a New Post/i)).toBeInTheDocument();
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
});
