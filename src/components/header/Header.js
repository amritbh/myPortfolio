import React, { Component } from "react";
import "./Header.css";
import { Fade } from "react-reveal";
import { NavLink, Link } from "react-router-dom";
import { greeting, settings } from "../../portfolio.js";
import SeoHeader from "../seoHeader/SeoHeader";
import ThemeSwitcher from "../themeSwitcher/ThemeSwitcher";
import {
  getStoredUser,
  clearSession,
  requestPasswordReset,
} from "../../utils/apiClient";

const onMouseEnter = (event, color) => {
  const el = event.target;
  el.style.backgroundColor = color;
};

const onMouseOut = (event) => {
  const el = event.target;
  el.style.backgroundColor = "transparent";
};

class Header extends Component {
  state = {
    show2FAModal: false,
    totpUri: "",
    totpCode: "",
    totpError: "",
    isSettingUp: false,
    showDropdown: false,
  };

  handleLogout = () => {
    const user = getStoredUser();
    clearSession();

    if (user && user.type === "cognito") {
      const domain =
        process.env.REACT_APP_COGNITO_DOMAIN ||
        "amrit-portfolio-auth-prod.auth.us-east-1.amazoncognito.com";
      const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID;
      const logoutUri = window.location.origin + "/";
      window.location.href = `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutUri
      )}`;
    } else {
      window.location.href = "/home";
    }
  };

  handleChangePassword = async () => {
    const user = getStoredUser();
    if (user && (user.email || user.username)) {
      const email = user.email || user.username;
      const response = await requestPasswordReset(email);
      if (response.success) {
        alert(
          "A password reset link has been sent to your email. Please check your inbox."
        );
      } else {
        alert(
          "Failed to send password reset link: " +
            (response.error || "Unknown error")
        );
      }
    } else {
      alert(
        "Unable to find your email address. Please log out and use the Forgot Password link."
      );
    }
  };

  render() {
    const user = getStoredUser();
    const theme = this.props.theme;
    const link = settings.isSplash ? "/splash" : "home";
    return (
      <div style={{ position: "relative", zIndex: 999 }}>
        <Fade top duration={1000} distance="20px">
          <SeoHeader />
          <div>
            <header className="header">
              <NavLink to={link} tag={Link} className="logo">
                <span style={{ color: theme.text }}> &lt;</span>
                <span className="logo-name" style={{ color: theme.text }}>
                  {greeting.logo_name}
                </span>
                <span style={{ color: theme.text }}>/&gt;</span>
              </NavLink>
              <input className="menu-btn" type="checkbox" id="menu-btn" />
              <label className="menu-icon" htmlFor="menu-btn">
                <span className="navicon"></span>
              </label>
              <ul className="menu" style={{ backgroundColor: theme.body }}>
                <li>
                  <NavLink
                    to="/home"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/education"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Education
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/experience"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Experience
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/projects"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Projects
                  </NavLink>
                </li>

                <li>
                  <NavLink
                    to="/blogs"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Blog
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/travel"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Travel
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/contact"
                    tag={Link}
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event) => onMouseOut(event)}
                  >
                    Contact Me
                  </NavLink>
                </li>
                <li>
                  {user ? (
                    <div
                      className="account-dropdown-container"
                      onMouseEnter={() => this.setState({ showDropdown: true })}
                      onMouseLeave={() =>
                        this.setState({ showDropdown: false })
                      }
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <span
                        style={{
                          color: theme.text,
                          cursor: "pointer",
                          padding: "20px 10px",
                          display: "inline-block",
                          fontWeight: "bold",
                        }}
                        className="account-dropdown-toggle"
                      >
                        Account &#9662;
                      </span>
                      {this.state.showDropdown && (
                        <div className="account-dropdown-menu">
                          <div
                            style={{
                              padding: "10px 20px",
                              borderBottom: `1px solid ${theme.text}33`,
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{ fontWeight: "bold", color: theme.text }}
                            >
                              {user.name && user.name.trim()
                                ? user.name
                                : user.username || user.email || "User"}
                            </div>
                            <div
                              style={{
                                fontSize: "0.85em",
                                color: theme.secondaryText,
                              }}
                            >
                              {user.email && user.email.trim()
                                ? user.email
                                : user.username || "Unknown Email"}
                            </div>
                          </div>
                          <Link
                            to="/account"
                            className="account-dropdown-item"
                            style={{
                              color: theme.text,
                              textDecoration: "none",
                            }}
                            onClick={() =>
                              this.setState({ showDropdown: false })
                            }
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            Manage Account
                          </Link>
                          <button
                            type="button"
                            onClick={this.handleChangePassword}
                            className="account-dropdown-item"
                            style={{ color: theme.text }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                                ry="2"
                              ></rect>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Change Password
                          </button>
                          <div className="account-dropdown-divider" />
                          <button
                            type="button"
                            onClick={this.handleLogout}
                            className="account-dropdown-item"
                            style={{ color: "#d9534f" }}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Logout
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to="/login"
                      tag={Link}
                      activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                      style={{ color: theme.text }}
                      onMouseEnter={(event) =>
                        onMouseEnter(event, theme.highlight)
                      }
                      onMouseOut={(event) => onMouseOut(event)}
                    >
                      Login
                    </NavLink>
                  )}
                </li>
                <li className="theme-switcher-nav-item">
                  <ThemeSwitcher
                    themeMode={this.props.themeMode || "system"}
                    onThemeChange={this.props.onThemeChange || (() => {})}
                    theme={theme}
                  />
                </li>
              </ul>
            </header>
          </div>
        </Fade>
      </div>
    );
  }
}
export default Header;
