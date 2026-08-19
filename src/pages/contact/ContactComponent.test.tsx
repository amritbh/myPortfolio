// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import ContactComponent from "./ContactComponent";
import { blueTheme } from "../../theme";
import axios from "axios";

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    NavLink: ({ children, to, className }) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  };
});

// Mock react-reveal
vi.mock("react-reveal", () => ({
  Fade: ({ children }) => <div>{children}</div>,
}));

// Mock axios
vi.mock("axios", () => ({
  default: { post: vi.fn() },
}));

// Mock @hcaptcha/react-hcaptcha — expose onVerify so tests can trigger it
vi.mock("@hcaptcha/react-hcaptcha", () => {
  const HCaptchaMock = React.forwardRef((props: any, ref: any) => {
    // Expose resetCaptcha so the component can call captchaRef.current.resetCaptcha()
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

describe("ContactComponent", () => {
  const mockTheme = blueTheme;

  let dateNowSpy: ReturnType<typeof vi.spyOn>;
  // Real system time captured once at import time (before any mocking)
  const REAL_NOW = Date.now();

  beforeEach(() => {
    vi.clearAllMocks();
    // The first call to Date.now() records formRenderedAt as 5s in the past.
    // Every subsequent call returns real time, so the time-gate (elapsed >= 3000)
    // always passes when submit fires, and async waitFor/findBy still work.
    let callCount = 0;
    dateNowSpy = vi.spyOn(Date, "now").mockImplementation(() => {
      callCount++;
      return callCount === 1 ? REAL_NOW - 5000 : REAL_NOW;
    });
  });

  afterEach(() => {
    dateNowSpy.mockRestore();
  });

  test("renders ContactComponent elements correctly", () => {
    render(<ContactComponent theme={mockTheme} />);

    expect(screen.getByText("Let's Connect")).toBeInTheDocument();
    expect(screen.getByText("Send a Message")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Name *")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email Address *")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Subject *")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your Message *")).toBeInTheDocument();
  });

  test("renders hCaptcha widget", () => {
    render(<ContactComponent theme={mockTheme} />);
    expect(screen.getByTestId("hcaptcha-widget")).toBeInTheDocument();
  });

  test("honeypot field is present in DOM but not visible to users", () => {
    render(<ContactComponent theme={mockTheme} />);
    const honeypot = document.getElementById("contact-website");
    expect(honeypot).toBeInTheDocument();
    // The honeypot wrapper uses .contact-honeypot which positions it off-screen
    const wrapper = honeypot?.closest(".contact-honeypot");
    expect(wrapper).toBeInTheDocument();
  });

  test("shows validation errors when submitting empty form", async () => {
    render(<ContactComponent theme={mockTheme} />);

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Subject is required")).toBeInTheDocument();
    expect(await screen.findByText("Message is required")).toBeInTheDocument();
  });

  test("shows captcha error when form is filled but captcha not verified", async () => {
    render(<ContactComponent theme={mockTheme} />);

    fireEvent.change(screen.getByPlaceholderText("Your Name *"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email Address *"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject *"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Message *"), {
      target: { value: "This is a test message." },
    });

    // Don't click the CAPTCHA verify button — submit without token
    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText("Please complete the CAPTCHA challenge.")
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("submits form successfully when filled out correctly and CAPTCHA verified", async () => {
    axios.post.mockResolvedValueOnce({ data: { message: "Success" } });

    render(<ContactComponent theme={mockTheme} />);

    fireEvent.change(screen.getByPlaceholderText("Your Name *"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email Address *"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject *"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Message *"), {
      target: { value: "This is a test message." },
    });

    // Complete the CAPTCHA
    fireEvent.click(screen.getByTestId("hcaptcha-verify-btn"));

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          username: "John Doe",
          email: "john@example.com",
          messageTitle: "Hello",
          message: "This is a test message.",
          captchaToken: "mock-captcha-token",
        }),
        expect.any(Object)
      );
    });

    expect(
      await screen.findByText(/Message sent successfully!/i)
    ).toBeInTheDocument();
  });

  test("shows error alert on API submission failure", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<ContactComponent theme={mockTheme} />);

    fireEvent.change(screen.getByPlaceholderText("Your Name *"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email Address *"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject *"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Message *"), {
      target: { value: "This is a test message." },
    });

    // Complete the CAPTCHA
    fireEvent.click(screen.getByTestId("hcaptcha-verify-btn"));

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Something went wrong. Please try again./i)
    ).toBeInTheDocument();
  });

  test("honeypot-filled submission is silently dropped without API call", async () => {
    render(<ContactComponent theme={mockTheme} />);

    // Fill in all visible fields
    fireEvent.change(screen.getByPlaceholderText("Your Name *"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email Address *"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Subject *"), {
      target: { value: "Hello" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your Message *"), {
      target: { value: "This is a test message." },
    });

    // Simulate bot filling the hidden honeypot field
    const honeypot = document.getElementById("contact-website");
    fireEvent.change(honeypot!, { target: { value: "http://spamsite.com" } });

    // Complete captcha and submit
    fireEvent.click(screen.getByTestId("hcaptcha-verify-btn"));
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    // Should appear to succeed (silent drop) but NOT call axios
    expect(
      await screen.findByText(/Message sent successfully!/i)
    ).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });
});
