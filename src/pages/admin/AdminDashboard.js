import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogs,
  getStoredToken,
  getStoredUser,
  clearSession,
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
    activeTab: "write",
    blogs: [],
    editingSlug: null,
  };

  componentDidMount() {
    this.handleUrlParams();
  }

  handleUrlParams = async () => {
    const token = getStoredToken();
    const user = getStoredUser();

    if (token && user && user.role === "admin") {
      this.setState(
        {
          isAuthenticated: true,
          user: user,
          loading: false,
        },
        () => {
          this.loadBlogs();
        }
      );
    } else {
      if (this.props.history) {
        this.props.history.push("/login");
      } else {
        window.location.href = "/login";
      }
    }
  };

  handleLogout = () => {
    clearSession();
    this.setState({ isAuthenticated: false, user: null });
    this.props.history.push("/login");
  };

  loadBlogs = async () => {
    const response = await fetchBlogs();
    if (response.success) {
      this.setState({ blogs: response.data || [] });
    }
  };

  handleEdit = (blog) => {
    this.setState({
      activeTab: "write",
      editingSlug: blog.slug,
      formData: {
        title: blog.title || "",
        slug: blog.slug || "",
        summary: blog.summary || "",
        coverImage: blog.coverImage || "",
        tags: blog.tags ? blog.tags.join(", ") : "",
        readTime: blog.readTime || "",
        authorName: blog.author?.name || "Amrit",
        authorAvatar:
          blog.author?.avatar ||
          "https://avatars.githubusercontent.com/u/79965355?v=4",
        content: blog.content || "",
      },
      statusMessage: "",
    });
  };

  handleDelete = async (slug) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }
    const token = getStoredToken();
    const response = await deleteBlog(slug, token);
    if (response.success) {
      this.setState((prevState) => ({
        statusMessage: "Blog deleted successfully.",
        blogs: prevState.blogs.filter((b) => b.slug !== slug),
      }));
    } else {
      this.setState({ statusMessage: `Error: ${response.error}` });
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

    const { formData, editingSlug } = this.state;
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

    let response;
    if (editingSlug) {
      response = await updateBlog(editingSlug, payload, token);
    } else {
      response = await createBlog(payload, token);
    }

    if (response.success) {
      this.setState((prevState) => ({
        statusMessage: editingSlug
          ? "Success! Post updated."
          : "Success! Post published.",
        isPublishing: false,
        editingSlug: null,
        formData: {
          ...prevState.formData,
          title: "",
          slug: "",
          summary: "",
          content: "",
        },
      }));
      this.loadBlogs(); // Refresh list
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

  renderManage() {
    const { theme } = this.props;
    const { blogs } = this.state;

    return (
      <div className="admin-blog-list">
        {blogs.length === 0 ? (
          <p style={{ color: theme.secondaryText }}>No posts found.</p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.slug}
              className="admin-blog-item"
              style={{ backgroundColor: theme.imageDark }}
            >
              <div className="admin-blog-info">
                <h3 style={{ color: theme.text }}>{blog.title}</h3>
                <p style={{ color: theme.secondaryText }}>{blog.slug}</p>
              </div>
              <div className="admin-blog-actions">
                <button
                  className="admin-edit-btn"
                  onClick={() => this.handleEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className="admin-delete-btn"
                  onClick={() => this.handleDelete(blog.slug)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  renderDashboard() {
    const { theme } = this.props;
    const {
      formData,
      statusMessage,
      isPublishing,
      user,
      activeTab,
      editingSlug,
    } = this.state;
    const htmlPreview = marked(
      formData.content || "*Preview your markdown here...*"
    );

    return (
      <div className="admin-dashboard-container">
        <div className="admin-cms-header">
          <div>
            <h1 className="admin-title" style={{ color: theme.text }}>
              Dashboard
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

        <div
          className="admin-auth-tabs"
          style={{
            marginBottom: "30px",
            borderBottomColor: theme.secondaryText,
          }}
        >
          <button
            className={`admin-tab ${activeTab === "write" ? "active" : ""}`}
            style={{
              color: activeTab === "write" ? theme.text : theme.secondaryText,
              borderBottomColor:
                activeTab === "write" ? theme.highlight : "transparent",
            }}
            onClick={() => this.setState({ activeTab: "write" })}
          >
            {editingSlug ? "Edit Post" : "Write a New Post"}
          </button>
          <button
            className={`admin-tab ${activeTab === "manage" ? "active" : ""}`}
            style={{
              color: activeTab === "manage" ? theme.text : theme.secondaryText,
              borderBottomColor:
                activeTab === "manage" ? theme.highlight : "transparent",
            }}
            onClick={() => this.setState({ activeTab: "manage" })}
          >
            Manage Posts
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

        {activeTab === "manage" ? (
          this.renderManage()
        ) : (
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
              <div
                className="admin-input-group"
                style={{ gridColumn: "1 / -1" }}
              >
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
                <label style={{ color: theme.secondaryText }}>
                  Live Preview
                </label>
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
              {isPublishing
                ? "Saving..."
                : editingSlug
                ? "Update Post"
                : "Publish to DynamoDB"}
            </button>
          </form>
        )}
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
