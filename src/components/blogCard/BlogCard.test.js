import React from "react";
import { render, screen } from "@testing-library/react";
import BlogCard from "./BlogCard";
import { BrowserRouter } from "react-router-dom";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  highlight: "#a066fb",
};

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("BlogCard Component", () => {
  it("renders with all blog details", () => {
    const blog = {
      slug: "test-blog",
      title: "Test Blog",
      content: "This is some test content that is somewhat long.",
      author: {
        name: "Amrit",
      },
      tags: ["React", "JavaScript", "Testing"],
      readTime: "5 min read",
      likes: ["user1", "user2"],
      comments: [{ id: "c1", text: "Nice!" }],
      imageUrl: "https://example.com/img.jpg",
    };

    renderWithRouter(<BlogCard blog={blog} theme={mockTheme} />);
    expect(screen.getByText("Test Blog")).toBeInTheDocument();
    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("JavaScript")).toBeInTheDocument();
    expect(screen.getByText("Amrit")).toBeInTheDocument();
    expect(screen.getByText("❤ 2")).toBeInTheDocument();
    expect(screen.getByText("💬 1")).toBeInTheDocument();
  });

  it("renders with minimal blog details", () => {
    const blog = {
      slug: "test-blog",
      title: "Test Blog",
      content: "Content",
    };

    renderWithRouter(<BlogCard blog={blog} theme={mockTheme} />);
    expect(screen.getByText("Test Blog")).toBeInTheDocument();
    expect(screen.queryByText("❤")).not.toBeInTheDocument();
    expect(screen.queryByText("💬")).not.toBeInTheDocument();
  });
});
