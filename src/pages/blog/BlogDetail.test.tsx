// @ts-nocheck
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BlogDetail from "./BlogDetail";
import { BrowserRouter, Route } from "react-router-dom";
import * as apiClient from "../../utils/apiClient";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  imageDark: "#eeeeee",
};

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      <Route
        render={(props) =>
          React.cloneElement(ui, {
            ...props,
            match: { params: { slug: "test-blog" } },
          })
        }
      />
    </BrowserRouter>
  );
};

describe("BlogDetail Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.alert = vi.fn();
  });

  it("renders blog details correctly", async () => {
    vi.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce({
      slug: "test-blog",
      title: "Test Blog",
      content: "This is a test blog content.",
      likes: ["amrit", "user1"],
      comments: [
        {
          id: "c1",
          username: "amrit",
          name: "Amrit Bhattarai",
          picture: "https://example.com/pic.jpg",
          text: "Great post!",
          timestamp: "2026-01-01T00:00:00Z",
        },
      ],
    });
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValueOnce([]);
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue({
      username: "amrit",
      name: "Amrit Bhattarai",
      picture: "https://example.com/pic.jpg",
      role: "admin",
    });

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Blog" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("This is a test blog content.")
      ).toBeInTheDocument();
      expect(screen.getByText(/Great post!/i)).toBeInTheDocument();
      expect(screen.getAllByText("Amrit Bhattarai").length).toBeGreaterThan(0);
    });

    jest
      .spyOn(apiClient, "likeBlog")
      .mockResolvedValue({ success: true, likes: ["amrit", "user1", "user2"] });

    // Like engagement button - find it by its title attr
    const likeBtn = screen.getByTitle("Like this story");
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(apiClient.likeBlog).toHaveBeenCalledWith("test-blog");
    });

    vi.spyOn(apiClient, "commentBlog").mockResolvedValue({
      success: true,
      comment: {
        id: "c2",
        username: "amrit",
        text: "New comment!",
        timestamp: "2026-01-02T00:00:00Z",
      },
    });

    // New response textarea uses "What are your thoughts?" placeholder
    const commentBox = screen.getByPlaceholderText(/What are your thoughts/i);
    fireEvent.change(commentBox, { target: { value: "New comment!" } });

    const submitBtn = screen.getByRole("button", { name: /Publish/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.commentBlog).toHaveBeenCalledWith(
        "test-blog",
        "New comment!"
      );
    });
  });

  it("formats legacy comment names containing an email domain correctly", async () => {
    vi.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce({
      slug: "test-blog",
      title: "Test Blog",
      content: "This is a test blog content.",
      likes: [],
      comments: [
        {
          id: "c1",
          username: "unblended0992@gmail.com",
          name: "unblended0992@gmail.com",
          text: "Legacy comment!",
          timestamp: "2026-01-01T00:00:00Z",
        },
      ],
    });
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValueOnce([]);
    vi.spyOn(apiClient, "getStoredUser").mockReturnValue(null);

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText("Legacy comment!")).toBeInTheDocument();
      // Should strip @gmail.com
      expect(screen.getByText("unblended0992")).toBeInTheDocument();
    });
  });

  it("handles delete comment", async () => {
    vi.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce({
      slug: "test-blog",
      title: "Test Blog",
      content: "Content.",
      likes: [],
      comments: [
        {
          id: "c1",
          username: "amrit",
          text: "Great post!",
          timestamp: "2026-01-01T00:00:00Z",
        },
      ],
    });
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValueOnce([]);
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "amrit", role: "admin" });
    jest
      .spyOn(apiClient, "deleteComment")
      .mockResolvedValueOnce({ success: true });

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText(/Great post!/i)).toBeInTheDocument();
    });

    vi.spyOn(window, "confirm").mockReturnValueOnce(true);

    const deleteBtn = screen.getByTitle("Delete");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(apiClient.deleteComment).toHaveBeenCalledWith("test-blog", "c1");
    });
  });

  it("handles API errors gracefully", async () => {
    vi.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce({
      slug: "test-blog",
      title: "Test Blog",
      content: "Content.",
      likes: [],
      comments: [],
    });
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValueOnce([]);
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "user1", role: "user" });
    jest
      .spyOn(apiClient, "likeBlog")
      .mockResolvedValueOnce({ success: false, error: "Network error" });
    jest
      .spyOn(apiClient, "commentBlog")
      .mockResolvedValueOnce({ success: false, error: "Network error" });

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText("Content.")).toBeInTheDocument();
    });

    // The like engagement button found by title
    const likeBtn = screen.getByTitle("Like this story");
    fireEvent.click(likeBtn);

    const commentBox = screen.getByPlaceholderText(/What are your thoughts/i);
    fireEvent.change(commentBox, { target: { value: "New comment!" } });
    const submitBtn = screen.getByRole("button", { name: /Publish/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.commentBlog).toHaveBeenCalled();
      expect(apiClient.likeBlog).toHaveBeenCalled();
    });
  });

  it("handles share link and reading progress", async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    const testBlog = {
      slug: "test-blog",
      title: "Test Blog",
      content: "Content",
    };
    const relatedBlog = {
      slug: "related-1",
      title: "Related 1",
      content: "Content",
    };

    vi.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce(testBlog);
    jest
      .spyOn(apiClient, "fetchBlogs")
      .mockResolvedValueOnce([testBlog, relatedBlog]);

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText("Related 1")).toBeInTheDocument();
    });

    const shareBtn = screen.getByTitle("Copy link");
    fireEvent.click(shareBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://amrit.cloud/blogs/test-blog"
    );

    // Trigger scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });
  });

  it("handles sharing the blog post via navigator.share if supported", async () => {
    const originalShare = global.navigator.share;
    global.navigator.share = vi.fn().mockResolvedValue(true);

    const testBlog = {
      slug: "test-blog-2",
      title: "Test Blog 2",
      summary: "Test summary",
      content: "Content",
    };

    vi.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce(testBlog);
    vi.spyOn(apiClient, "fetchBlogs").mockResolvedValueOnce([testBlog]);

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getAllByText("Test Blog 2")[0]).toBeInTheDocument();
    });

    const shareBtn = screen.getByTitle("Copy link");
    fireEvent.click(shareBtn);

    expect(global.navigator.share).toHaveBeenCalledWith({
      title: "Test Blog 2",
      text: "Test summary",
      url: "https://amrit.cloud/blogs/test-blog-2",
    });

    global.navigator.share = originalShare;
  });
});
