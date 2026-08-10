import React, { useState } from "react";
import "./Header.css";
import { Fade } from "react-reveal";
import { NavLink, Link } from "react-router-dom";
import { greeting, settings } from "../../portfolio";
import SeoHeader from "../seoHeader/SeoHeader";
import ThemeSwitcher from "../themeSwitcher/ThemeSwitcher";
import {
  getStoredUser,
  clearSession,
  requestPasswordReset,
} from "../../utils/apiClient";
import type { Theme, ThemeMode } from "../../types";

const onMouseEnter = (event: React.MouseEvent<HTMLElement>, color: string) => {
  const el = event.currentTarget;
  el.style.backgroundColor = color;
};

const onMouseOut = (event: React.MouseEvent<HTMLElement>) => {
  const el = event.currentTarget;
  el.style.backgroundColor = "transparent";
};

interface HeaderProps {
  theme: Theme;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  themeMode,
  onThemeChange,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    const user = getStoredUser();
    clearSession();

    if (user?.type === "cognito") {
      const domain =
        import.meta.env.VITE_COGNITO_DOMAIN ||
        "amrit-portfolio-auth-prod.auth.us-east-1.amazoncognito.com";
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
      const logoutUri = window.location.origin + "/";
      window.location.href = `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutUri
      )}`;
    } else {
      window.location.href = "/home";
    }
  };

  const handleChangePassword = async () => {
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

  const user = getStoredUser();
  const link = settings.isSplash ? "/splash" : "home";

  return (
    <div style={{ position: "relative", zIndex: 999 }}>
      <Fade top duration={1000} distance="20px">
        <SeoHeader />
        <div>
          <header className="header">
            {/* @ts-ignore */}
            <NavLink to={link} className="logo">
              <span style={{ color: theme.text }}> &lt;</span>
              <span className="logo-name" style={{ color: theme.text }}>
                {greeting.logo_name}
              </span>
              <span style={{ color: theme.text }}>/&gt;</span>
            </NavLink>
            <input className="menu-btn" type="checkbox" id="menu-btn" />
            <label className="menu-icon" htmlFor="menu-btn">
              <span className="navicon"></span>
              <span style={{ position: "absolute", width: "1px", height: "1px", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)" }}>Menu</span>
            </label>
            <ul className="menu" style={{ backgroundColor: theme.body }}>
              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/home"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/education"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Education
                </NavLink>
              </li>
              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/experience"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Experience
                </NavLink>
              </li>
              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/projects"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Projects
                </NavLink>
              </li>

              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/blogs"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Blog
                </NavLink>
              </li>
              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/travel"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Travel
                </NavLink>
              </li>
              <li>
                {/* @ts-ignore */}
                <NavLink
                  to="/contact"
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event: any) =>
                    onMouseEnter(event, theme.highlight)
                  }
                  onMouseOut={(event: any) => onMouseOut(event)}
                >
                  Contact Me
                </NavLink>
              </li>
              <li>
                {user ? (
                  <div
                    className="account-dropdown-container"
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
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
                    {showDropdown && (
                      <div 
                        className="account-dropdown-menu"
                        style={{
                          '--dropdown-bg': `${theme.body}e6`, /* 90% opacity for glassmorphism */
                          '--dropdown-border': `${theme.text}20`,
                          '--dropdown-shadow': theme.name === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.1)',
                          '--dropdown-hover': `${theme.text}10`,
                        } as React.CSSProperties}
                      >
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
                            {user.name?.trim()
                              ? user.name
                              : user.username || user.email || "User"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.85em",
                              color: theme.secondaryText,
                            }}
                          >
                            {user.email?.trim()
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
                          onClick={() => setShowDropdown(false)}
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
                          onClick={handleChangePassword}
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
                          onClick={handleLogout}
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
                  /* @ts-ignore */
                  <NavLink
                    to="/login"
                    activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                    style={{ color: theme.text }}
                    onMouseEnter={(event: any) =>
                      onMouseEnter(event, theme.highlight)
                    }
                    onMouseOut={(event: any) => onMouseOut(event)}
                    onClick={() => {
                      if (!['/', '/home', '/login'].includes(window.location.pathname)) {
                        localStorage.setItem('redirect_after_login', window.location.pathname + window.location.hash);
                      }
                    }}
                  >
                    Login
                  </NavLink>
                )}
              </li>
              <li className="theme-switcher-nav-item">
                <ThemeSwitcher
                  themeMode={themeMode || "system"}
                  onThemeChange={onThemeChange || (() => {})}
                  theme={theme}
                />
              </li>
            </ul>
          </header>
        </div>
      </Fade>
    </div>
  );
};

export default Header;
