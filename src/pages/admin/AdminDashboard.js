import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import { createBlog } from "../../utils/apiClient";
import { marked } from "marked";
import "./AdminDashboard.css";

class AdminDashboard extends Component {
  state = {
    isAuthenticated: false,
    password: "",
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

  handleLogin = (e) => {
    e.preventDefault();
    if (this.state.password.trim() !== "") {
      this.setState({ isAuthenticated: true, statusMessage: "" });
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [name]: value,
      },
    }));

    // Auto-generate slug from title if slug is empty
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

    const { formData, password } = this.state;

    // Format payload for backend
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

    const response = await createBlog(payload, password);

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
      this.setState({
        statusMessage: `Error: ${response.error}`,
        isPublishing: false,
      });
    }
  };

  renderLogin() {
    const { theme } = this.props;
    return (
      <div className="admin-login-container">
        <div
          className="admin-login-card"
          style={{ backgroundColor: theme.imageDark }}
        >
          <h2 style={{ color: theme.text }}>Admin Access</h2>
          <p style={{ color: theme.secondaryText }}>
            Please enter the admin password to access the CMS.
          </p>
          <form onSubmit={this.handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={(e) => this.setState({ password: e.target.value })}
              className="admin-input"
              style={{ backgroundColor: theme.body, color: theme.text }}
            />
            <button type="submit" className="admin-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  renderDashboard() {
    const { theme } = this.props;
    const { formData, statusMessage, isPublishing } = this.state;
    const htmlPreview = marked(
      formData.content || "*Preview your markdown here...*"
    );

    return (
      <div className="admin-dashboard-container">
        <h1 className="admin-title" style={{ color: theme.text }}>
          Write a New Post
        </h1>

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
          : this.renderLogin()}
        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default AdminDashboard;
