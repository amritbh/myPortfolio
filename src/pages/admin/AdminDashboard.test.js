import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    jest.spyOn(apiClient, "getStoredToken").mockReturnValue("token");
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ role: "admin", username: "adminuser" });
    jest
      .spyOn(apiClient, "fetchBlogs")
      .mockResolvedValue({ success: true, data: mockBlogs });
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

  it("renders CMS if user is admin and handles form input and publish", async () => {
    jest.spyOn(apiClient, "createBlog").mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // New story tab should be visible
    expect(screen.getByText(/New story/i)).toBeInTheDocument();

    // The title textarea is the first textbox in the editor
    const titleInput = screen.getAllByRole("textbox")[0];
    fireEvent.change(titleInput, {
      target: { name: "title", value: "My New Blog" },
    });

    // Open publish panel
    const publishBtn = screen.getByRole("button", { name: /^Publish$/i });
    fireEvent.click(publishBtn);

    // Add a slug in the panel
    await waitFor(() => {
      expect(screen.getByText(/Story Preview/i)).toBeInTheDocument();
    });

    // Click publish now
    const publishNowBtn = screen.getByRole("button", { name: /Publish now/i });
    fireEvent.click(publishNowBtn);

    await waitFor(() => {
      expect(apiClient.createBlog).toHaveBeenCalled();
    });
  });

  it("handles edit flow from manage tab", async () => {
    jest.spyOn(apiClient, "updateBlog").mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // Switch to Stories tab
    const manageTab = screen.getByText("Stories");
    fireEvent.click(manageTab);

    // Wait for blogs to load
    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
    });

    // Click edit on the first blog
    const editBtns = screen.getAllByText("Edit");
    fireEvent.click(editBtns[0]);

    // Should switch to write tab with "Edit story" label
    expect(screen.getByText(/Edit story/i)).toBeInTheDocument();

    // Open publish panel to trigger update
    const updateStoryBtns = screen.getAllByRole("button", {
      name: /Update story/i,
    });
    // The first one is in the topbar
    fireEvent.click(updateStoryBtns[0]);

    await waitFor(() => {
      expect(screen.getByText(/Story Preview/i)).toBeInTheDocument();
    });

    const updateNowBtns = screen.getAllByRole("button", {
      name: /Update story/i,
    });
    // The second one is in the publish panel (confirm)
    fireEvent.click(updateNowBtns[1]);

    await waitFor(() => {
      expect(apiClient.updateBlog).toHaveBeenCalledWith(
        "test-blog-1",
        expect.any(Object),
        "token"
      );
    });
  });

  it("handles delete flow from manage tab", async () => {
    jest.spyOn(apiClient, "deleteBlog").mockResolvedValue({ success: true });
    jest.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    // Switch to Stories tab
    const manageTab = screen.getByText("Stories");
    fireEvent.click(manageTab);

    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
    });

    // Click delete
    const deleteBtns = screen.getAllByText("Delete");
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

    // "Sign out" is the new logout button text
    const logoutBtn = screen.getByRole("button", { name: /Sign out/i });
    fireEvent.click(logoutBtn);

    expect(clearSessionSpy).toHaveBeenCalled();
    expect(testHistory.location.pathname).toBe("/login");
  });
});
