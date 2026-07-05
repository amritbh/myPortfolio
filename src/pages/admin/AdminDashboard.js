import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import {
  createBlog,
  loginAdmin,
  signupAdmin,
  getStoredToken,
  getStoredUser,
  clearSession,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from "../../utils/apiClient";
import { marked } from "marked";
import "./AdminDashboard.css";

class AdminDashboard extends Component {
  state = {
    isAuthenticated: false,
    authMode: "signin", // 'signin' | 'signup' | 'forgotPassword' | 'resetPassword'
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    user: null,
    isSubmitting: false,
    authError: "",
    verificationMessage: "",
    verificationStatus: "",
    resetToken: "",
    formData: {
      title: "",
      slug: "",
      summary: "",
      coverImage: "",
      tags: "",
      readTime: "",
      authorName: "Amrit",
      authorAvatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
      content: "",
    },
    statusMessage: "",
    isPublishing: false,
  };

  async componentDidMount() {
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
    if (token) {
      this.setState({
        isAuthenticated: true,
        user: user || { username: "admin", role: "admin" },
      });
    }
  }

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
        this.setState({
          isAuthenticated: true,
          user: response.user,
          isSubmitting: false,
          authError: "",
          password: "",
          confirmPassword: "",
        });
      }
    } else {
      this.setState({
        authError: response.error || "Authentication failed",
        isSubmitting: false,
      });
    }
  };

  handleLogout = () => {
    clearSession();
    this.setState({
      isAuthenticated: false,
      user: null,
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      authError: "",
      statusMessage: "",
    });
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));

    if (name === "title" && !this.state.formData.slug) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      this.setState((prevState) => ({
        formData: { ...prevState.formData, slug: autoSlug },
      }));
    }
  };

  handlePublish = async (e) => {
    e.preventDefault();
    this.setState({ isPublishing: true, statusMessage: "Publishing..." });

    const { formData } = this.state;
    const token = getStoredToken();

    const payload = {
      slug: formData.slug,
      title: formData.title,
      summary: formData.summary,
      content: formData.content,
      coverImage: formData.coverImage,
      readTime: formData.readTime,
      publishDate: new Date().toISOString(),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      author: {
        name: formData.authorName,
        avatar: formData.authorAvatar,
      },
    };

    const response = await createBlog(payload, token);

    if (response.success) {
      this.setState({
        statusMessage: "Success! Post published to DynamoDB.",
        isPublishing: false,
        formData: {
          ...this.state.formData,
          title: "",
          slug: "",
          summary: "",
          content: "",
        },
      });
    } else {
      if (response.error && response.error.includes("expired")) {
        this.handleLogout();
      }
      this.setState({
        statusMessage: `Error: ${response.error}`,
        isPublishing: false,
      });
    }
  };

  renderAuthCard() {
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
      <div className="admin-login-container">
        <div
          className="admin-login-card"
          style={{
            backgroundColor: theme.highlight + "44",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {["signin", "signup"].includes(authMode) && (
            <div className="admin-auth-tabs">
              <button
                type="button"
                className={`admin-tab ${authMode === "signin" ? "active" : ""}`}
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
                className={`admin-tab ${authMode === "signup" ? "active" : ""}`}
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
                ? "Create Admin Account"
                : authMode === "forgotPassword"
                ? "Reset Password"
                : authMode === "resetPassword"
                ? "Set New Password"
                : "Admin Access"}
            </h2>
            <p style={{ color: theme.secondaryText }}>
              {authMode === "signup"
                ? "Register a new admin user to manage portfolio blog posts."
                : authMode === "forgotPassword"
                ? "Enter your email address to receive a password reset link."
                : authMode === "resetPassword"
                ? "Please enter your new password below."
                : "Sign in with your admin credentials to manage portfolio blog posts."}
            </p>
          </div>

          {verificationMessage && (
            <div
              className="admin-alert-error"
              role="alert"
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
              role="alert"
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
            {(authMode === "signin" || authMode === "signup") && (
              <div className="admin-input-group">
                <label style={{ color: theme.secondaryText }}>Username *</label>
                <input
                  type="text"
                  placeholder="Username (e.g. amrit)"
                  value={username}
                  onChange={(e) => this.setState({ username: e.target.value })}
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
                  placeholder={
                    authMode === "resetPassword"
                      ? "New Password"
                      : "Admin Password"
                  }
                  value={password}
                  onChange={(e) => this.setState({ password: e.target.value })}
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
                  placeholder="Re-enter Password"
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
                color: "#ffffff",
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
                : "Sign In to CMS"}
            </button>

            {authMode === "signin" && (
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <span
                  style={{
                    color: theme.imageHighlight,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    textDecoration: "underline",
                  }}
                  onClick={() => this.switchAuthMode("forgotPassword")}
                >
                  Forgot Password?
                </span>
              </div>
            )}

            {(authMode === "forgotPassword" ||
              authMode === "resetPassword") && (
              <div style={{ textAlign: "center", marginTop: "15px" }}>
                <span
                  style={{
                    color: theme.secondaryText,
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    textDecoration: "underline",
                  }}
                  onClick={() => this.switchAuthMode("signin")}
                >
                  Back to Sign In
                </span>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  renderDashboard() {
    const { theme } = this.props;
    const { formData, statusMessage, isPublishing, user } = this.state;
    const htmlPreview = marked(
      formData.content || "*Preview your markdown here...*"
    );

    return (
      <div className="admin-dashboard-container">
        <div className="admin-cms-header">
          <div>
            <h1 className="admin-title" style={{ color: theme.text }}>
              Write a New Post
            </h1>
            <p style={{ color: theme.secondaryText, margin: 0 }}>
              Logged in as <strong>{user?.username || "admin"}</strong>
            </p>
          </div>
          <button
            onClick={this.handleLogout}
            className="admin-logout-btn"
            style={{
              borderColor: theme.text,
              color: theme.text,
            }}
          >
            Logout
          </button>
        </div>

        {statusMessage && (
          <div
            className={`admin-status ${
              statusMessage.includes("Success") ? "success" : "error"
            }`}
          >
            {statusMessage}
          </div>
        )}

        <form onSubmit={this.handlePublish} className="admin-form">
          <div className="admin-metadata-grid">
            <div className="admin-input-group">
              <label style={{ color: theme.secondaryText }}>Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={this.handleInputChange}
                className="admin-input"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
              />
            </div>
            <div className="admin-input-group">
              <label style={{ color: theme.secondaryText }}>Slug</label>
              <input
                required
                name="slug"
                value={formData.slug}
                onChange={this.handleInputChange}
                className="admin-input"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
              />
            </div>
            <div className="admin-input-group" style={{ gridColumn: "1 / -1" }}>
              <label style={{ color: theme.secondaryText }}>Summary</label>
              <textarea
                required
                name="summary"
                value={formData.summary}
                onChange={this.handleInputChange}
                className="admin-input"
                rows="2"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
              />
            </div>
            <div className="admin-input-group">
              <label style={{ color: theme.secondaryText }}>
                Cover Image URL
              </label>
              <input
                name="coverImage"
                value={formData.coverImage}
                onChange={this.handleInputChange}
                className="admin-input"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
              />
            </div>
            <div className="admin-input-group">
              <label style={{ color: theme.secondaryText }}>
                Tags (comma separated)
              </label>
              <input
                name="tags"
                value={formData.tags}
                onChange={this.handleInputChange}
                className="admin-input"
                placeholder="React, AWS, Terraform"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
              />
            </div>
            <div className="admin-input-group">
              <label style={{ color: theme.secondaryText }}>Read Time</label>
              <input
                name="readTime"
                value={formData.readTime}
                onChange={this.handleInputChange}
                className="admin-input"
                placeholder="5 min read"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
              />
            </div>
          </div>

          <div className="admin-editor-split">
            <div className="admin-editor-pane">
              <label style={{ color: theme.secondaryText }}>
                Markdown Content
              </label>
              <textarea
                required
                name="content"
                value={formData.content}
                onChange={this.handleInputChange}
                className="admin-textarea"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
                placeholder="# Write your post here..."
              />
            </div>
            <div className="admin-preview-pane">
              <label style={{ color: theme.secondaryText }}>Live Preview</label>
              <div
                className="admin-preview-box markdown-body"
                style={{ backgroundColor: theme.imageDark, color: theme.text }}
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPublishing}
            className="admin-publish-btn"
          >
            {isPublishing ? "Publishing..." : "Publish to DynamoDB"}
          </button>
        </form>
      </div>
    );
  }

  render() {
    const { theme } = this.props;
    return (
      <div className="admin-main" style={{ backgroundColor: theme.body }}>
        <Header theme={theme} />
        {this.state.isAuthenticated
          ? this.renderDashboard()
          : this.renderAuthCard()}
        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default AdminDashboard;
