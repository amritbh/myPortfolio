import React, { Component } from "react";
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
import { settings } from "../portfolio.js";
import Error404 from "../pages/errors/error404/Error";
import Account from "../pages/account/Account";
import TravelPage from "../pages/travel/TravelPage";

export default class Main extends Component {
  render() {
    return (
      <BrowserRouter basename="/">
        <Switch>
          <Route
            path="/"
            exact
            render={(props) =>
              settings.isSplash ? (
                <Splash {...props} theme={this.props.theme} />
              ) : (
                <Home
                  {...props}
                  theme={this.props.theme}
                  themeMode={this.props.themeMode}
                  onThemeChange={this.props.onThemeChange}
                />
              )
            }
          />
          <Route
            path="/home"
            render={(props) => (
              <Home
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="/experience"
            exact
            render={(props) => (
              <Experience
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="/education"
            render={(props) => (
              <Education
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />

          <Route
            path="/login"
            exact
            render={(props) => (
              <Login
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="/account"
            exact
            render={(props) => (
              <Account
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />

          <Route
            path="/admin"
            exact
            render={(props) => (
              <AdminDashboard
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />

          <Route
            path="/blogs"
            exact
            render={(props) => (
              <BlogList
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="/blogs/:slug"
            render={(props) => (
              <BlogDetail
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="/contact"
            render={(props) => (
              <Contact
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />

          {settings.isSplash && (
            <Route
              path="/splash"
              render={(props) => (
                <Splash
                  {...props}
                  theme={this.props.theme}
                  themeMode={this.props.themeMode}
                  onThemeChange={this.props.onThemeChange}
                />
              )}
            />
          )}

          <Route
            path="/travel"
            render={(props) => (
              <TravelPage
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="/projects"
            render={(props) => (
              <Projects
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
          <Route
            path="*"
            render={(props) => (
              <Error404
                {...props}
                theme={this.props.theme}
                themeMode={this.props.themeMode}
                onThemeChange={this.props.onThemeChange}
              />
            )}
          />
        </Switch>
      </BrowserRouter>
    );
  }
}
