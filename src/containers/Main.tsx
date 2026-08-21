import React, { Suspense, lazy } from "react";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import Home from "../pages/home/HomeComponent";
import Splash from "../pages/splash/Splash";
import Education from "../pages/education/EducationComponent";
import Experience from "../pages/experience/Experience";
import Contact from "../pages/contact/ContactComponent";
import BlogList from "../pages/blog/BlogList";
import BlogDetail from "../pages/blog/BlogDetail";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Login from "../pages/login/Login";
import Projects from "../pages/projects/Projects";
import { settings } from "../portfolio";
import Error404 from "../pages/errors/error404/Error";
import Account from "../pages/account/Account";
import TravelPage from "../pages/travel/TravelPage";
import type { Theme, ThemeMode } from "../types";

// Code-split: only loaded when user navigates to a destination detail page
const DestinationDetail = lazy(
  () => import("../pages/travel/DestinationDetail")
);

interface MainProps {
  theme: Theme;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
}

const Main: React.FC<MainProps> = ({ theme, themeMode, onThemeChange }) => {
  return (
    <BrowserRouter basename="/">
      <Switch>
        <Route
          path="/"
          exact
          render={(props: any) =>
            settings.isSplash ? (
              <Splash {...props} theme={theme} />
            ) : (
              <Home
                {...props}
                theme={theme}
                themeMode={themeMode}
                onThemeChange={onThemeChange}
              />
            )
          }
        />
        <Route
          path="/home"
          render={(props: any) => (
            <Home
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="/experience"
          exact
          render={(props: any) => (
            <Experience
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="/education"
          render={(props: any) => (
            <Education
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />

        <Route
          path="/login"
          exact
          render={(props: any) => (
            <Login
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="/account"
          exact
          render={(props: any) => (
            <Account
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />

        <Route
          path="/admin"
          exact
          render={(props: any) => (
            <AdminDashboard
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />

        <Route
          path="/blogs"
          exact
          render={(props: any) => (
            <BlogList
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="/blogs/:slug"
          render={(props: any) => (
            <BlogDetail
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="/contact"
          render={(props: any) => (
            <Contact
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />

        {settings.isSplash && (
          <Route
            path="/splash"
            render={(props: any) => (
              <Splash
                {...props}
                theme={theme}
                themeMode={themeMode}
                onThemeChange={onThemeChange}
              />
            )}
          />
        )}

        {/* Destination detail — must come BEFORE /travel to match first */}
        <Route
          path="/travel/:countryId/:destinationId"
          render={(props: any) => (
            <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
              <DestinationDetail
                {...props}
                theme={theme}
                themeMode={themeMode}
                onThemeChange={onThemeChange}
              />
            </Suspense>
          )}
        />
        <Route
          path="/travel"
          render={(props: any) => (
            <TravelPage
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="/projects"
          render={(props: any) => (
            <Projects
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
        <Route
          path="*"
          render={(props: any) => (
            <Error404
              {...props}
              theme={theme}
              themeMode={themeMode}
              onThemeChange={onThemeChange}
            />
          )}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default Main;
