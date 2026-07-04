import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { BrowserRouter } from "react-router-dom";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageDark: "#f5f5f5",
};

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("AdminDashboard Component", () => {
  it("renders login form initially", () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);
    expect(screen.getByText(/Admin Access/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  });

  it("authenticates and shows dashboard on valid login submission", () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const loginBtn = screen.getByRole("button", { name: /Login/i });

    // Type password
    fireEvent.change(passwordInput, { target: { value: "testpassword" } });
    fireEvent.click(loginBtn);

    // Should now show dashboard
    expect(screen.getByText(/Write a New Post/i)).toBeInTheDocument();
  });

  it("auto-generates slug from title in the dashboard", () => {
    renderWithRouter(<AdminDashboard theme={mockTheme} />);

    // Login
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "testpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Login/i }));

    // Find Title input
    // The label is "Title", so we can find input by next element or placeholder if it had one.
    // Instead we can use name attribute query
    const titleInput = document.querySelector('input[name="title"]');
    const slugInput = document.querySelector('input[name="slug"]');

    fireEvent.change(titleInput, { target: { value: "Hello World 123" } });

    expect(slugInput.value).toBe("hello-world-123");
  });
});
