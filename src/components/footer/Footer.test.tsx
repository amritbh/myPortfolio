// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";
import * as apiClient from "../../utils/apiClient";
import { vi } from "vitest";

// Mock @hcaptcha/react-hcaptcha
vi.mock("@hcaptcha/react-hcaptcha", () => {
  const HCaptchaMock = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      resetCaptcha: vi.fn(),
    }));
    return (
      <div data-testid="hcaptcha-widget">
        <button
          type="button"
          data-testid="hcaptcha-verify-btn"
          onClick={() => props.onVerify && props.onVerify("mock-captcha-token")}
        >
          Verify CAPTCHA
        </button>
      </div>
    );
  });
  HCaptchaMock.displayName = "HCaptcha";
  return { default: HCaptchaMock };
});

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
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Subscribe/i })
    ).toBeInTheDocument();
  });

  it("shows confirmation message after submitting with a valid email", async () => {
    vi.spyOn(apiClient, "subscribeToNewsletter").mockResolvedValueOnce({ success: true });
    renderWithRouter(<Footer theme={mockTheme} />);
    
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const subscribeBtn = screen.getByRole("button", { name: /subscribe/i });

    // Type email
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    
    // Verify CAPTCHA
    fireEvent.click(screen.getByTestId("hcaptcha-verify-btn"));
    
    // Submit
    fireEvent.click(subscribeBtn);

    await waitFor(() => {
      expect(apiClient.subscribeToNewsletter).toHaveBeenCalledWith(
        "test@example.com",
        "mock-captcha-token"
      );
    });
    expect(await screen.findByText(/Thanks! You'll be notified/i)).toBeInTheDocument();
  });

  it("does NOT show confirmation when submitting with an empty email", async () => {
    renderWithRouter(<Footer theme={mockTheme} />);
    fireEvent.click(screen.getByRole("button", { name: /Subscribe/i }));
    expect(
      screen.queryByText(/Thanks! You'll be notified/i)
    ).not.toBeInTheDocument();
  });
  
  it("shows error message if API fails", async () => {
    vi.spyOn(apiClient, "subscribeToNewsletter").mockResolvedValueOnce({ success: false, error: "Custom mock error" });
    renderWithRouter(<Footer theme={mockTheme} />);
    
    const emailInput = screen.getByPlaceholderText(/your@email.com/i);
    const subscribeBtn = screen.getByRole("button", { name: /subscribe/i });

    fireEvent.change(emailInput, { target: { value: "fail@example.com" } });
    fireEvent.click(screen.getByTestId("hcaptcha-verify-btn"));
    fireEvent.click(subscribeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Custom mock error/i)).toBeInTheDocument();
    });
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
