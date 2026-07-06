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
};

const mockBlogs = [
  { slug: "test-blog-1", title: "Test Blog 1", summary: "Summary 1" },
  { slug: "test-blog-2", title: "Test Blog 2", summary: "Summary 2" },
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

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

    // Form interaction
    const titleInput = screen.getAllByRole("textbox")[0];
    fireEvent.change(titleInput, {
      target: { name: "title", value: "My New Blog" },
    });

    const publishBtn = screen.getByRole("button", {
      name: /Publish to DynamoDB/i,
    });
    fireEvent.click(publishBtn);

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

    // Switch to manage tab
    const manageTab = screen.getByText("Manage Posts");
    fireEvent.click(manageTab);

    // Wait for blogs to load
    await waitFor(() => {
      expect(screen.getByText("Test Blog 1")).toBeInTheDocument();
    });

    // Click edit on the first blog
    const editBtns = screen.getAllByText("Edit");
    fireEvent.click(editBtns[0]);

    // Should switch to write tab and populate form
    expect(screen.getByText("Edit Post")).toBeInTheDocument();

    const titleInputs = screen.getAllByRole("textbox");
    // Title is the first input
    expect(titleInputs[0].value).toBe("Test Blog 1");

    // Click update
    const updateBtn = screen.getByRole("button", { name: /Update Post/i });
    fireEvent.click(updateBtn);

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

    // Switch to manage tab
    const manageTab = screen.getByText("Manage Posts");
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

    const logoutBtns = screen.getAllByRole("button", { name: /Logout/i });
    logoutBtns[1].click();

    expect(clearSessionSpy).toHaveBeenCalled();
    expect(testHistory.location.pathname).toBe("/login");
  });
});
