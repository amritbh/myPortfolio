import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
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
            // Since we don't know the exact role immediately on frontend without backend verification,
            // we will default to 'user' for safety. But the backend determines real role during requests.
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
          this.setState({ authError: "Social login failed." });
        }
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get("verifyToken");
    const resetToken = urlParams.get("resetToken");

    if (verifyToken) {
      this.setState({
        verificationStatus: "loading",
        verificationMessage: "Verifying your email...",
      });
      const res = await verifyEmail(verifyToken);
      this.setState({
        verificationStatus: res.success ? "success" : "error",
        verificationMessage: res.success
          ? "Email verified successfully! You can now log in."
          : res.error,
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (resetToken) {
      this.setState({ authMode: "resetPassword", resetToken });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user) {
      if (user.role === "admin") {
        this.props.history.push("/admin");
      } else {
        this.props.history.push("/home");
      }
    }
  };

  switchAuthMode = (mode) => {
    this.setState({
      authMode: mode,
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
        this.setState({ authError: "Valid email address is required" });
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
        this.setState({
          authError: "Password must be at least 6 characters long",
        });
        return;
      }
      if (password !== confirmPassword) {
        this.setState({ authError: "Passwords do not match" });
        return;
      }
      this.setState({ isSubmitting: true, authError: "", statusMessage: "" });
      const response = await resetPassword(resetToken, password);
      if (response.success) {
        this.setState({
          authMode: "signin",
          statusMessage: "Password reset successful! Please log in.",
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
      if (!username || username.trim().length < 3) {
        this.setState({
          authError: "Username must be at least 3 characters long",
        });
        return;
      }
      if (!password || password.length < 6) {
        this.setState({
          authError: "Password must be at least 6 characters long",
        });
        return;
      }
    }

    if (authMode === "signup") {
      if (!email || !email.includes("@")) {
        this.setState({ authError: "Valid email address is required" });
        return;
      }
      if (password !== confirmPassword) {
        this.setState({ authError: "Passwords do not match" });
        return;
      }
    }

    this.setState({ isSubmitting: true, authError: "", statusMessage: "" });

    let response;
    if (authMode === "signup") {
      response = await signupAdmin(username.trim(), email.trim(), password);
    } else {
      response = await loginAdmin(username.trim(), password);
    }

    if (response.success) {
      if (authMode === "signup") {
        this.setState({
          statusMessage: "Account created! Please check your email to verify.",
          isSubmitting: false,
          authMode: "signin",
          password: "",
          confirmPassword: "",
        });
      } else {
        if (response.user.role === "admin") {
          this.props.history.push("/admin");
        } else {
          this.props.history.push("/home");
        }
      }
    } else {
      this.setState({
        authError: response.error || "Authentication failed",
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

  render() {
    const { theme } = this.props;
    const {
      authMode,
      username,
      email,
      password,
      confirmPassword,
      isSubmitting,
      authError,
      verificationMessage,
      verificationStatus,
      statusMessage,
    } = this.state;

    return (
      <div className="admin-main">
        <Header theme={theme} />
        <div className="admin-content" style={{ backgroundColor: theme.body }}>
          <div
            className="admin-login-container"
            style={{ borderColor: theme.imageDark }}
          >
            {(authMode === "signin" || authMode === "signup") && (
              <div
                className="admin-tabs"
                style={{ borderColor: theme.imageDark }}
              >
                <button
                  type="button"
                  className={`admin-tab ${
                    authMode === "signin" ? "active" : ""
                  }`}
                  onClick={() => this.switchAuthMode("signin")}
                  style={{
                    color:
                      authMode === "signin"
                        ? theme.imageHighlight
                        : theme.secondaryText,
                    borderColor:
                      authMode === "signin"
                        ? theme.imageHighlight
                        : "transparent",
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`admin-tab ${
                    authMode === "signup" ? "active" : ""
                  }`}
                  onClick={() => this.switchAuthMode("signup")}
                  style={{
                    color:
                      authMode === "signup"
                        ? theme.imageHighlight
                        : theme.secondaryText,
                    borderColor:
                      authMode === "signup"
                        ? theme.imageHighlight
                        : "transparent",
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="admin-login-header">
              <h2 style={{ color: theme.text }}>
                {authMode === "signup"
                  ? "Create Account"
                  : authMode === "forgotPassword"
                  ? "Reset Password"
                  : authMode === "resetPassword"
                  ? "Set New Password"
                  : "Welcome Back"}
              </h2>
              <p style={{ color: theme.secondaryText }}>
                {authMode === "signup"
                  ? "Join the community to like and comment on blog posts."
                  : authMode === "forgotPassword"
                  ? "Enter your email address to receive a password reset link."
                  : authMode === "resetPassword"
                  ? "Please enter your new password below."
                  : "Sign in to interact with blog posts."}
              </p>
            </div>

            {verificationMessage && (
              <div
                className="admin-alert-error"
                style={{
                  backgroundColor:
                    verificationStatus === "error" ? "#ffcccc" : "#d4edda",
                  color: verificationStatus === "error" ? "#cc0000" : "#155724",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "0 40px 15px",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                {verificationMessage}
              </div>
            )}

            {statusMessage && (
              <div
                className="admin-alert-error"
                style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "0 40px 15px",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                {statusMessage}
              </div>
            )}

            {authError && (
              <div className="admin-alert-error" role="alert">
                ✕ {authError}
              </div>
            )}

            <form onSubmit={this.handleAuthSubmit} className="admin-login-form">
              {authMode === "signin" && (
                <>
                  <button
                    type="button"
                    onClick={this.handleGoogleLogin}
                    className="admin-btn"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      marginBottom: "15px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      border: "1px solid #ddd",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
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
                    Continue with Google
                  </button>

                  <div
                    style={{
                      textAlign: "center",
                      margin: "15px 0 20px 0",
                      color: theme.secondaryText,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: theme.secondaryText,
                        opacity: 0.2,
                      }}
                    ></div>
                    <span
                      style={{
                        padding: "0 10px",
                        fontSize: "0.85rem",
                        opacity: 0.8,
                      }}
                    >
                      OR SIGN IN WITH EMAIL
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        backgroundColor: theme.secondaryText,
                        opacity: 0.2,
                      }}
                    ></div>
                  </div>
                </>
              )}

              {(authMode === "signin" || authMode === "signup") && (
                <div className="admin-input-group">
                  <label style={{ color: theme.secondaryText }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="Username (e.g. amrit)"
                    value={username}
                    onChange={(e) =>
                      this.setState({ username: e.target.value })
                    }
                    className="admin-input"
                    style={{ backgroundColor: theme.body, color: theme.text }}
                    required
                  />
                </div>
              )}

              {(authMode === "signup" || authMode === "forgotPassword") && (
                <div className="admin-input-group">
                  <label style={{ color: theme.secondaryText }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    className="admin-input"
                    style={{ backgroundColor: theme.body, color: theme.text }}
                    required
                  />
                </div>
              )}

              {(authMode === "signin" ||
                authMode === "signup" ||
                authMode === "resetPassword") && (
                <div className="admin-input-group">
                  <label style={{ color: theme.secondaryText }}>
                    {authMode === "resetPassword"
                      ? "New Password *"
                      : "Password *"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                    className="admin-input"
                    style={{ backgroundColor: theme.body, color: theme.text }}
                    required
                  />
                </div>
              )}

              {(authMode === "signup" || authMode === "resetPassword") && (
                <div className="admin-input-group">
                  <label style={{ color: theme.secondaryText }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) =>
                      this.setState({ confirmPassword: e.target.value })
                    }
                    className="admin-input"
                    style={{ backgroundColor: theme.body, color: theme.text }}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="admin-btn"
                style={{
                  backgroundColor: theme.imageHighlight,
                  color: "#fff",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting
                  ? "Processing..."
                  : authMode === "signup"
                  ? "Create Account"
                  : authMode === "forgotPassword"
                  ? "Send Reset Link"
                  : authMode === "resetPassword"
                  ? "Update Password"
                  : "Sign In"}
              </button>

              {authMode === "signin" && (
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  <span
                    role="button"
                    tabIndex={0}
                    style={{
                      color: theme.imageHighlight,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      textDecoration: "underline",
                    }}
                    onClick={() => this.switchAuthMode("forgotPassword")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        this.switchAuthMode("forgotPassword");
                      }
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>
              )}

              {(authMode === "forgotPassword" ||
                authMode === "resetPassword") && (
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  <span
                    role="button"
                    tabIndex={0}
                    style={{
                      color: theme.secondaryText,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      textDecoration: "underline",
                    }}
                    onClick={() => this.switchAuthMode("signin")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        this.switchAuthMode("signin");
                      }
                    }}
                  >
                    Back to Sign In
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
        <Footer theme={theme} onToggle={this.props.onToggle} />
      </div>
    );
  }
}

export default Login;
