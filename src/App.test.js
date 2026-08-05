import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { render, act } from "@testing-library/react";

describe("App Theme Management", () => {
  let mockMatchMedia;
  let listeners = {};

  beforeEach(() => {
    // Clear mocks and localStorage
    jest.clearAllMocks();
    localStorage.clear();
    listeners = {};

    // Mock matchMedia
    mockMatchMedia = jest.fn((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: mockMatchMedia,
    });
  });

  it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  it("handles system preference change event when mode is system", () => {
    const { getByRole } = render(<App />);

    // Default mode is system. When system preference changes to dark, App should update theme.
    act(() => {
      // Simulate OS switching to dark mode
      window.matchMedia = jest.fn((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      if (listeners["change"]) {
        listeners["change"]();
      }
    });
  });

  it("handles explicit theme change and saves to localStorage", () => {
    // We can test this by rendering the App, which includes ThemeSwitcher,
    // but since we just need the App's internal method behavior,
    // we can use a ref or simply simulate the actual user interaction
    // wait, we can't easily access the instance, so let's check localStorage side effect
    // To do this properly without `new App()`, let's just test the interaction
    // Or we can mock the localStorage check:
    const { getByRole } = render(<App />);

    // Simulate OS switching to dark mode
    act(() => {
      window.matchMedia = jest.fn((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));
      if (listeners["change"]) {
        listeners["change"]();
      }
    });

    // Check if the localStorage gets updated if we had a direct theme change.
    // Instead of instantiating App directly, we can just render the component
    // and click the dark theme button inside the ThemeSwitcher
    // However, App renders Main which renders Header which renders ThemeSwitcher.
    // Let's grab the button by its accessible role/label
    const darkButton = getByRole("radio", { name: "Dark theme" });
    act(() => {
      darkButton.click();
    });

    expect(localStorage.getItem("amrit-theme-preference")).toBe("dark");
  });
});
