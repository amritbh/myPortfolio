import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactComponent from "./ContactComponent";
import { blueTheme } from "../../theme";
import axios from "axios";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  NavLink: ({ children, to, className }) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

// Mock react-reveal
jest.mock("react-reveal", () => ({
  Fade: ({ children }) => <div>{children}</div>,
}));

// Mock axios
jest.mock("axios", () => ({
  post: jest.fn(),
}));

describe("ContactComponent", () => {
  const mockTheme = blueTheme;

  beforeEach(() => {
    jest.clearAllMocks();
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

  test("shows validation errors when submitting empty form", async () => {
    render(<ContactComponent theme={mockTheme} />);

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(await screen.findByText("Subject is required")).toBeInTheDocument();
    expect(await screen.findByText("Message is required")).toBeInTheDocument();
  });

  test("submits form successfully when filled out correctly", async () => {
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

    const submitBtn = screen.getByRole("button", { name: /send message/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(/Something went wrong. Please try again./i)
    ).toBeInTheDocument();
  });
});
