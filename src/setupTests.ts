import "@testing-library/jest-dom";
import "mutationobserver-shim";
import { vi } from "vitest";

(globalThis as any).jest = vi;

vi.mock("marked", () => ({
  marked: vi.fn((text: string) => `<p>${text}</p>`),
}));

const MockIntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
window.IntersectionObserver = MockIntersectionObserver as any;

const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem: function (key: string) {
      return store[key] || null;
    },
    setItem: function (key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem: function (key: string) {
      delete store[key];
    },
    clear: function () {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
