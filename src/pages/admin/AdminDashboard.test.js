import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { MemoryRouter, Route } from "react-router-dom";
import * as apiClient from "../../utils/apiClient";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  imageDark: "#eeeeee",
};

const mockBlogs = [
  {
    slug: "test-blog-1",
    title: "Test Blog 1",
    summary: "Summary 1",
    publishDate: "2026-01-01",
    likes: ["user1", "user2"],
    comments: [{ id: 1, text: "nice" }],
  },
  {
    slug: "test-blog-2",
    title: "Test Blog 2",
    summary: "Summary 2",
    publishDate: "2026-01-02",
  },
];

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, "scrollTo").mockImplementation(() => {});
    jest.spyOn(apiClient, "getStoredToken").mockReturnValue("token");
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ role: "admin", username: "adminuser" });
    jest.spyOn(apiClient, "fetchBlogs").mockResolvedValue(mockBlogs);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("redirects to login if user is not admin", () => {
    jest.spyOn(apiClient, "getStoredToken").mockReturnValue(null);
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue(null);

    let testHistory;
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => {
            testHistory = props.history;
            return <AdminDashboard theme={mockTheme} {...props} />;
          }}
        />
      </MemoryRouter>
    );

    expect(testHistory.location.pathname).toBe("/login");
  });

  it("renders unified dashboard and handles new blog creation", async () => {
    jest.spyOn(apiClient, "createBlog").mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // The title textarea
    const titleInput = screen.getByPlaceholderText(/Your story title/i);
    fireEvent.change(titleInput, {
      target: { name: "title", value: "My New Blog" },
    });

    // Sidebar inputs
    const slugInput = screen.getByPlaceholderText("my-post-slug");
    fireEvent.change(slugInput, {
      target: { name: "slug", value: "my-new-blog" },
    });

    // Content area
    const contentArea = screen.getByPlaceholderText(/Write your story/i);
    fireEvent.change(contentArea, {
      target: { name: "content", value: "This is my story." },
    });

    // Click publish now (it starts disabled, so we have to ensure it's enabled by having all required fields, which we do)
    const publishBtn = screen.getByRole("button", { name: /Publish Now/i });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(apiClient.createBlog).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "My New Blog",
          slug: "my-new-blog",
          content: "This is my story.",
        }),
        "token"
      );
    });
  });

  it("handles edit flow from My Stories sidebar", async () => {
    jest.spyOn(apiClient, "updateBlog").mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // Open My Stories toggle
    const toggleBtn = screen.getByRole("button", { name: /My Stories/i });
    fireEvent.click(toggleBtn);

    // Wait for blogs to load and be visible in the dropdown
    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
    });

    // Click the edit button for the first blog
    const editBtns = screen.getAllByText(/✎ Edit/i);
    fireEvent.click(editBtns[0]);

    // Should switch back to editor and update publish button to "✓ Update Story"
    expect(
      screen.getByRole("button", { name: /Update Story/i })
    ).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/Your story title/i);
    fireEvent.change(titleInput, {
      target: { name: "title", value: "Updated Title" },
    });

    // Click Update Story
    const updateBtn = screen.getByRole("button", { name: /Update Story/i });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(apiClient.updateBlog).toHaveBeenCalledWith(
        "test-blog-1",
        expect.objectContaining({ title: "Updated Title" }),
        "token"
      );
    });
  });

  it("handles delete flow from My Stories sidebar", async () => {
    jest.spyOn(apiClient, "deleteBlog").mockResolvedValue({ success: true });
    jest.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // Open My Stories toggle
    const toggleBtn = screen.getByRole("button", { name: /My Stories/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
    });

    // Find all delete buttons in the dropdown list and click the first one
    const deleteBtns = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteBtns[0]);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(apiClient.deleteBlog).toHaveBeenCalledWith("test-blog-1", "token");
    });
  });

  it("handles logout", () => {
    const clearSessionSpy = jest
      .spyOn(apiClient, "clearSession")
      .mockImplementation(() => {});

    let testHistory;
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => {
            testHistory = props.history;
            return <AdminDashboard theme={mockTheme} {...props} />;
          }}
        />
      </MemoryRouter>
    );

    // Click Sign Out
    const logoutBtn = screen.getByRole("button", { name: /Sign Out/i });
    fireEvent.click(logoutBtn);

    expect(clearSessionSpy).toHaveBeenCalled();
    expect(testHistory.location.pathname).toBe("/login");
  });

  it("handles toolbar formatting and tag input logic", async () => {
    jest.spyOn(apiClient, "createBlog").mockResolvedValue({ success: true });
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // 1. Tag input tests
    const activeTagInput = screen.getByPlaceholderText(/Add topic/i);

    // Add tag via Enter
    fireEvent.change(activeTagInput, { target: { value: "react" } });
    fireEvent.keyDown(activeTagInput, { key: "Enter", code: "Enter" });

    // Add tag via comma
    fireEvent.change(activeTagInput, { target: { value: "javascript" } });
    fireEvent.keyDown(activeTagInput, { key: ",", code: "Comma" });

    // Expect tags to be rendered
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();

    // Remove tag via button
    const removeBtns = document.querySelectorAll(".ag-tag-chip-remove");
    if (removeBtns.length > 0) {
      fireEvent.click(removeBtns[0]);
    }

    // 2. Toolbar formatting
    const contentArea = screen.getByPlaceholderText(/Write your story/i);
    contentArea.value = "my text";
    contentArea.selectionStart = 0;
    contentArea.selectionEnd = 7;

    const boldBtn = screen.getByRole("button", { name: "B" });
    fireEvent.mouseDown(boldBtn);

    const h2Btn = screen.getByRole("button", { name: "H2" });
    fireEvent.mouseDown(h2Btn);
  });
  it("handles media upload via file input", async () => {
    const uploadSpy = jest
      .spyOn(apiClient, "uploadMediaToS3")
      .mockResolvedValue({
        success: true,
        url: "https://amrit.cloud/media/image.png",
      });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(uploadSpy).toHaveBeenCalledWith(file, expect.any(Function));
  });

  it("handles drag and drop media upload", async () => {
    const uploadSpy = jest
      .spyOn(apiClient, "uploadMediaToS3")
      .mockResolvedValue({
        success: true,
        url: "https://amrit.cloud/media/dropped.png",
      });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    const dropZone = document.querySelector(".ag-drop-zone");
    const file = new File(["hello"], "dropped.png", { type: "image/png" });

    await act(async () => {
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file],
        },
      });
    });

    expect(uploadSpy).toHaveBeenCalledWith(file, expect.any(Function));
  });

  it("handles media upload failure", async () => {
    const uploadSpy = jest
      .spyOn(apiClient, "uploadMediaToS3")
      .mockResolvedValue({
        success: false,
        error: "Upload failed",
      });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    const file = new File(["hello"], "error.png", { type: "image/png" });
    const input = document.querySelector('input[type="file"]');

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    expect(uploadSpy).toHaveBeenCalled();
  });
});
