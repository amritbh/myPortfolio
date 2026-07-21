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

// ── Tiny Rich-Text Toolbar ───────────────────────────────────────────────────
function FormatToolbar({ onFormat }) {
  const tools = [
    { label: "B", title: "Bold", syntax: "**", wrap: true },
    { label: "I", title: "Italic", syntax: "_", wrap: true },
    { label: "H2", title: "Heading 2", syntax: "## ", wrap: false },
    { label: "H3", title: "Heading 3", syntax: "### ", wrap: false },
    { label: "❝", title: "Blockquote", syntax: "> ", wrap: false },
    { label: "</>", title: "Code", syntax: "`", wrap: true },
    { label: "—", title: "Divider", syntax: "\n---\n", wrap: false },
  ];
  return (
    <div className="medium-editor-toolbar">
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          title={t.title}
          className="medium-editor-tool-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            onFormat(t.syntax, t.wrap);
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Tag Chip Input ────────────────────────────────────────────────────────────
function TagInput({ tags, onChange, theme }) {
  const [input, setInput] = React.useState("");
  const tagList = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const addTag = (val) => {
    const newTag = val.trim();
    if (!newTag || tagList.includes(newTag)) return;
    onChange([...tagList, newTag].join(", "));
    setInput("");
  };

  const removeTag = (i) => {
    const next = tagList.filter((_, idx) => idx !== i);
    onChange(next.join(", "));
  };

  return (
    <div
      className="medium-tag-input"
      style={{ borderColor: theme.imageDark, backgroundColor: theme.body }}
    >
      {tagList.map((tag, i) => (
        <span
          key={i}
          className="medium-tag-chip"
          style={{ backgroundColor: theme.imageDark, color: theme.text }}
        >
          {tag}
          <button
            type="button"
            className="medium-tag-chip-remove"
            onClick={() => removeTag(i)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        placeholder={tagList.length === 0 ? "Add a topic… (press Enter)" : ""}
        className="medium-tag-chip-input"
        style={{ color: theme.text }}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
          }
          if (e.key === "Backspace" && !input && tagList.length > 0) {
            removeTag(tagList.length - 1);
          }
        }}
      />
    </div>
  );
}

// ── Word count → read time ────────────────────────────────────────────────────
function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

// ── Main Component ────────────────────────────────────────────────────────────
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
    publishPanelOpen: false,
    previewMode: false,
  };

  textareaRef = React.createRef();

  componentDidMount() {
    this.handleUrlParams();
  }

  handleUrlParams = async () => {
    const token = getStoredToken();
    const user = getStoredUser();
    if (token && user && user.role === "admin") {
      this.setState({ isAuthenticated: true, user, loading: false }, () => {
        this.loadBlogs();
      });
    } else {
      if (this.props.history) this.props.history.push("/login");
      else window.location.href = "/login";
    }
  };

  handleLogout = () => {
    const user = getStoredUser();
    clearSession();
    this.setState({ isAuthenticated: false, user: null });

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
      this.props.history.push("/login");
    }
  };

  loadBlogs = async () => {
    const blogs = await fetchBlogs();
    this.setState({ blogs: Array.isArray(blogs) ? blogs : [] });
  };

  handleEdit = (blog) => {
    this.setState({
      activeTab: "write",
      editingSlug: blog.slug,
      publishPanelOpen: false,
      previewMode: false,
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
    if (!window.confirm("Delete this story permanently?")) return;
    const token = getStoredToken();
    const response = await deleteBlog(slug, token);
    if (response.success) {
      this.setState((prev) => ({
        statusMessage: "Story deleted.",
        blogs: prev.blogs.filter((b) => b.slug !== slug),
      }));
    } else {
      this.setState({ statusMessage: `Error: ${response.error}` });
    }
  };

  handleInputChange = (e) => {
    const { name, value } = e.target;
    const update = { [name]: value };
    if (name === "title" && !this.state.formData.slug) {
      update.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (name === "content") {
      update.readTime = estimateReadTime(value);
    }
    this.setState((prev) => ({
      formData: { ...prev.formData, ...update },
    }));
  };

  // Apply markdown formatting to selected text in the textarea
  applyFormat = (syntax, wrap) => {
    const ta = this.textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = ta.value.slice(start, end);
    let replacement;
    if (wrap) {
      replacement = `${syntax}${selected || "text"}${syntax}`;
    } else {
      replacement = `${syntax}${selected}`;
    }
    const newContent =
      ta.value.slice(0, start) + replacement + ta.value.slice(end);
    this.setState(
      (prev) => ({ formData: { ...prev.formData, content: newContent } }),
      () => {
        ta.focus();
        ta.setSelectionRange(
          start + replacement.length,
          start + replacement.length
        );
      }
    );
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
      readTime: formData.readTime || estimateReadTime(formData.content),
      publishDate: new Date().toISOString(),
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      author: {
        name: formData.authorName,
        avatar: formData.authorAvatar,
      },
    };

    const response = editingSlug
      ? await updateBlog(editingSlug, payload, token)
      : await createBlog(payload, token);

    if (response.success) {
      this.setState((prev) => ({
        statusMessage: editingSlug ? "Story updated!" : "Story published!",
        isPublishing: false,
        editingSlug: null,
        publishPanelOpen: false,
        activeTab: "manage",
        formData: {
          ...prev.formData,
          title: "",
          slug: "",
          summary: "",
          content: "",
          coverImage: "",
          tags: "",
          readTime: "",
        },
      }));
      this.loadBlogs();
    } else {
      if (response.error && response.error.includes("expired"))
        this.handleLogout();
      this.setState({
        statusMessage: `Error: ${response.error}`,
        isPublishing: false,
      });
    }
  };

  // ── Render: Manage Posts ─────────────────────────────────────────────────
  renderManage() {
    const { theme } = this.props;
    const { blogs } = this.state;
    return (
      <div className="medium-stories-list">
        {blogs.length === 0 ? (
          <p style={{ color: theme.secondaryText }}>
            You haven't published any stories yet.
          </p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog.slug}
              className="medium-story-manage-row"
              style={{ borderBottomColor: theme.imageDark }}
            >
              {blog.coverImage && (
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="medium-story-manage-thumb"
                />
              )}
              <div className="medium-story-manage-info">
                <h3
                  className="medium-story-manage-title"
                  style={{ color: theme.text }}
                >
                  {blog.title}
                </h3>
                <div
                  className="medium-story-manage-meta"
                  style={{ color: theme.secondaryText }}
                >
                  <span>
                    {new Date(blog.publishDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>·</span>
                  <span>{blog.readTime || "5 min read"}</span>
                  <span>·</span>
                  <span>
                    ❤ {Array.isArray(blog.likes) ? blog.likes.length : 0}
                  </span>
                  <span>·</span>
                  <span>
                    💬 {Array.isArray(blog.comments) ? blog.comments.length : 0}
                  </span>
                </div>
              </div>
              <div className="medium-story-manage-actions">
                <button
                  className="medium-manage-btn edit"
                  onClick={() => this.handleEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className="medium-manage-btn delete"
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

  // ── Render: Writing Editor ────────────────────────────────────────────────
  renderEditor() {
    const { theme } = this.props;
    const {
      formData,
      isPublishing,
      editingSlug,
      previewMode,
      publishPanelOpen,
    } = this.state;
    const htmlPreview = marked(
      formData.content || "_Start writing to see preview..._"
    );

    return (
      <div className="medium-editor-root">
        {/* Editor Top Bar */}
        <div
          className="medium-editor-topbar"
          style={{ borderBottomColor: theme.imageDark }}
        >
          <div className="medium-editor-topbar-left">
            {/* Draft indicator */}
            <span
              className="medium-editor-draft-label"
              style={{ color: theme.secondaryText }}
            >
              {editingSlug ? `Editing: ${editingSlug}` : "Draft"}
            </span>
          </div>
          <div className="medium-editor-topbar-right">
            <button
              type="button"
              className="medium-editor-preview-toggle"
              style={{
                color: previewMode ? "#1a8917" : theme.secondaryText,
                borderColor: previewMode ? "#1a8917" : theme.imageDark,
              }}
              onClick={() =>
                this.setState((prev) => ({ previewMode: !prev.previewMode }))
              }
            >
              {previewMode ? "✎ Edit" : "👁 Preview"}
            </button>
            <button
              type="button"
              className="medium-editor-publish-btn"
              onClick={() =>
                this.setState((prev) => ({
                  publishPanelOpen: !prev.publishPanelOpen,
                }))
              }
            >
              {editingSlug ? "Update story" : "Publish"}
            </button>
          </div>
        </div>

        <div className="medium-editor-layout">
          {/* Main Editor / Preview */}
          <div className="medium-editor-main">
            {/* Formatting toolbar */}
            {!previewMode && <FormatToolbar onFormat={this.applyFormat} />}

            {previewMode ? (
              <div
                className="medium-editor-preview markdown-body"
                style={{ color: theme.text }}
                dangerouslySetInnerHTML={{ __html: htmlPreview }}
              />
            ) : (
              <>
                {/* Title */}
                <textarea
                  className="medium-editor-title-input"
                  style={{ color: theme.text }}
                  name="title"
                  value={formData.title}
                  onChange={this.handleInputChange}
                  placeholder="Title"
                  rows={1}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                {/* Summary / Subtitle */}
                <textarea
                  className="medium-editor-subtitle-input"
                  style={{ color: theme.secondaryText }}
                  name="summary"
                  value={formData.summary}
                  onChange={this.handleInputChange}
                  placeholder="Tell your story..."
                  rows={2}
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
                {/* Content */}
                <textarea
                  ref={this.textareaRef}
                  className="medium-editor-content-input"
                  style={{ color: theme.text }}
                  name="content"
                  value={formData.content}
                  onChange={this.handleInputChange}
                  placeholder="Write your story... (Markdown supported)"
                  onInput={(e) => {
                    e.target.style.height = "auto";
                    e.target.style.height = e.target.scrollHeight + "px";
                  }}
                />
              </>
            )}
          </div>

          {/* Publish Slide-out Panel */}
          {publishPanelOpen && (
            <div
              className="medium-publish-panel"
              style={{
                backgroundColor: theme.body,
                borderLeftColor: theme.imageDark,
              }}
            >
              <h2
                className="medium-publish-panel-heading"
                style={{ color: theme.text }}
              >
                Story Preview
              </h2>

              {/* Cover Image */}
              <div className="medium-publish-field">
                <label style={{ color: theme.secondaryText }}>
                  Cover Image URL
                </label>
                {formData.coverImage && (
                  <img
                    src={formData.coverImage}
                    alt="Cover"
                    className="medium-publish-cover-preview"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <input
                  type="url"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={this.handleInputChange}
                  placeholder="https://..."
                  className="medium-publish-input"
                  style={{
                    backgroundColor: theme.imageDark,
                    color: theme.text,
                    borderColor: theme.imageDark,
                  }}
                />
              </div>

              {/* Slug */}
              <div className="medium-publish-field">
                <label style={{ color: theme.secondaryText }}>URL slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={this.handleInputChange}
                  required
                  className="medium-publish-input"
                  style={{
                    backgroundColor: theme.imageDark,
                    color: theme.text,
                    borderColor: theme.imageDark,
                  }}
                />
              </div>

              {/* Tags */}
              <div className="medium-publish-field">
                <label style={{ color: theme.secondaryText }}>
                  Topics (up to 5)
                </label>
                <TagInput
                  tags={formData.tags}
                  onChange={(val) =>
                    this.setState((prev) => ({
                      formData: { ...prev.formData, tags: val },
                    }))
                  }
                  theme={theme}
                />
              </div>

              {/* Read time */}
              <div className="medium-publish-field">
                <label style={{ color: theme.secondaryText }}>
                  Read time (auto-calculated)
                </label>
                <input
                  type="text"
                  name="readTime"
                  value={formData.readTime}
                  onChange={this.handleInputChange}
                  placeholder={estimateReadTime(formData.content)}
                  className="medium-publish-input"
                  style={{
                    backgroundColor: theme.imageDark,
                    color: theme.text,
                    borderColor: theme.imageDark,
                  }}
                />
              </div>

              <button
                className="medium-publish-confirm-btn"
                disabled={isPublishing || !formData.title || !formData.slug}
                onClick={this.handlePublish}
                style={{
                  opacity:
                    isPublishing || !formData.title || !formData.slug ? 0.5 : 1,
                }}
              >
                {isPublishing
                  ? "Publishing..."
                  : editingSlug
                  ? "Update story"
                  : "Publish now"}
              </button>
              <button
                type="button"
                className="medium-publish-cancel-btn"
                onClick={() => this.setState({ publishPanelOpen: false })}
                style={{ color: theme.secondaryText }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────
  render() {
    const { theme } = this.props;
    const {
      isAuthenticated,
      loading,
      activeTab,
      user,
      statusMessage,
    } = this.state;

    if (loading) {
      return (
        <div
          className="medium-admin-root"
          style={{ backgroundColor: theme.body }}
        >
          <Header theme={theme} />
          <div className="medium-admin-loading">
            <div
              className="medium-admin-spinner"
              style={{
                borderColor: theme.imageDark,
                borderTopColor: theme.text,
              }}
            />
          </div>
          <Footer theme={theme} onToggle={this.props.onToggle} />
        </div>
      );
    }

    if (!isAuthenticated) return null;

    return (
      <div
        className="medium-admin-root"
        style={{ backgroundColor: theme.body }}
      >
        <Header theme={theme} />

        <div className="medium-admin-layout">
          {/* Top Nav */}
          <div
            className="medium-admin-nav"
            style={{ borderBottomColor: theme.imageDark }}
          >
            <div className="medium-admin-nav-left">
              <button
                className={`medium-admin-nav-tab ${
                  activeTab === "write" ? "active" : ""
                }`}
                style={{
                  color:
                    activeTab === "write" ? theme.text : theme.secondaryText,
                  borderBottomColor:
                    activeTab === "write" ? "#1a8917" : "transparent",
                }}
                onClick={() => this.setState({ activeTab: "write" })}
              >
                {this.state.editingSlug ? "Edit story" : "New story"}
              </button>
              <button
                className={`medium-admin-nav-tab ${
                  activeTab === "manage" ? "active" : ""
                }`}
                style={{
                  color:
                    activeTab === "manage" ? theme.text : theme.secondaryText,
                  borderBottomColor:
                    activeTab === "manage" ? "#1a8917" : "transparent",
                }}
                onClick={() => this.setState({ activeTab: "manage" })}
              >
                Stories
              </button>
            </div>
            <div className="medium-admin-nav-right">
              <span
                className="medium-admin-user-label"
                style={{ color: theme.secondaryText }}
              >
                {user?.username}
              </span>
              <button
                className="medium-admin-logout-btn"
                onClick={this.handleLogout}
                style={{
                  color: theme.secondaryText,
                  borderColor: theme.imageDark,
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          {statusMessage && (
            <div
              className={`medium-admin-status ${
                statusMessage.includes("Error") ? "error" : "success"
              }`}
            >
              {statusMessage}
            </div>
          )}

          {activeTab === "manage" ? this.renderManage() : this.renderEditor()}
        </div>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default AdminDashboard;
