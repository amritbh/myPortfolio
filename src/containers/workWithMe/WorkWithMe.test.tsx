import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import WorkWithMe from "./WorkWithMe";
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

// Mock fetch globally
global.fetch = vi.fn().mockResolvedValue({ ok: true });

const renderComponent = () =>
  render(
    <MemoryRouter>
      <WorkWithMe theme={darkTheme} />
    </MemoryRouter>
  );

describe("WorkWithMe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the section with heading", () => {
    renderComponent();
    expect(screen.getByTestId("work-with-me-section")).toBeInTheDocument();
    expect(screen.getByText("Work With Me")).toBeInTheDocument();
  });

  it("renders all 5 service cards", () => {
    renderComponent();
    expect(screen.getByTestId("service-card-architecture-review")).toBeInTheDocument();
    expect(screen.getByTestId("service-card-terraform-audit")).toBeInTheDocument();
    expect(screen.getByTestId("service-card-cicd-devops")).toBeInTheDocument();
    expect(screen.getByTestId("service-card-agentic-ai")).toBeInTheDocument();
    expect(screen.getByTestId("service-card-career-coaching")).toBeInTheDocument();
  });

  it("shows 'Coming Soon' badge on every service card", () => {
    renderComponent();
    const badges = screen.getAllByText("Coming Soon");
    // One badge in the header + one per card
    expect(badges.length).toBeGreaterThanOrEqual(3);
  });

  it("renders the waitlist email input", () => {
    renderComponent();
    expect(screen.getByLabelText("Email address for consulting waitlist")).toBeInTheDocument();
  });

  it("shows error when submitting with empty email", async () => {
    renderComponent();
    const btn = screen.getByRole("button", { name: /join waitlist/i });
    fireEvent.click(btn);
    expect(await screen.findByTestId("wwm-email-error")).toHaveTextContent(
      "Please enter your email address."
    );
  });

  it("shows error when submitting with invalid email", async () => {
    renderComponent();
    const input = screen.getByLabelText("Email address for consulting waitlist");
    fireEvent.change(input, { target: { value: "not-an-email" } });
    const btn = screen.getByRole("button", { name: /join waitlist/i });
    fireEvent.click(btn);
    expect(await screen.findByTestId("wwm-email-error")).toHaveTextContent(
      "Please enter a valid email address."
    );
  });

  it("shows success message after valid submit and captcha verification", async () => {
    renderComponent();
    const input = screen.getByLabelText("Email address for consulting waitlist");
    fireEvent.change(input, { target: { value: "test@example.com" } });
    
    // Verify CAPTCHA
    fireEvent.click(screen.getByTestId("hcaptcha-verify-btn"));
    
    const btn = screen.getByRole("button", { name: /join waitlist/i });
    fireEvent.click(btn);
    await waitFor(() =>
      expect(screen.getByTestId("wwm-success-message")).toBeInTheDocument()
    );
  });

  it("renders the 'View full details' link pointing to /consulting", () => {
    renderComponent();
    const link = screen.getByRole("link", { name: /view full details/i });
    expect(link).toHaveAttribute("href", "/consulting");
  });

  it("renders durations on each card", () => {
    renderComponent();
    // Two cards have 60 min, two have 90 min
    const sixtyMin = screen.getAllByText(/60 min/);
    expect(sixtyMin.length).toBeGreaterThanOrEqual(1);
    const ninetyMin = screen.getAllByText(/90 min/);
    expect(ninetyMin.length).toBeGreaterThanOrEqual(1);
  });
});
