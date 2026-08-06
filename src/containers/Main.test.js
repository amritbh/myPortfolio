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

jest.mock("../pages/home/HomeComponent", () => () => (
  <div data-testid="home-page">Home</div>
));
jest.mock("../pages/splash/Splash", () => () => (
  <div data-testid="splash-page">Splash</div>
));
jest.mock("../pages/login/Login", () => () => (
  <div data-testid="login-page">Login</div>
));
jest.mock("../pages/account/Account", () => () => (
  <div data-testid="account-page">Account</div>
));
jest.mock("../pages/admin/AdminDashboard", () => () => (
  <div data-testid="admin-page">Admin</div>
));
jest.mock("../pages/errors/error404/Error", () => () => (
  <div data-testid="error-page">Error404</div>
));
jest.mock("../pages/education/EducationComponent", () => () => (
  <div data-testid="education-page">Education</div>
));
jest.mock("../pages/experience/Experience", () => () => (
  <div data-testid="experience-page">Experience</div>
));
jest.mock("../pages/contact/ContactComponent", () => () => (
  <div data-testid="contact-page">Contact</div>
));
jest.mock("../pages/blog/BlogList", () => () => (
  <div data-testid="bloglist-page">BlogList</div>
));
jest.mock("../pages/blog/BlogDetail", () => () => (
  <div data-testid="blogdetail-page">BlogDetail</div>
));
jest.mock("../pages/projects/Projects", () => () => (
  <div data-testid="projects-page">Projects</div>
));
jest.mock("../pages/travel/TravelPage", () => () => (
  <div data-testid="travel-page">Travel</div>
));

describe("Main Component Routing", () => {
  let originalLocation;

  beforeEach(() => {
    originalLocation = window.location;
    delete window.location;
  });

  afterEach(() => {
    window.location = originalLocation;
    jest.clearAllMocks();
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
