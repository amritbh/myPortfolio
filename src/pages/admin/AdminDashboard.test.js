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

describe("AdminDashboard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    jest.spyOn(apiClient, "getStoredToken").mockReturnValue("token");
    jest
      .spyOn(apiClient, "getStoredUser")
      .mockReturnValue({ role: "admin", username: "adminuser" });
    jest.spyOn(apiClient, "createBlog").mockResolvedValue({ success: true });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Route
          render={(props) => <AdminDashboard theme={mockTheme} {...props} />}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Write a New Post/i)).toBeInTheDocument();
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

  it("handles logout", () => {
    jest.spyOn(apiClient, "getStoredToken").mockReturnValue("token");
    jest.spyOn(apiClient, "getStoredUser").mockReturnValue({ role: "admin" });
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
