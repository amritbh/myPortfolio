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
} from "../../utils/apiClient";
import { marked } from "marked";
import "./AdminDashboard.css";

class AdminDashboard extends Component {
  state = {
    isAuthenticated: false,
    authMode: "signin", // 'signin' | 'signup'
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    user: null,
    isSubmitting: false,
    authError: "",
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

  componentDidMount() {
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
      password: "",
      confirmPassword: "",
    });
  };

  handleAuthSubmit = async (e) => {
    e.preventDefault();
    const { authMode, username, email, password, confirmPassword } = this.state;

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

    this.setState({ isSubmitting: true, authError: "" });

    let response;
    if (authMode === "signup") {
      response = await signupAdmin(username.trim(), email.trim(), password);
    } else {
      response = await loginAdmin(username.trim(), password);
    }

    if (response.success) {
      this.setState({
        isAuthenticated: true,
        user: response.user,
        isSubmitting: false,
        authError: "",
        password: "",
        confirmPassword: "",
      });
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
          {/* Tab Navigation */}
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
                  authMode === "signin" ? theme.imageHighlight : "transparent",
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
                  authMode === "signup" ? theme.imageHighlight : "transparent",
              }}
            >
              Sign Up
            </button>
          </div>

          <div className="admin-login-header">
            <h2 style={{ color: theme.text }}>
              {authMode === "signup" ? "Create Admin Account" : "Admin Access"}
            </h2>
            <p style={{ color: theme.secondaryText }}>
              {authMode === "signup"
                ? "Register a new admin user to manage portfolio blog posts."
                : "Sign in with your admin credentials to manage portfolio blog posts."}
            </p>
          </div>

          {authError && (
            <div className="admin-alert-error" role="alert">
              ✕ {authError}
            </div>
          )}

          <form onSubmit={this.handleAuthSubmit} className="admin-login-form">
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

            {authMode === "signup" && (
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

            <div className="admin-input-group">
              <label style={{ color: theme.secondaryText }}>Password *</label>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
                className="admin-input"
                style={{ backgroundColor: theme.body, color: theme.text }}
                required
              />
            </div>

            {authMode === "signup" && (
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
                : "Sign In to CMS"}
            </button>
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
