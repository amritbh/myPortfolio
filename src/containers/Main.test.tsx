// @ts-nocheck
import React from "react";
import { render, screen } from "@testing-library/react";
import Main from "./Main";

const mockTheme = {
  body: "#ffffff",
  text: "#000000",
  secondaryText: "#888888",
  imageHighlight: "#f5f5f5",
  highlight: "#a066fb",
};

vi.mock("../pages/home/HomeComponent", () => ({
  default: () => <div data-testid="home-page">Home</div>,
}));
vi.mock("../pages/splash/Splash", () => ({
  default: () => <div data-testid="splash-page">Splash</div>,
}));
vi.mock("../pages/login/Login", () => ({
  default: () => <div data-testid="login-page">Login</div>,
}));
vi.mock("../pages/account/Account", () => ({
  default: () => <div data-testid="account-page">Account</div>,
}));
vi.mock("../pages/admin/AdminDashboard", () => ({
  default: () => <div data-testid="admin-page">Admin</div>,
}));
vi.mock("../pages/errors/error404/Error", () => ({
  default: () => <div data-testid="error-page">Error404</div>,
}));
vi.mock("../pages/education/EducationComponent", () => ({
  default: () => <div data-testid="education-page">Education</div>,
}));
vi.mock("../pages/experience/Experience", () => ({
  default: () => <div data-testid="experience-page">Experience</div>,
}));
vi.mock("../pages/contact/ContactComponent", () => ({
  default: () => <div data-testid="contact-page">Contact</div>,
}));
vi.mock("../pages/blog/BlogList", () => ({
  default: () => <div data-testid="bloglist-page">BlogList</div>,
}));
vi.mock("../pages/blog/BlogDetail", () => ({
  default: () => <div data-testid="blogdetail-page">BlogDetail</div>,
}));
vi.mock("../pages/projects/Projects", () => ({
  default: () => <div data-testid="projects-page">Projects</div>,
}));
vi.mock("../pages/travel/TravelPage", () => ({
  default: () => <div data-testid="travel-page">Travel</div>,
}));

describe("Main Component Routing", () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
    vi.clearAllMocks();
  });

  const renderWithPath = (path) => {
    window.location = { ...originalLocation, pathname: path };
    return render(<Main theme={mockTheme} />);
  };

  const routes = [
    { path: "/", id: "home-page" },
    { path: "/home", id: "home-page" },
    { path: "/experience", id: "experience-page" },
    { path: "/education", id: "education-page" },
    { path: "/login", id: "login-page" },
    { path: "/account", id: "account-page" },
    { path: "/admin", id: "admin-page" },
    { path: "/blogs", id: "bloglist-page" },
    { path: "/blogs/some-slug", id: "blogdetail-page" },
    { path: "/contact", id: "contact-page" },
    { path: "/projects", id: "projects-page" },
    { path: "/travel", id: "travel-page" },
    { path: "/unknown-route", id: "error-page" },
    { path: "/splash", id: "error-page" }, // settings.isSplash is false by default
  ];

  routes.forEach((route) => {
    it(`renders correct page on ${route.path} route`, () => {
      renderWithPath(route.path);
      expect(screen.getByTestId(route.id)).toBeInTheDocument();
    });
  });
});
