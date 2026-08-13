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
