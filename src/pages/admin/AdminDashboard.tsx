// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
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
function FormatToolbar({ onFormat, onInsertMedia }: any) {
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
function TagInput({ tags, onChange }: any) {
  const [input, setInput] = useState("");
  const tagList = tags
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);

  const addTag = (val: string) => {
    const newTag = val.trim();
    if (!newTag || tagList.includes(newTag) || tagList.length >= 5) return;
    onChange([...tagList, newTag].join(", "));
    setInput("");
  };

  const removeTag = (i: number) => {
    const next = tagList.filter((_: any, idx: number) => idx !== i);
    onChange(next.join(", "));
  };

  const getPlaceholder = () => {
    if (tagList.length === 0) return "Add topic… (Enter)";
    if (tagList.length < 5) return "+";
    return "";
  };

  return (
    <div className="ag-tag-input">
      {tagList.map((tag: string, i: number) => (
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
function CoverMediaUploader({ value, onChange, blogSlug }: any) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [previewMode, setPreviewMode] = useState("url"); // "url" | "file"
  const dropRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isVideo = value && /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(value);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploadError("");
    setUploading(true);
    setProgress(0);
    const result = await uploadMediaToS3(file, (p: number) => setProgress(p), blogSlug);
    setUploading(false);
    if (result.success) {
      onChange(result.url);
      setPreviewMode("file");
    } else {
      setUploadError(result.error || "Upload failed");
    }
  };

  const onDrop = (e: any) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: any) => {
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
              onError={(e) => (e.currentTarget.style.display = "none")}
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
            onChange={(e: any) => handleFile(e.target.files[0])}
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
function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}

// ── Story Card in manage list ──────────────────────────────────────────────────
function StoryCard({ blog, onEdit, onDelete }: any) {
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
            {blog.tags.slice(0, 3).map((tag: string) => (
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
const AdminDashboard: React.FC = () => {
  const history = useHistory();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    coverImage: "",
    tags: "",
    readTime: "",
    authorName: "Amrit",
    authorAvatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
    content: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("editor");

  const [insertMediaUploading, setInsertMediaUploading] = useState(false);
  const [insertMediaProgress, setInsertMediaProgress] = useState(0);
  const [insertMediaError, setInsertMediaError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertMediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    handleUrlParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUrlParams = async () => {
    const token = getStoredToken();
    const storedUser = getStoredUser();
    if (token && storedUser && storedUser.role === "admin") {
      setIsAuthenticated(true);
      setUser(storedUser);
      setLoading(false);
      loadBlogs();
    } else {
      history.push({
        pathname: "/login",
        search: window.location.search,
      });
    }
  };

  const handleLogout = () => {
    const currentUser = getStoredUser();
    clearSession();
    setIsAuthenticated(false);
    setUser(null);
    if (currentUser && currentUser.type === "cognito") {
      const domain =
        import.meta.env.VITE_APP_COGNITO_DOMAIN ||
        "amrit-portfolio-auth-prod.auth.us-east-1.amazoncognito.com";
      const clientId = import.meta.env.VITE_APP_COGNITO_CLIENT_ID;
      const logoutUri = window.location.origin + "/";
      window.location.href = `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutUri
      )}`;
    } else {
      history.push("/login");
    }
  };

  const loadBlogs = async () => {
    const fetchedBlogs = await fetchBlogs();
    setBlogs(Array.isArray(fetchedBlogs) ? fetchedBlogs : []);
  };

  const handleEdit = (blog: any) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setEditingSlug(blog.slug);
    setPreviewMode(false);
    setActiveTab("editor");
    setFormData({
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
    });
    setStatusMessage("");
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm("Delete this story permanently?")) return;
    const token = getStoredToken();
    const response = await deleteBlog(slug, token || "");
    if (response.success) {
      setStatusMessage("Story deleted.");
      setStatusType("success");
      setBlogs((prev) => prev.filter((b) => b.slug !== slug));
    } else {
      setStatusMessage(`Error: ${response.error}`);
      setStatusType("error");
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    const update: any = { [name]: value };
    if (name === "title" && !formData.slug) {
      update.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (name === "content") {
      update.readTime = estimateReadTime(value);
    }
    setFormData((prev) => ({ ...prev, ...update }));
  };

  const applyFormat = (syntax: string, wrap: boolean) => {
    const ta = textareaRef.current;
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
    
    setFormData((prev) => ({ ...prev, content: newContent }));
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }, 0);
  };

  const handleInsertMedia = () => {
    if (insertMediaInputRef.current) {
      insertMediaInputRef.current.click();
    }
  };

  const handleInsertMediaFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setInsertMediaUploading(true);
    setInsertMediaProgress(0);
    setInsertMediaError("");
    
    const result = await uploadMediaToS3(
      file,
      (p: number) => setInsertMediaProgress(p),
      editingSlug || "drafts"
    );
    setInsertMediaUploading(false);
    if (!result.success) {
      setInsertMediaError(result.error || "Upload failed");
      return;
    }
    
    const ta = textareaRef.current;
    const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(result.url);
    const markdown = isVideo
      ? `\n<video src="${result.url}" controls style="max-width:100%"></video>\n`
      : `\n![Image](${result.url})\n`;
    if (ta) {
      const start = ta.selectionStart;
      const newContent =
        ta.value.slice(0, start) + markdown + ta.value.slice(start);
      setFormData((prev) => ({ ...prev, content: newContent }));
      setInsertMediaError("");
    }
  };

  const handlePublish = async (e: any) => {
    e.preventDefault();

    if (!formData.coverImage) {
      setStatusMessage("A cover image is required before publishing.");
      setStatusType("error");
      return;
    }

    setIsPublishing(true);
    setStatusMessage("Publishing…");
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
        .map((t: string) => t.trim())
        .filter(Boolean),
      author: {
        name: formData.authorName,
        avatar: formData.authorAvatar,
      },
    };

    const response = editingSlug
      ? await updateBlog(editingSlug, payload, token || "")
      : await createBlog(payload, token || "");

    if (response.success) {
      setStatusMessage(editingSlug ? "Story updated!" : "Story published!");
      setStatusType("success");
      setIsPublishing(false);
      setEditingSlug(null);
      setFormData((prev) => ({
        ...prev,
        title: "",
        slug: "",
        summary: "",
        content: "",
        coverImage: "",
        tags: "",
        readTime: "",
      }));
      loadBlogs();
    } else {
      if (response.error?.includes("expired")) handleLogout();
      setStatusMessage(`Error: ${response.error}`);
      setStatusType("error");
      setIsPublishing(false);
    }
  };

  const resetForm = () => {
    setEditingSlug(null);
    setPreviewMode(false);
    setActiveTab("editor");
    setFormData({
      title: "",
      slug: "",
      summary: "",
      coverImage: "",
      tags: "",
      readTime: "",
      authorName: "Amrit",
      authorAvatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
      content: "",
    });
    setStatusMessage("");
  };

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
  ) as string;

  const canPublish = !isPublishing && formData.title && formData.slug;

  return (
    <div className="ag-root">
      <input
        ref={insertMediaInputRef}
        type="file"
        accept="image/*,video/*"
        style={{ display: "none" }}
        onChange={handleInsertMediaFile}
      />

      <div className="ag-workspace">
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
                onClick={resetForm}
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
                onClick={() => setActiveTab("editor")}
              >
                Editor
              </button>
              <button
                type="button"
                className={`ag-tab-btn${
                  activeTab === "stories" ? " active" : ""
                }`}
                onClick={() => setActiveTab("stories")}
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
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? "✎ Edit" : "👁 Preview"}
            </button>
            <button
              type="button"
              className="ag-logout-btn"
              onClick={handleLogout}
            >
              Sign out
            </button>
          </div>
        </div>

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
                    onClick={() => setActiveTab("editor")}
                  >
                    Write a Story
                  </button>
                </div>
              ) : (
                blogs.map((blog) => (
                  <StoryCard
                    key={blog.slug}
                    blog={blog}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="ag-editor-grid">
            <div className="ag-editor-pane">
              {!previewMode && (
                <FormatToolbar
                  onFormat={applyFormat}
                  onInsertMedia={handleInsertMedia}
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
                    onChange={handleInputChange}
                    placeholder="Your story title…"
                    rows={1}
                    onInput={(e: any) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                  <textarea
                    className="ag-subtitle-input"
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    placeholder="Write a compelling summary…"
                    rows={2}
                    onInput={(e: any) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                  <textarea
                    ref={textareaRef}
                    className="ag-content-input"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your story… Markdown is supported"
                    onInput={(e: any) => {
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                  />
                </>
              )}
            </div>

            <aside className="ag-sidebar">
              <div className="ag-sidebar-inner">
                <section className="ag-sidebar-section">
                  <div className="ag-sidebar-section-header">
                    <span className="ag-sidebar-section-icon">🖼</span>
                    <span className="ag-sidebar-section-label">
                      Cover Media
                    </span>
                  </div>
                  <div className="ag-cover-uploader-wrapper">
                    <CoverMediaUploader
                      value={formData.coverImage}
                      onChange={(url: string) =>
                        setFormData((prev) => ({ ...prev, coverImage: url }))
                      }
                      blogSlug={formData.slug || "drafts"}
                    />
                  </div>
                </section>

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
                      onChange={handleInputChange}
                      placeholder="my-post-slug"
                      required
                    />
                  </div>
                </section>

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
                    onChange={(val: string) =>
                      setFormData((prev) => ({ ...prev, tags: val }))
                    }
                  />
                </section>

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
                    onChange={handleInputChange}
                    placeholder={estimateReadTime(formData.content)}
                  />
                  <div className="ag-sidebar-hint">
                    Auto-calculated from word count
                  </div>
                </section>

                <button
                  className={`ag-publish-btn${canPublish ? "" : " disabled"}`}
                  disabled={!canPublish}
                  onClick={handlePublish}
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
};

export default AdminDashboard;
