import React, { Component } from "react";
import "./Header.css";
import { Fade } from "react-reveal";
import { NavLink, Link } from "react-router-dom";
import { greeting, settings } from "../../portfolio.js";
import SeoHeader from "../seoHeader/SeoHeader";
import {
  getStoredUser,
  clearSession,
  requestPasswordReset,
  setup2FA,
  verify2FA,
} from "../../utils/apiClient";
import { QRCodeSVG } from "qrcode.react";

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

  handleSetup2FA = async () => {
    this.setState({ isSettingUp: true, totpError: "" });
    const res = await setup2FA();
    if (res.success) {
      this.setState({
        show2FAModal: true,
        totpUri: res.uri,
        isSettingUp: false,
      });
    } else {
      alert("Failed to setup 2FA: " + res.error);
      this.setState({ isSettingUp: false });
    }
  };

  handleVerify2FA = async () => {
    this.setState({ isSettingUp: true, totpError: "" });
    const res = await verify2FA(this.state.totpCode);
    if (res.success) {
      alert("2-Step Verification enabled successfully!");
      this.setState({
        show2FAModal: false,
        totpUri: "",
        totpCode: "",
        isSettingUp: false,
      });
    } else {
      this.setState({
        totpError: res.error || "Invalid 2FA code",
        isSettingUp: false,
      });
    }
  };

  render() {
    const user = getStoredUser();
    const theme = this.props.theme;
    const link = settings.isSplash ? "/splash" : "home";
    return (
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
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
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
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
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
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
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
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                  onMouseOut={(event) => onMouseOut(event)}
                >
                  Projects
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/opensource"
                  tag={Link}
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                  onMouseOut={(event) => onMouseOut(event)}
                >
                  Open Source
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/blogs"
                  tag={Link}
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
                  onMouseOut={(event) => onMouseOut(event)}
                >
                  Blog
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  tag={Link}
                  activeStyle={{ WebkitTextStroke: "0.5px currentColor" }}
                  style={{ color: theme.text }}
                  onMouseEnter={(event) => onMouseEnter(event, theme.highlight)}
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
                    onMouseLeave={() => this.setState({ showDropdown: false })}
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
                      <div
                        className="account-dropdown-menu"
                        style={{
                          backgroundColor: theme.body,
                          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                          borderRadius: "8px",
                          overflow: "hidden",
                          minWidth: "180px",
                          zIndex: 10,
                          display: "flex",
                          flexDirection: "column",
                          border: `1px solid ${theme.text}33`,
                        }}
                      >
                        <button
                          onClick={this.handleSetup2FA}
                          disabled={this.state.isSettingUp}
                          style={{
                            color: theme.text,
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "0.95em",
                            padding: "15px 20px",
                            textAlign: "left",
                            width: "100%",
                          }}
                          onMouseEnter={(event) => {
                            event.target.style.backgroundColor =
                              theme.highlight;
                          }}
                          onMouseOut={(event) => {
                            event.target.style.backgroundColor = "transparent";
                          }}
                        >
                          Enable 2FA
                        </button>
                        <button
                          onClick={this.handleChangePassword}
                          style={{
                            color: theme.text,
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "0.95em",
                            padding: "15px 20px",
                            textAlign: "left",
                            width: "100%",
                          }}
                          onMouseEnter={(event) => {
                            event.target.style.backgroundColor =
                              theme.highlight;
                          }}
                          onMouseOut={(event) => {
                            event.target.style.backgroundColor = "transparent";
                          }}
                        >
                          Change Password
                        </button>
                        <button
                          onClick={this.handleLogout}
                          style={{
                            color: theme.text,
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: "0.95em",
                            padding: "15px 20px",
                            textAlign: "left",
                            width: "100%",
                          }}
                          onMouseEnter={(event) => {
                            event.target.style.backgroundColor =
                              theme.highlight;
                          }}
                          onMouseOut={(event) => {
                            event.target.style.backgroundColor = "transparent";
                          }}
                        >
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
            </ul>
          </header>

          {this.state.show2FAModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
              }}
            >
              <div
                style={{
                  backgroundColor: theme.body,
                  padding: "30px",
                  borderRadius: "8px",
                  maxWidth: "400px",
                  width: "90%",
                  textAlign: "center",
                  color: theme.text,
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Setup 2-Step Verification</h3>
                <p style={{ fontSize: "14px", marginBottom: "20px" }}>
                  Scan this QR code with your Authenticator app (like Google
                  Authenticator or Authy), then enter the 6-digit code below.
                </p>
                <div
                  style={{
                    background: "white",
                    padding: "10px",
                    display: "inline-block",
                    borderRadius: "4px",
                    marginBottom: "20px",
                  }}
                >
                  <QRCodeSVG value={this.state.totpUri} size={150} />
                </div>

                {this.state.totpError && (
                  <p style={{ color: "red", fontSize: "13px" }}>
                    {this.state.totpError}
                  </p>
                )}

                <input
                  type="text"
                  placeholder="6-digit code"
                  value={this.state.totpCode}
                  onChange={(e) => this.setState({ totpCode: e.target.value })}
                  maxLength={6}
                  style={{
                    padding: "10px",
                    width: "100%",
                    marginBottom: "15px",
                    border: `1px solid ${theme.text}`,
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    color: theme.text,
                    textAlign: "center",
                    fontSize: "18px",
                    letterSpacing: "2px",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() =>
                      this.setState({
                        show2FAModal: false,
                        totpError: "",
                        totpCode: "",
                      })
                    }
                    style={{
                      padding: "8px 16px",
                      background: "transparent",
                      border: `1px solid ${theme.text}`,
                      color: theme.text,
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={this.handleVerify2FA}
                    disabled={
                      this.state.isSettingUp || this.state.totpCode.length < 6
                    }
                    style={{
                      padding: "8px 16px",
                      background: theme.text,
                      border: "none",
                      color: theme.body,
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {this.state.isSettingUp
                      ? "Verifying..."
                      : "Verify & Enable"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Fade>
    );
  }
}
export default Header;
