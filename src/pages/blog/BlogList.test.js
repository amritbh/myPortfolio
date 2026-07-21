import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import BlogList from "./BlogList";
import { fetchBlogs, fetchMediumBlogs } from "../../utils/apiClient";
import { BrowserRouter } from "react-router-dom";

jest.mock("../../utils/apiClient", () => ({
  fetchBlogs: jest.fn(),
  fetchMediumBlogs: jest.fn(),
  getStoredUser: jest.fn(() => null),
  clearSession: jest.fn(),
}));

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  imageDark: "#eeeeee",
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
    fetchMediumBlogs.mockResolvedValueOnce([]);
    const { container } = renderWithRouter(<BlogList theme={mockTheme} />);

    // The topic filter bar should always be visible
    expect(screen.getByText(/All/i)).toBeInTheDocument();

    // While loading, the spinner should be present
    const spinner = container.querySelector(".medium-spinner");
    expect(spinner).toBeInTheDocument();
  });

  it("renders blogs after fetching", async () => {
    const mockBlogs = [
      {
        slug: "test-blog-1",
        title: "Test Blog 1",
        summary: "Test 1 summary",
        publishDate: "2026-01-01",
      },
      {
        slug: "test-blog-2",
        title: "Test Blog 2",
        summary: "Test 2 summary",
        publishDate: "2026-01-02",
      },
    ];
    fetchBlogs.mockResolvedValueOnce(mockBlogs);
    fetchMediumBlogs.mockResolvedValueOnce([]);

    renderWithRouter(<BlogList theme={mockTheme} />);

    await waitFor(() => {
      // Blog title may appear in both the main feed AND the trending sidebar
      const instances = screen.getAllByText("Test Blog 1");
      expect(instances.length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Test Blog 2").length).toBeGreaterThanOrEqual(
        1
      );
    });
  });
});
