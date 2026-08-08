// @ts-nocheck
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
    vi.clearAllMocks();
  });

  it("loads and displays profile information", async () => {
    vi.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
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
    vi.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
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

    expect(updateSpy).toHaveBeenCalledWith("", "New Address", "");

    await waitFor(() => {
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });
  });

  it("handles API error on profile load", async () => {
    vi.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
      success: false,
      error: "Failed to load profile",
    });

    renderWithRouter(<Account theme={mockTheme} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load profile")).toBeInTheDocument();
    });
  });

  it("handles API error on profile update", async () => {
    vi.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
      success: true,
      profile: {
        address: "123 Main St",
        phone_number: "555-1234",
        mfa_enabled: false,
      },
    });

    vi.spyOn(apiClient, "updateAccountProfile").mockResolvedValue({
      success: false,
      error: "Failed to update profile",
    });

    renderWithRouter(<Account theme={mockTheme} />);
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(screen.getByText("Failed to update profile")).toBeInTheDocument();
    });
  });

  it("handles 2FA setup flow", async () => {
    vi.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
      success: true,
      profile: { address: "", phone_number: "", mfa_enabled: false },
    });

    vi.spyOn(apiClient, "setup2FA").mockResolvedValue({
      success: true,
      uri: "otpauth://totp/...",
    });

    vi.spyOn(apiClient, "verify2FA").mockResolvedValue({
      success: true,
    });

    renderWithRouter(<Account theme={mockTheme} />);
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Enable 2FA"));

    await waitFor(() => {
      expect(screen.getByText("Setup 2FA")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("000000"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("Verify & Enable"));

    await waitFor(() => {
      expect(screen.getByText("2FA enabled successfully!")).toBeInTheDocument();
      expect(screen.getByText("2FA Enabled")).toBeInTheDocument();
    });
  });

  it("handles account deletion flow", async () => {
    vi.spyOn(apiClient, "fetchAccountProfile").mockResolvedValue({
      success: true,
      profile: { address: "", phone_number: "", mfa_enabled: false },
    });

    vi.spyOn(apiClient, "deleteAccount").mockResolvedValue({
      success: true,
    });

    window.confirm = vi.fn().mockImplementation(() => true);

    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    renderWithRouter(<Account theme={mockTheme} />);
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Delete Account"));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(apiClient.deleteAccount).toHaveBeenCalled();
      expect(window.location.href).toBe("/");
    });

    window.location = originalLocation;
  });
});
