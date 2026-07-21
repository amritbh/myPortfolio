import React, { Component } from "react";
import {
  loginAdmin,
  signupAdmin,
  getStoredToken,
  getStoredUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  setSession,
} from "../../utils/apiClient";
import "./Login.css";

class Login extends Component {
  state = {
    authMode: "signin", // 'signin' | 'signup' | 'forgotPassword' | 'resetPassword'
    showEmailForm: false, // Toggles the email/password fields vs social buttons
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    isSubmitting: false,
    authError: "",
    verificationMessage: "",
    verificationStatus: "",
    resetToken: "",
    statusMessage: "",
  };

  componentDidMount() {
    this.handleUrlParams();
  }

  handleUrlParams = async () => {
    // Handle Cognito Hash
    const hashFragment = window.location.hash.substring(1);
    if (hashFragment) {
      const hashParams = new URLSearchParams(hashFragment);
      const idToken = hashParams.get("id_token");
      if (idToken) {
        try {
          const payload = JSON.parse(atob(idToken.split(".")[1]));
          const user = {
            username:
              payload.email || payload["cognito:username"] || payload.sub,
            type: "cognito",
            role: "user",
          };
          setSession(idToken, user);
          if (payload.email === "amrit.bhattarai990@gmail.com") {
            user.role = "admin";
            setSession(idToken, user);
            this.props.history.push("/admin");
          } else {
            this.props.history.push("/home");
          }
          return;
        } catch (e) {
          console.error("Failed to parse Cognito JWT", e);
          this.setState({
            authError: "Social login failed. Please try again.",
          });
        }
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get("verifyToken");
    const resetTokenParam = urlParams.get("resetToken");

    if (verifyToken) {
      this.setState({
        verificationStatus: "loading",
        verificationMessage: "Verifying your email...",
      });
      const res = await verifyEmail(verifyToken);
      this.setState({
        verificationStatus: res.success ? "success" : "error",
        verificationMessage: res.success
          ? "Email verified! You can now sign in."
          : res.error,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (resetTokenParam) {
      this.setState({ authMode: "resetPassword", resetToken: resetTokenParam });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      this.props.history.push(user.role === "admin" ? "/admin" : "/home");
    }
  };

  switchAuthMode = (mode) => {
    this.setState({
      authMode: mode,
      showEmailForm: false,
      authError: "",
      statusMessage: "",
      password: "",
      confirmPassword: "",
    });
  };

  handleAuthSubmit = async (e) => {
    e.preventDefault();
    const {
      authMode,
      username,
      email,
      password,
      confirmPassword,
      resetToken,
    } = this.state;

    if (authMode === "forgotPassword") {
      if (!email || !email.includes("@")) {
        this.setState({ authError: "Please enter a valid email address." });
        return;
      }
      this.setState({ isSubmitting: true, authError: "", statusMessage: "" });
      const response = await requestPasswordReset(email.trim());
      if (response.success) {
        this.setState({
          statusMessage: response.message,
          isSubmitting: false,
          email: "",
        });
      } else {
        this.setState({ authError: response.error, isSubmitting: false });
      }
      return;
    }

    if (authMode === "resetPassword") {
      if (!password || password.length < 6) {
        this.setState({ authError: "Password must be at least 6 characters." });
        return;
      }
      if (password !== confirmPassword) {
        this.setState({ authError: "Passwords do not match." });
        return;
      }
      this.setState({ isSubmitting: true, authError: "", statusMessage: "" });
      const response = await resetPassword(resetToken, password);
      if (response.success) {
        this.setState({
          authMode: "signin",
          statusMessage: "Password reset! Please sign in.",
          isSubmitting: false,
          password: "",
          confirmPassword: "",
        });
      } else {
        this.setState({ authError: response.error, isSubmitting: false });
      }
      return;
    }

    if (authMode === "signup" || authMode === "signin") {
      if (!email || !email.includes("@")) {
        this.setState({ authError: "Please enter a valid email address." });
        return;
      }
      if (!password || password.length < 6) {
        this.setState({ authError: "Password must be at least 6 characters." });
        return;
      }
    }

    if (authMode === "signup") {
      if (!username || username.trim().length < 3) {
        this.setState({ authError: "Username must be at least 3 characters." });
        return;
      }
      if (password !== confirmPassword) {
        this.setState({ authError: "Passwords do not match." });
        return;
      }
    }

    this.setState({ isSubmitting: true, authError: "", statusMessage: "" });

    let response;
    if (authMode === "signup") {
      response = await signupAdmin(username.trim(), email.trim(), password);
    } else {
      response = await loginAdmin(email.trim(), password);
    }

    if (response.success) {
      if (authMode === "signup") {
        this.setState({
          statusMessage: "Account created! Check your email to verify.",
          isSubmitting: false,
          authMode: "signin",
          showEmailForm: false,
          password: "",
          confirmPassword: "",
        });
      } else {
        this.props.history.push(
          response.user.role === "admin" ? "/admin" : "/home"
        );
      }
    } else {
      this.setState({
        authError: response.error || "Authentication failed.",
        isSubmitting: false,
      });
    }
  };

  handleGoogleLogin = () => {
    const domain =
      process.env.REACT_APP_COGNITO_DOMAIN ||
      "amrit-portfolio-auth-prod.auth.us-east-1.amazoncognito.com";
    const clientId =
      process.env.REACT_APP_COGNITO_CLIENT_ID || "63ct5e88sn10306cbh2rm5ur68";
    const redirectUri = window.location.origin + "/login";
    window.location.href = `https://${domain}/oauth2/authorize?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;
  };

  // ── Render Helpers ──

  renderGoogleButton(text) {
    return (
      <button
        type="button"
        className="medium-auth-btn-social"
        onClick={this.handleGoogleLogin}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {text}
      </button>
    );
  }

  renderBanners() {
    const {
      verificationMessage,
      verificationStatus,
      statusMessage,
      authError,
    } = this.state;
    return (
      <div className="medium-auth-banners">
        {verificationMessage && (
          <div
            className={`medium-auth-banner ${
              verificationStatus === "success"
                ? "success"
                : verificationStatus === "error"
                ? "error"
                : "info"
            }`}
          >
            {verificationMessage}
          </div>
        )}
        {statusMessage && (
          <div className="medium-auth-banner success">{statusMessage}</div>
        )}
        {authError && (
          <div className="medium-auth-banner error" role="alert">
            {authError}
          </div>
        )}
      </div>
    );
  }

  render() {
    const {
      authMode,
      showEmailForm,
      username,
      email,
      password,
      confirmPassword,
      isSubmitting,
    } = this.state;

    return (
      <div className="medium-auth-root">
        {/* Dimmed background overlay */}
        <div className="medium-auth-overlay" />

        {/* Modal Container */}
        <div className="medium-auth-modal">
          {/* Close / Back button (could link to home) */}
          <a href="/home" className="medium-auth-close-btn" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>

          <div className="medium-auth-content">
            {this.renderBanners()}

            {/* ── Sign In ── */}
            {authMode === "signin" && !showEmailForm && (
              <div className="medium-auth-panel">
                <h2 className="medium-auth-title">Welcome back.</h2>
                <div className="medium-auth-button-group">
                  {this.renderGoogleButton("Sign in with Google")}
                  <button
                    type="button"
                    className="medium-auth-btn-social"
                    onClick={() => this.setState({ showEmailForm: true })}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Sign in with email
                  </button>
                </div>
                <div className="medium-auth-footer">
                  No account?{" "}
                  <button
                    onClick={() => this.switchAuthMode("signup")}
                    className="medium-auth-link"
                  >
                    Create one
                  </button>
                </div>
              </div>
            )}

            {/* ── Sign In (Email Form) ── */}
            {authMode === "signin" && showEmailForm && (
              <div className="medium-auth-panel">
                <h2 className="medium-auth-title">Sign in with email</h2>
                <p className="medium-auth-subtitle">
                  Enter your email and password to sign in.
                </p>
                <form
                  onSubmit={this.handleAuthSubmit}
                  className="medium-auth-form"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    placeholder="Email address"
                    className="medium-auth-input"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                    placeholder="Password"
                    className="medium-auth-input"
                    required
                  />
                  <button
                    type="submit"
                    id="login-submit-btn"
                    className="medium-auth-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in..." : "Continue"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => this.setState({ showEmailForm: false })}
                  className="medium-auth-link medium-auth-back-link"
                >
                  &lt; All sign in options
                </button>
                <button
                  type="button"
                  onClick={() => this.switchAuthMode("forgotPassword")}
                  className="medium-auth-link"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* ── Sign Up ── */}
            {authMode === "signup" && !showEmailForm && (
              <div className="medium-auth-panel">
                <h2 className="medium-auth-title">Join us.</h2>
                <div className="medium-auth-button-group">
                  {this.renderGoogleButton("Sign up with Google")}
                  <button
                    type="button"
                    className="medium-auth-btn-social"
                    onClick={() => this.setState({ showEmailForm: true })}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Sign up with email
                  </button>
                </div>
                <div className="medium-auth-footer">
                  Already have an account?{" "}
                  <button
                    onClick={() => this.switchAuthMode("signin")}
                    className="medium-auth-link"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            )}

            {/* ── Sign Up (Email Form) ── */}
            {authMode === "signup" && showEmailForm && (
              <div className="medium-auth-panel">
                <h2 className="medium-auth-title">Sign up with email</h2>
                <p className="medium-auth-subtitle">
                  Enter your details to create an account.
                </p>
                <form
                  onSubmit={this.handleAuthSubmit}
                  className="medium-auth-form"
                >
                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      this.setState({ username: e.target.value })
                    }
                    placeholder="Username"
                    className="medium-auth-input"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    placeholder="Email address"
                    className="medium-auth-input"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                    placeholder="Password (min 6 chars)"
                    className="medium-auth-input"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      this.setState({ confirmPassword: e.target.value })
                    }
                    placeholder="Confirm password"
                    className="medium-auth-input"
                    required
                  />
                  <button
                    type="submit"
                    id="login-submit-btn"
                    className="medium-auth-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Continue"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => this.setState({ showEmailForm: false })}
                  className="medium-auth-link medium-auth-back-link"
                >
                  &lt; All sign up options
                </button>
              </div>
            )}

            {/* ── Forgot Password ── */}
            {authMode === "forgotPassword" && (
              <div className="medium-auth-panel">
                <h2 className="medium-auth-title">Reset password</h2>
                <p className="medium-auth-subtitle">
                  Enter your email and we'll send a reset link.
                </p>
                <form
                  onSubmit={this.handleAuthSubmit}
                  className="medium-auth-form"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    placeholder="Email address"
                    className="medium-auth-input"
                    required
                  />
                  <button
                    type="submit"
                    className="medium-auth-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={() => this.switchAuthMode("signin")}
                  className="medium-auth-link medium-auth-back-link"
                >
                  &lt; Back to sign in
                </button>
              </div>
            )}

            {/* ── Reset Password ── */}
            {authMode === "resetPassword" && (
              <div className="medium-auth-panel">
                <h2 className="medium-auth-title">New password</h2>
                <p className="medium-auth-subtitle">
                  Choose a new password for your account.
                </p>
                <form
                  onSubmit={this.handleAuthSubmit}
                  className="medium-auth-form"
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                    placeholder="New password (min 6 chars)"
                    className="medium-auth-input"
                    required
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      this.setState({ confirmPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className="medium-auth-input"
                    required
                  />
                  <button
                    type="submit"
                    className="medium-auth-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Set New Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
