import "@testing-library/jest-dom";
import "mutationobserver-shim";

jest.mock("marked", () => ({
  marked: jest.fn((text) => `<p>${text}</p>`),
}));
