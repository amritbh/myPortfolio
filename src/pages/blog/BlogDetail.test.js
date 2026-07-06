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
    jest.clearAllMocks();
  });

  it("renders blog details correctly", async () => {
    jest.spyOn(apiClient, "fetchBlogBySlug").mockResolvedValueOnce({
      slug: "test-blog",
      title: "Test Blog",
      content: "This is a test blog content.",
      likes: ["amrit", "user1"],
      comments: [
        {
          id: "c1",
          username: "amrit",
          text: "Great post!",
          timestamp: "2026-01-01T00:00:00Z",
        },
      ],
    });
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ username: "amrit", role: "admin" });

    renderWithRouter(<BlogDetail theme={mockTheme} />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Test Blog" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("This is a test blog content.")
      ).toBeInTheDocument();
      expect(screen.getByText(/Great post!/i)).toBeInTheDocument(); // comment
    });

    jest
      .spyOn(apiClient, "likeBlog")
      .mockResolvedValue({ success: true, likes: ["amrit", "user1", "user2"] });
    const likeBtn = screen.getByRole("button", { name: /Liked/i });
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(apiClient.likeBlog).toHaveBeenCalledWith("test-blog");
    });

    jest
      .spyOn(apiClient, "commentBlog")
      .mockResolvedValue({
        success: true,
        comment: {
          id: "c2",
          username: "amrit",
          text: "New comment!",
          timestamp: "2026-01-02T00:00:00Z",
        },
      });
    const commentBox = screen.getByPlaceholderText(/Add a comment/i);
    fireEvent.change(commentBox, { target: { value: "New comment!" } });

    const submitBtn = screen.getByRole("button", { name: /Post Comment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiClient.commentBlog).toHaveBeenCalledWith(
        "test-blog",
        "New comment!"
      );
    });
  });
});
