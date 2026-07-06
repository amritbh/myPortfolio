import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import BlogList from "./BlogList";
import { fetchBlogs } from "../../utils/apiClient";
import { BrowserRouter } from "react-router-dom";

// Mock the API client
jest.mock("../../utils/apiClient", () => ({
  fetchBlogs: jest.fn(),
  getStoredUser: jest.fn(() => null),
  clearSession: jest.fn(),
}));

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
};

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("BlogList Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    fetchBlogs.mockResolvedValueOnce([]);

    // Use container query for the loader since it doesn't have text
    const { container } = renderWithRouter(<BlogList theme={mockTheme} />);

    expect(screen.getByText(/Articles & Insights/i)).toBeInTheDocument();

    // Check for the loader element by class name
    const loader = container.querySelector(".loader");
    expect(loader).toBeInTheDocument();
  });

  it("renders blogs after fetching", async () => {
    const mockBlogs = [
      {
        slug: "test-blog-1",
        title: "Test Blog 1",
        excerpt: "Test 1 summary",
        publishDate: "2026-01-01",
      },
      {
        slug: "test-blog-2",
        title: "Test Blog 2",
        excerpt: "Test 2 summary",
        publishDate: "2026-01-02",
      },
    ];
    fetchBlogs.mockResolvedValueOnce(mockBlogs);

    renderWithRouter(<BlogList theme={mockTheme} />);

    // Wait for loading to finish and for the mocked blog title to appear
    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
      expect(screen.getByText("Test Blog 2")).toBeInTheDocument();
    });
  });
});
