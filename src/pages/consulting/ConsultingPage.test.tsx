import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import ConsultingPage from "./ConsultingPage";
import { darkTheme } from "../../theme";

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

global.fetch = vi.fn().mockResolvedValue({ ok: true });

const renderPage = () =>
  render(
    <MemoryRouter>
      <ConsultingPage theme={darkTheme} themeMode="dark" />
    </MemoryRouter>
  );

describe("ConsultingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the consulting page", () => {
    renderPage();
    expect(screen.getByTestId("consulting-page")).toBeInTheDocument();
  });

  it("renders the hero title from portfolio data", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: /Cloud Architecture, DevOps\/SRE and Agentic AI Consulting/i })
    ).toBeInTheDocument();
  });

  it("renders all 5 service cards", () => {
    renderPage();
    expect(screen.getByTestId("consulting-service-architecture-review")).toBeInTheDocument();
    expect(screen.getByTestId("consulting-service-terraform-audit")).toBeInTheDocument();
    expect(screen.getByTestId("consulting-service-cicd-devops")).toBeInTheDocument();
    expect(screen.getByTestId("consulting-service-agentic-ai")).toBeInTheDocument();
    expect(screen.getByTestId("consulting-service-career-coaching")).toBeInTheDocument();
  });

  it("does NOT show any price/rate on service cards (rates hidden)", () => {
    renderPage();
    expect(screen.queryByText(/\$/)).not.toBeInTheDocument();
  });

  it("renders all 3 persona cards", () => {
    renderPage();
    expect(screen.getByTestId("persona-startup-cto")).toBeInTheDocument();
    expect(screen.getByTestId("persona-engineering-manager")).toBeInTheDocument();
    expect(screen.getByTestId("persona-career-switcher")).toBeInTheDocument();
  });

  it("renders FAQ items", () => {
    renderPage();
    // 5 FAQ items now (added AI agents question)
    expect(screen.getByTestId("faq-item-0")).toBeInTheDocument();
    expect(screen.getByTestId("faq-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("faq-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("faq-item-3")).toBeInTheDocument();
    expect(screen.getByTestId("faq-item-4")).toBeInTheDocument();
  });

  it("FAQ answer is hidden by default and shows on click", () => {
    renderPage();
    expect(screen.queryByTestId("faq-answer-0")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /when will spots open/i }));
    expect(screen.getByTestId("faq-answer-0")).toBeInTheDocument();
  });

  it("FAQ closes when clicked again", () => {
    renderPage();
    const btn = screen.getByRole("button", { name: /when will spots open/i });
    fireEvent.click(btn);
    expect(screen.getByTestId("faq-answer-0")).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByTestId("faq-answer-0")).not.toBeInTheDocument();
  });

  it("shows error when submitting form with empty name", async () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));
    expect(await screen.findByTestId("consulting-form-error")).toHaveTextContent(
      "Please enter your name."
    );
  });

  it("shows error when submitting with invalid email", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Your Name *"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email Address *"), {
      target: { value: "bad-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));
    expect(await screen.findByTestId("consulting-form-error")).toHaveTextContent(
      "Please enter a valid email address."
    );
  });

  it("shows success message after valid submission and captcha verification", async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText("Your Name *"), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText("Email Address *"), {
      target: { value: "test@example.com" },
    });
    
    // Verify CAPTCHA (click the first one)
    fireEvent.click(screen.getAllByTestId("hcaptcha-verify-btn")[0]);
    
    fireEvent.click(screen.getAllByRole("button", { name: /join waitlist/i })[0]);
    expect(await screen.findByTestId("consulting-success-message")).toBeInTheDocument();
  });
});
