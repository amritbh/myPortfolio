import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ThemeSwitcher from "./ThemeSwitcher";
import { lightTheme } from "../../theme";

const mockOnThemeChange = vi.fn();

const defaultProps = {
  themeMode: "system",
  onThemeChange: mockOnThemeChange,
  theme: lightTheme,
};

// Mock matchMedia for tests
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-color-scheme: dark)" ? false : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

beforeEach(() => {
  mockOnThemeChange.mockClear();
});

describe("ThemeSwitcher", () => {
  describe("Desktop pill (all 3 segments)", () => {
    it("renders all three mode buttons", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      expect(screen.getByLabelText("Light theme")).toBeInTheDocument();
      expect(screen.getByLabelText("System theme")).toBeInTheDocument();
      expect(screen.getByLabelText("Dark theme")).toBeInTheDocument();
    });

    it("marks the active mode button as aria-checked", () => {
      render(<ThemeSwitcher {...defaultProps} themeMode="dark" />);
      expect(screen.getByLabelText("Dark theme")).toHaveAttribute(
        "aria-checked",
        "true"
      );
      expect(screen.getByLabelText("Light theme")).toHaveAttribute(
        "aria-checked",
        "false"
      );
    });

    it("calls onThemeChange with 'light' when Light button is clicked", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Light theme"));
      expect(mockOnThemeChange).toHaveBeenCalledWith("light");
    });

    it("calls onThemeChange with 'dark' when Dark button is clicked", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      fireEvent.click(screen.getByLabelText("Dark theme"));
      expect(mockOnThemeChange).toHaveBeenCalledWith("dark");
    });

    it("calls onThemeChange with 'system' when System button is clicked", () => {
      render(<ThemeSwitcher {...defaultProps} themeMode="light" />);
      fireEvent.click(screen.getByLabelText("System theme"));
      expect(mockOnThemeChange).toHaveBeenCalledWith("system");
    });

    it("supports keyboard activation with Enter key", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      const darkBtn = screen.getByLabelText("Dark theme");
      fireEvent.keyDown(darkBtn, { key: "Enter" });
      expect(mockOnThemeChange).toHaveBeenCalledWith("dark");
    });

    it("supports keyboard activation with Space key", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      const lightBtn = screen.getByLabelText("Light theme");
      fireEvent.keyDown(lightBtn, { key: " " });
      expect(mockOnThemeChange).toHaveBeenCalledWith("light");
    });

    it("has correct radiogroup ARIA role", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });
  });

  describe("Mobile toggle button", () => {
    it("renders the mobile toggle button", () => {
      render(<ThemeSwitcher {...defaultProps} />);
      expect(
        screen.getByLabelText(/Current theme: system/i)
      ).toBeInTheDocument();
    });

    it("cycles to the next mode when mobile toggle is clicked", () => {
      // system (index 1) -> dark (index 2)
      render(<ThemeSwitcher {...defaultProps} themeMode="system" />);
      const mobileToggle = screen.getByLabelText(/Current theme: system/i);
      fireEvent.click(mobileToggle);
      expect(mockOnThemeChange).toHaveBeenCalledWith("dark");
    });

    it("wraps around from dark back to light", () => {
      // dark (index 2) -> light (index 0)
      render(<ThemeSwitcher {...defaultProps} themeMode="dark" />);
      const mobileToggle = screen.getByLabelText(/Current theme: dark/i);
      fireEvent.click(mobileToggle);
      expect(mockOnThemeChange).toHaveBeenCalledWith("light");
    });
  });
});
