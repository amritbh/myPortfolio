import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogs,
  getStoredToken,
  getStoredUser,
  clearSession,
  uploadMediaToS3,
} from "../../utils/apiClient";
import { marked } from "marked";
import "./AdminDashboard.css";

// ── Tiny Rich-Text Toolbar ─────────────────────────────────────────────────────
function FormatToolbar({ onFormat, onInsertMedia }) {
  const tools = [
    { label: "B", title: "Bold", syntax: "**", wrap: true },
    { label: "I", title: "Italic", syntax: "_", wrap: true },
    { label: "H2", title: "Heading 2", syntax: "## ", wrap: false },
    { label: "H3", title: "Heading 3", syntax: "### ", wrap: false },
    { label: "❝", title: "Blockquote", syntax: "> ", wrap: false },
    { label: "</\u003e", title: "Code", syntax: "`", wrap: true },
    { label: "—", title: "Divider", syntax: "\n---\n", wrap: false },
  ];
  return (
    <div className="ag-editor-toolbar">
      {tools.map((t) => (
        <button
          key={t.label}
          type="button"
          title={t.title}
          className="ag-toolbar-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            onFormat(t.syntax, t.wrap);
          }}
        >
          {t.label}
        </button>
      ))}
      <div className="ag-toolbar-divider" />
      <button
        type="button"
        title="Insert Image or Video"
        className="ag-toolbar-btn ag-toolbar-media-btn"
        onMouseDown={(e) => {
          e.preventDefault();
          onInsertMedia();
        }}
      >
        <span role="img" aria-label="Insert media">
          📎
        </span>{" "}
        Media
      </button>
    </div>
  );
}

// ── Tag Chip Input ─────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }) {
  const [input, setInput] = React.useState("");
  const tagList = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const addTag = (val) => {
    const newTag = val.trim();
    if (!newTag || tagList.includes(newTag) || tagList.length >= 5) return;
    onChange([...tagList, newTag].join(", "));
    setInput("");
  };

  const removeTag = (i) => {
    const next = tagList.filter((_, idx) => idx !== i);
    onChange(next.join(", "));
  };

  const getPlaceholder = () => {
    if (tagList.length === 0) return "Add topic… (Enter)";
    if (tagList.length < 5) return "+";
    return "";
  };

  return (
    <div className="ag-tag-input">
      {tagList.map((tag, i) => (
        <span key={tag} className="ag-tag-chip">
          {tag}
          <button
            type="button"
            className="ag-tag-chip-remove"
            onClick={() => removeTag(i)}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        placeholder={getPlaceholder()}
        className="ag-tag-chip-input"
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

// ── Cover Media Uploader ───────────────────────────────────────────────────────
function CoverMediaUploader({ value, onChange }) {
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [uploadError, setUploadError] = React.useState("");
  const [previewMode, setPreviewMode] = React.useState("url"); // "url" | "file"
  const dropRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const isVideo = value && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value);

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    setProgress(0);
    // NOSONAR - uploadMediaToS3 is an async function
    const result = await uploadMediaToS3(file, (p) => setProgress(p));
    setUploading(false);
    if (result.success) {
      onChange(result.url);
      setPreviewMode("file");
    } else {
      setUploadError(result.error || "Upload failed");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  return (
    <div className="ag-cover-uploader">
      {/* Preview */}
      {value && !uploading && (
        <div className="ag-cover-preview-wrap">
          {isVideo ? (
            <video
              src={value}
              className="ag-cover-preview"
              controls={false}
              muted
              loop
              autoPlay
            />
          ) : (
            <img
              src={value}
              alt="Cover"
              className="ag-cover-preview"
              onError={(e) => (e.target.style.display = "none")}
            />
          )}
          <button
            type="button"
            className="ag-cover-remove-btn"
            onClick={() => onChange("")}
            title="Remove cover"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drop zone */}
      {!value && (
        <button
          type="button"
          ref={dropRef}
          className={`ag-drop-zone${dragging ? " dragging" : ""}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="ag-upload-progress-wrap">
              <div className="ag-upload-progress-label">
                Uploading… {progress}%
              </div>
              <div className="ag-upload-progress-bar">
                <div
                  className="ag-upload-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="ag-drop-icon">🖼</div>
              <div className="ag-drop-label">Drop image or video here</div>
              <div className="ag-drop-sublabel">or click to browse</div>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </button>
      )}

      {/* Upload error */}
      {uploadError && <div className="ag-upload-error">{uploadError}</div>}

      {/* URL fallback */}
      <div className="ag-cover-url-row">
        <span className="ag-cover-url-label">or paste URL</span>
        <input
          type="url"
          className="ag-cover-url-input"
          placeholder="https://..."
          value={previewMode === "url" ? value : ""}
          onChange={(e) => {
            setPreviewMode("url");
            onChange(e.target.value);
          }}
        />
      </div>
    </div>
  );
}

// ── Word count → read time ─────────────────────────────────────────────────────
function estimateReadTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

// ── Story Card in manage list ──────────────────────────────────────────────────
function StoryCard({ blog, onEdit, onDelete }) {
  return (
    <div className="ag-story-card">
      {blog.coverImage && (
        <div className="ag-story-card-thumb-wrap">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="ag-story-card-thumb"
          />
        </div>
      )}
      <div className="ag-story-card-body">
        <div className="ag-story-card-title">{blog.title}</div>
        <div className="ag-story-card-meta">
          <span>
            {new Date(blog.publishDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="ag-story-meta-dot">·</span>
          <span>{blog.readTime || "5 min read"}</span>
          <span className="ag-story-meta-dot">·</span>
          <span>
            <span role="img" aria-label="likes">
              ❤
            </span>{" "}
            {Array.isArray(blog.likes) ? blog.likes.length : 0}
          </span>
          <span className="ag-story-meta-dot">·</span>
          <span>
            <span role="img" aria-label="comments">
              💬
            </span>{" "}
            {Array.isArray(blog.comments) ? blog.comments.length : 0}
          </span>
        </div>
        {blog.tags && blog.tags.length > 0 && (
          <div className="ag-story-card-tags">
            {blog.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="ag-story-tag-badge">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="ag-story-card-actions">
        <button
          className="ag-story-action-btn edit"
          onClick={() => onEdit(blog)}
        >
          ✎ Edit
        </button>
        <button
          className="ag-story-action-btn delete"
          onClick={() => onDelete(blog.slug)}
        >
          <span role="img" aria-label="Delete">
            🗑
          </span>{" "}
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
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
    statusType: "success",
    isPublishing: false,
    previewMode: false,
    blogs: [],
    editingSlug: null,
    storiesOpen: false,
    // Inline media insert
    insertMediaUploading: false,
    insertMediaProgress: 0,
    insertMediaError: "",
  };

  textareaRef = React.createRef();
  insertMediaInputRef = React.createRef();

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
      if (this.props.history) {
        this.props.history.push({
          pathname: "/login",
          search: window.location.search,
        });
      } else {
        window.location.href = `/login${window.location.search}`;
      }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.setState({
      editingSlug: blog.slug,
      previewMode: false,
      activeTab: "editor",
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
        statusType: "success",
        blogs: prev.blogs.filter((b) => b.slug !== slug),
      }));
    } else {
      this.setState({
        statusMessage: `Error: ${response.error}`,
        statusType: "error",
      });
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

  // Insert media file inline into editor content at cursor position
  handleInsertMedia = () => {
    if (this.insertMediaInputRef.current) {
      this.insertMediaInputRef.current.click();
    }
  };

  handleInsertMediaFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    this.setState({
      insertMediaUploading: true,
      insertMediaProgress: 0,
      insertMediaError: "",
    });
    // NOSONAR - uploadMediaToS3 is an async function
    const result = await uploadMediaToS3(file, (p) =>
      this.setState({ insertMediaProgress: p })
    );
    this.setState({ insertMediaUploading: false });
    if (!result.success) {
      this.setState({ insertMediaError: result.error || "Upload failed" });
      return;
    }
    // Insert markdown/html at cursor
    const ta = this.textareaRef.current;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(result.url);
    const markdown = isVideo
      ? `\n<video src="${result.url}" controls style="max-width:100%"></video>\n`
      : `\n![Image](${result.url})\n`;
    if (ta) {
      const start = ta.selectionStart;
      const newContent =
        ta.value.slice(0, start) + markdown + ta.value.slice(start);
      this.setState((prev) => ({
        formData: { ...prev.formData, content: newContent },
        insertMediaError: "",
      }));
    }
  };

  handlePublish = async (e) => {
    e.preventDefault();
    this.setState({ isPublishing: true, statusMessage: "Publishing…" });
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
        statusType: "success",
        isPublishing: false,
        editingSlug: null,
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
        statusType: "error",
        isPublishing: false,
      });
    }
  };

  resetForm = () => {
    this.setState({
      editingSlug: null,
      previewMode: false,
      activeTab: "editor",
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
    });
  };

  render() {
    const {
      isAuthenticated,
      loading,
      user,
      statusMessage,
      statusType,
      formData,
      isPublishing,
      previewMode,
      editingSlug,
      blogs,
      insertMediaUploading,
      insertMediaProgress,
      insertMediaError,
      activeTab,
    } = this.state;

    if (loading) {
      return (
        <div className="ag-root">
          <div className="ag-loading">
            <div className="ag-spinner" />
            <div className="ag-loading-text">Loading editor…</div>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) return null;

    const htmlPreview = marked(
      formData.content || "_Start writing to see preview…_"
    );

    const canPublish = !isPublishing && formData.title && formData.slug;

    return (
      <div className="ag-root">
        {/* Hidden file input for inline media insertion */}
        <input
          ref={this.insertMediaInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: "none" }}
          onChange={this.handleInsertMediaFile}
        />

        <div className="ag-workspace">
          {/* ── Top Action Bar ── */}
          <div className="ag-topbar">
            <div className="ag-topbar-left">
              <Link to="/" className="ag-back-btn" title="Back to site">
                &larr;
              </Link>
              <div className="ag-topbar-brand">
                <span className="ag-topbar-icon" role="img" aria-label="Editor">
                  ✍
                </span>
                <span className="ag-topbar-title">
                  {editingSlug ? `Editing: ${editingSlug}` : "New Story"}
                </span>
              </div>
              {editingSlug && (
                <button
                  type="button"
                  className="ag-topbar-new-btn"
                  onClick={this.resetForm}
                  title="Start a new story"
                >
                  + New
                </button>
              )}
            </div>
            <div className="ag-topbar-center">
              <div className="ag-tabs">
                <button
                  type="button"
                  className={`ag-tab-btn${
                    activeTab === "editor" ? " active" : ""
                  }`}
                  onClick={() => this.setState({ activeTab: "editor" })}
                >
                  Editor
                </button>
                <button
                  type="button"
                  className={`ag-tab-btn${
                    activeTab === "stories" ? " active" : ""
                  }`}
                  onClick={() => this.setState({ activeTab: "stories" })}
                >
                  My Stories
                  {blogs.length > 0 && (
                    <span className="ag-tab-badge">{blogs.length}</span>
                  )}
                </button>
              </div>
            </div>
            <div className="ag-topbar-right">
              <div className="ag-user-pill">
                <div className="ag-user-dot" />
                {user?.username}
              </div>
              <button
                type="button"
                className={`ag-preview-btn${previewMode ? " active" : ""}`}
                onClick={() =>
                  this.setState((prev) => ({ previewMode: !prev.previewMode }))
                }
              >
                {previewMode ? "✎ Edit" : "👁 Preview"}
              </button>
              <button
                type="button"
                className="ag-logout-btn"
                onClick={this.handleLogout}
              >
                Sign out
              </button>
            </div>
          </div>

          {/* ── Status Banner ── */}
          {statusMessage && (
            <div
              className={`ag-status-banner${
                statusType === "error" ? " error" : ""
              }`}
            >
              {statusType === "error" ? "⚠ " : "✓ "}
              {statusMessage}
            </div>
          )}

          {/* ── Insert Media Progress (inline) ── */}
          {insertMediaUploading && (
            <div className="ag-inline-upload-banner">
              <span>Uploading media… {insertMediaProgress}%</span>
              <div className="ag-inline-upload-bar">
                <div
                  className="ag-inline-upload-fill"
                  style={{ width: `${insertMediaProgress}%` }}
                />
              </div>
            </div>
          )}
          {insertMediaError && (
            <div className="ag-status-banner error">⚠ {insertMediaError}</div>
          )}

          {activeTab === "stories" ? (
            <div className="ag-stories-full-view">
              <div className="ag-stories-grid">
                {blogs.length === 0 ? (
                  <div className="ag-empty-state">
                    <h3>No stories yet</h3>
                    <p>Start writing your first blog post!</p>
                    <button
                      onClick={() => this.setState({ activeTab: "editor" })}
                    >
                      Write a Story
                    </button>
                  </div>
                ) : (
                  blogs.map((blog) => (
                    <StoryCard
                      key={blog.slug}
                      blog={blog}
                      onEdit={this.handleEdit}
                      onDelete={this.handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="ag-editor-grid">
              {/* ── Main Editor Grid ── */}
              {/* Left: Writing Area */}
              <div className="ag-editor-pane">
                {!previewMode && (
                  <FormatToolbar
                    onFormat={this.applyFormat}
                    onInsertMedia={this.handleInsertMedia}
                  />
                )}

                {previewMode ? (
                  <div
                    className="ag-preview-body markdown-body"
                    dangerouslySetInnerHTML={{ __html: htmlPreview }}
                  />
                ) : (
                  <>
                    <textarea
                      className="ag-title-input"
                      name="title"
                      value={formData.title}
                      onChange={this.handleInputChange}
                      placeholder="Your story title…"
                      rows={1}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                    />
                    <textarea
                      className="ag-subtitle-input"
                      name="summary"
                      value={formData.summary}
                      onChange={this.handleInputChange}
                      placeholder="Write a compelling summary…"
                      rows={2}
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                    />
                    <textarea
                      ref={this.textareaRef}
                      className="ag-content-input"
                      name="content"
                      value={formData.content}
                      onChange={this.handleInputChange}
                      placeholder="Write your story… Markdown is supported"
                      onInput={(e) => {
                        e.target.style.height = "auto";
                        e.target.style.height = e.target.scrollHeight + "px";
                      }}
                    />
                  </>
                )}
              </div>

              {/* Right: Publish Sidebar */}
              <aside className="ag-sidebar">
                <div className="ag-sidebar-inner">
                  {/* Cover Media */}
                  <section className="ag-sidebar-section">
                    <div className="ag-sidebar-section-header">
                      <span className="ag-sidebar-section-icon">🖼</span>
                      <span className="ag-sidebar-section-label">
                        Cover Media
                      </span>
                    </div>
                    <CoverMediaUploader
                      value={formData.coverImage}
                      onChange={(url) =>
                        this.setState((prev) => ({
                          formData: { ...prev.formData, coverImage: url },
                        }))
                      }
                    />
                  </section>

                  {/* URL Slug */}
                  <section className="ag-sidebar-section">
                    <div className="ag-sidebar-section-header">
                      <span
                        className="ag-sidebar-section-icon"
                        role="img"
                        aria-label="URL"
                      >
                        🔗
                      </span>
                      <span className="ag-sidebar-section-label">URL Slug</span>
                    </div>
                    <div className="ag-slug-preview">
                      <span className="ag-slug-base">amrit.cloud/blogs/</span>
                      <input
                        type="text"
                        name="slug"
                        className="ag-sidebar-input"
                        value={formData.slug}
                        onChange={this.handleInputChange}
                        placeholder="my-post-slug"
                        required
                      />
                    </div>
                  </section>

                  {/* Topics */}
                  <section className="ag-sidebar-section">
                    <div className="ag-sidebar-section-header">
                      <span className="ag-sidebar-section-icon">🏷</span>
                      <span className="ag-sidebar-section-label">
                        Topics
                        <span className="ag-sidebar-section-count">
                          {" "}
                          {
                            formData.tags.split(",").filter((t) => t.trim())
                              .length
                          }
                          /5
                        </span>
                      </span>
                    </div>
                    <TagInput
                      tags={formData.tags}
                      onChange={(val) =>
                        this.setState((prev) => ({
                          formData: { ...prev.formData, tags: val },
                        }))
                      }
                    />
                  </section>

                  {/* Read time */}
                  <section className="ag-sidebar-section">
                    <div className="ag-sidebar-section-header">
                      <span className="ag-sidebar-section-icon">⏱</span>
                      <span className="ag-sidebar-section-label">
                        Read Time
                      </span>
                    </div>
                    <input
                      type="text"
                      name="readTime"
                      className="ag-sidebar-input"
                      value={formData.readTime}
                      onChange={this.handleInputChange}
                      placeholder={estimateReadTime(formData.content)}
                    />
                    <div className="ag-sidebar-hint">
                      Auto-calculated from word count
                    </div>
                  </section>

                  {/* Publish button */}
                  <button
                    className={`ag-publish-btn${canPublish ? "" : " disabled"}`}
                    disabled={!canPublish}
                    onClick={this.handlePublish}
                  >
                    {isPublishing
                      ? "Publishing…"
                      : editingSlug
                      ? "✓ Update Story"
                      : "🚀 Publish Now"}
                  </button>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AdminDashboard;
