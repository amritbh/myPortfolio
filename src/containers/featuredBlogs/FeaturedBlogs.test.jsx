import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import FeaturedBlogs from "./FeaturedBlogs";
import * as apiClient from "../../utils/apiClient";

const mockTheme = {
  text: "#000",
  secondaryText: "#666",
  headerColor: "#fff",
  highlight: "#ccc",
  jacketColor: "#388BFD",
};

const mockBlogData = [
  {
    slug: "blog-one",
    title: "Blog Post One",
    summary: "Summary for blog post one.",
    publishDate: "2026-08-01T00:00:00Z",
    readTime: "5 min read",
    tags: ["AWS", "Terraform"],
  },
  {
    slug: "blog-two",
    title: "Blog Post Two",
    summary: "Summary for blog post two.",
    publishDate: "2026-07-20T00:00:00Z",
    readTime: "8 min read",
    tags: ["React"],
  },
  {
    slug: "blog-three",
    title: "Blog Post Three",
    summary: "Summary for blog post three.",
    publishDate: "2026-07-15T00:00:00Z",
    readTime: "6 min read",
    tags: ["Python"],
  },
  {
    slug: "blog-four",
    title: "Blog Post Four (should not appear)",
    summary: "This is the 4th post and should be excluded.",
    publishDate: "2026-07-10T00:00:00Z",
    readTime: "4 min read",
    tags: ["DevOps"],
  },
];

function renderWithRouter(ui) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("FeaturedBlogs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders skeleton cards while loading", () => {
    vi.spyOn(apiClient, "fetchBlogs").mockReturnValue(new Promise(() => {}));
    const { container } = renderWithRouter(<FeaturedBlogs theme={mockTheme} />);
    const skeletons = container.querySelectorAll(".blog-card.skeleton");
    expect(skeletons.length).toBe(3);
  });

  it("renders the 3 most recent blog cards after loading", async () => {
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValue(mockBlogData);
    renderWithRouter(<FeaturedBlogs theme={mockTheme} />);
    await waitFor(() => {
      expect(screen.getByText("Blog Post One")).toBeInTheDocument();
      expect(screen.getByText("Blog Post Two")).toBeInTheDocument();
      expect(screen.getByText("Blog Post Three")).toBeInTheDocument();
    });
    expect(
      screen.queryByText("Blog Post Four (should not appear)")
    ).not.toBeInTheDocument();
  });

  it("renders the 'View All Posts' link to /blogs", async () => {
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValue(mockBlogData);
    renderWithRouter(<FeaturedBlogs theme={mockTheme} />);
    await waitFor(() => {
      const link = screen.getByText("View All Posts →");
      expect(link).toBeInTheDocument();
      expect(link.closest("a")).toHaveAttribute("href", "/blogs");
    });
  });

  it("renders empty state message when API returns empty array", async () => {
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValue([]);
    renderWithRouter(<FeaturedBlogs theme={mockTheme} />);
    await waitFor(() => {
      expect(
        screen.getByText("No posts yet — check back soon!")
      ).toBeInTheDocument();
    });
  });

  it("renders error message when API call fails", async () => {
    jest
      .spyOn(apiClient, "fetchBlogs")
      .mockRejectedValue(new Error("Network error"));
    renderWithRouter(<FeaturedBlogs theme={mockTheme} />);
    await waitFor(() => {
      expect(screen.getByText("Could not load posts.")).toBeInTheDocument();
    });
  });

  it("renders correctly when theme is not provided (default fallback)", async () => {
    // This covers all the `theme ? ... : undefined` branch conditions
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValue(mockBlogData);
    renderWithRouter(<FeaturedBlogs />);
    await waitFor(() => {
      expect(screen.getByText("Blog Post One")).toBeInTheDocument();
    });
  });
});
