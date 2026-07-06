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
  setSession,
} from "../../utils/apiClient";
import { marked } from "marked";
import "./AdminDashboard.css";

class AdminDashboard extends Component {
  state = {
    isAuthenticated: false,
    user: null,
    loading: true,
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
    this.handleUrlParams();
  }

  handleUrlParams = async () => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user && user.role === "admin") {
      this.setState({
        isAuthenticated: true,
        user: user,
        loading: false,
      });
    } else {
      this.props.history.push("/login");
    }
  };

  handleLogout = () => {
    clearSession();
    this.setState({ isAuthenticated: false, user: null });
    this.props.history.push("/login");
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
                placeholder="# Write your post here..."
              />
            </div>
            <div className="admin-preview-pane">
              <label style={{ color: theme.secondaryText }}>Live Preview</label>
              <div
                className="admin-preview-box markdown-body"
                style={{
                  backgroundColor: theme.imageDark,
                  color: theme.text,
                }}
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
    const { isAuthenticated, loading } = this.state;

    if (loading) {
      return (
        <div className="admin-main">
          <Header theme={theme} />
          <div
            className="admin-content"
            style={{ backgroundColor: theme.body }}
          >
            <p style={{ color: theme.text }}>Loading...</p>
          </div>
          <Footer theme={theme} onToggle={this.props.onToggle} />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return (
      <div className="admin-main" style={{ backgroundColor: theme.body }}>
        <Header theme={theme} />
        {this.renderDashboard()}
        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default AdminDashboard;
