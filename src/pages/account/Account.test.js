import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Account from "./Account";
import { BrowserRouter } from "react-router-dom";
import * as apiClient from "../../utils/apiClient";

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

describe("Account Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays profile information", async () => {
    jest.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
      success: true,
      profile: {
        address: "123 Main St",
        phone_number: "555-1234",
        mfa_enabled: true,
      },
    });

    renderWithRouter(<Account theme={mockTheme} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("555-1234")).toBeInTheDocument();
    expect(screen.getByText("2FA Enabled")).toBeInTheDocument();
  });

  it("saves profile changes", async () => {
    jest.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
      success: true,
      profile: { address: "", phone_number: "", mfa_enabled: false },
    });
    const updateSpy = jest
      .spyOn(apiClient, "updateAccountProfile")
      .mockResolvedValue({
        success: true,
      });

    renderWithRouter(<Account theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    const addressInput = screen.getByPlaceholderText("Enter your address");
    fireEvent.change(addressInput, { target: { value: "New Address" } });

    const saveButton = screen.getByText("Save Changes");
    fireEvent.click(saveButton);

    expect(updateSpy).toHaveBeenCalledWith("New Address", "");

    await waitFor(() => {
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });
  });
});
