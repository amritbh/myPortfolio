import React, { Component } from "react";
import { marked } from "marked";
import { Link } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import {
  fetchBlogBySlug,
  fetchBlogs,
  likeBlog,
  commentBlog,
  deleteComment,
  getStoredUser,
} from "../../utils/apiClient";
import "./BlogDetail.css";

class BlogDetail extends Component {
  state = {
    blog: null,
    relatedBlogs: [],
    loading: true,
    error: false,
    likes: [],
    comments: [],
    newCommentText: "",
    isLiking: false,
    isSubmitting: false,
    user: null,
    readingProgress: 0,
    linkCopied: false,
  };

  articleRef = React.createRef();

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    this.loadBlog();
  }

  loadBlog = async () => {
    const slug = this.props.match.params.slug;
    const [blog, allBlogs] = await Promise.all([
      fetchBlogBySlug(slug),
      fetchBlogs(),
    ]);
    const user = getStoredUser();

    if (blog) {
      const related = Array.isArray(allBlogs)
        ? allBlogs.filter((b) => b.slug !== slug).slice(0, 3)
        : [];
      this.setState({
        blog,
        relatedBlogs: related,
        likes: blog.likes || [],
        comments: blog.comments || [],
        loading: false,
        user,
      });
    } else {
      this.setState({ error: true, loading: false, user });
    }
  };

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    const el = this.articleRef.current;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    const scrolled = Math.max(0, -top);
    const total = height - window.innerHeight;
    const progress = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
    this.setState({ readingProgress: progress });
  };

  handleLike = async () => {
    const { blog, isLiking, user } = this.state;
    if (!user) return alert("Please log in to like this post.");
    if (isLiking || !blog) return;
    this.setState({ isLiking: true });
    const response = await likeBlog(blog.slug);
    if (response.success) {
      this.setState({ likes: response.likes });
    } else {
      alert(response.error || "Failed to like blog.");
    }
    this.setState({ isLiking: false });
  };

  handleAddComment = async (e) => {
    e.preventDefault();
    const { blog, newCommentText, isSubmitting, user } = this.state;
    if (!user) return alert("Please log in to comment.");
    if (isSubmitting || !blog || !newCommentText.trim()) return;
    this.setState({ isSubmitting: true });
    const response = await commentBlog(blog.slug, newCommentText.trim());
    if (response.success) {
      this.setState((prev) => ({
        comments: [...prev.comments, response.comment],
        newCommentText: "",
      }));
    } else {
      alert(response.error || "Failed to add comment.");
    }
    this.setState({ isSubmitting: false });
  };

  handleDeleteComment = async (commentId) => {
    const { blog, user } = this.state;
    if (!user) return;
    if (!window.confirm("Delete this comment?")) return;
    const response = await deleteComment(blog.slug, commentId);
    if (response.success) {
      this.setState((prev) => ({
        comments: prev.comments.filter((c) => c.id !== commentId),
      }));
    } else {
      alert(response.error || "Failed to delete comment.");
    }
  };

  handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    this.setState({ linkCopied: true });
    setTimeout(() => this.setState({ linkCopied: false }), 2000);
  };

  scrollToComments = () => {
    const el = document.getElementById("blog-responses");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  render() {
    const { theme } = this.props;
    const {
      blog,
      relatedBlogs,
      loading,
      error,
      likes,
      comments,
      newCommentText,
      isLiking,
      isSubmitting,
      user,
      readingProgress,
      linkCopied,
    } = this.state;

    if (loading) {
      return (
        <div
          className="medium-article-root"
          style={{ backgroundColor: theme.body }}
        >
          <Header theme={theme} />
          <div className="medium-article-loading">
            <div
              className="medium-article-spinner"
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

    if (error || !blog) {
      return (
        <div
          className="medium-article-root"
          style={{ backgroundColor: theme.body }}
        >
          <Header theme={theme} />
          <div className="medium-article-error">
            <h2 style={{ color: theme.text }}>Post not found</h2>
            <p style={{ color: theme.secondaryText }}>
              This story may have been removed or the link is incorrect.
            </p>
            <Link to="/blogs" style={{ color: "#1a8917", fontWeight: 600 }}>
              ← Back to stories
            </Link>
          </div>
          <Footer theme={theme} onToggle={this.props.onToggle} />
        </div>
      );
    }

    const {
      title,
      publishDate,
      coverImage,
      content,
      author,
      tags,
      readTime,
      summary,
    } = blog;
    const displayAuthor = author || {
      name: "Amrit",
      avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
    };
    const displayTags = tags || ["Engineering"];
    const displayReadTime = readTime || "5 min read";
    const htmlContent = marked(content || "");
    const isLiked = user && likes.includes(user.username);

    return (
      <div
        className="medium-article-root"
        style={{ backgroundColor: theme.body }}
      >
        {/* Reading Progress Bar */}
        <div
          className="medium-reading-progress"
          style={{ width: `${readingProgress}%` }}
        />

        <Header theme={theme} />

        <div className="medium-article-layout">
          {/* Floating Left Engagement Bar */}
          <div className="medium-engagement-bar">
            {/* Like */}
            <div className="medium-engagement-item">
              <button
                className={`medium-engagement-btn ${isLiked ? "liked" : ""}`}
                onClick={this.handleLike}
                disabled={isLiking}
                title={user ? "Like this story" : "Log in to like"}
                style={{
                  borderColor: isLiked ? "#e74c3c" : theme.imageDark,
                  color: isLiked ? "#e74c3c" : theme.secondaryText,
                }}
              >
                {isLiked ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="#e74c3c"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                )}
              </button>
              <span
                className="medium-engagement-count"
                style={{ color: theme.secondaryText }}
              >
                {likes.length}
              </span>
            </div>

            {/* Comments */}
            <div className="medium-engagement-item">
              <button
                className="medium-engagement-btn"
                onClick={this.scrollToComments}
                title="Jump to responses"
                style={{
                  borderColor: theme.imageDark,
                  color: theme.secondaryText,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
              <span
                className="medium-engagement-count"
                style={{ color: theme.secondaryText }}
              >
                {comments.length}
              </span>
            </div>

            {/* Share */}
            <div className="medium-engagement-item">
              <button
                className="medium-engagement-btn"
                onClick={this.handleShareLink}
                title="Copy link"
                style={{
                  borderColor: theme.imageDark,
                  color: linkCopied ? "#1a8917" : theme.secondaryText,
                }}
              >
                {linkCopied ? (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1a8917"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                )}
              </button>
              {linkCopied && (
                <span
                  className="medium-engagement-count"
                  style={{ color: "#1a8917", fontSize: "0.7rem" }}
                >
                  Copied!
                </span>
              )}
            </div>
          </div>

          {/* Article */}
          <article className="medium-article" ref={this.articleRef}>
            {/* Tags above title */}
            <div className="medium-article-tags">
              {displayTags.map((tag, i) => (
                <span
                  key={i}
                  className="medium-article-tag"
                  style={{ color: "#1a8917" }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="medium-article-title" style={{ color: theme.text }}>
              {title}
            </h1>

            {/* Subtitle / Summary */}
            {summary && (
              <p
                className="medium-article-subtitle"
                style={{ color: theme.secondaryText }}
              >
                {summary}
              </p>
            )}

            {/* Author Byline */}
            <div className="medium-article-byline">
              <img
                src={displayAuthor.avatar}
                alt={displayAuthor.name}
                className="medium-article-author-avatar"
              />
              <div className="medium-article-author-info">
                <span
                  className="medium-article-author-name"
                  style={{ color: theme.text }}
                >
                  {displayAuthor.name}
                </span>
                <div
                  className="medium-article-byline-meta"
                  style={{ color: theme.secondaryText }}
                >
                  <span>
                    {new Date(publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="medium-dot">·</span>
                  <span>{displayReadTime}</span>
                  <span className="medium-dot">·</span>
                  <span>❤ {likes.length}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <hr
              className="medium-article-divider"
              style={{ borderColor: theme.imageDark }}
            />

            {/* Cover Image */}
            {coverImage && (
              <figure className="medium-article-cover">
                <img
                  src={coverImage}
                  alt={title}
                  className="medium-article-cover-img"
                />
              </figure>
            )}

            {/* Article Body */}
            <div
              className="medium-article-body markdown-body"
              style={{ color: theme.text }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Author Footer Card */}
            <div
              className="medium-author-card"
              style={{
                borderTopColor: theme.imageDark,
                borderBottomColor: theme.imageDark,
              }}
            >
              <img
                src={displayAuthor.avatar}
                alt={displayAuthor.name}
                className="medium-author-card-avatar"
              />
              <div className="medium-author-card-text">
                <p
                  className="medium-author-card-label"
                  style={{ color: theme.secondaryText }}
                >
                  Written by
                </p>
                <h3
                  className="medium-author-card-name"
                  style={{ color: theme.text }}
                >
                  {displayAuthor.name}
                </h3>
                <p
                  className="medium-author-card-bio"
                  style={{ color: theme.secondaryText }}
                >
                  Software Engineer · AWS · Terraform · React. Sharing what I
                  learn.
                </p>
              </div>
            </div>

            {/* Responses Section */}
            <div
              id="blog-responses"
              className="medium-responses"
              style={{ borderTopColor: theme.imageDark }}
            >
              <h2
                className="medium-responses-heading"
                style={{ color: theme.text }}
              >
                Responses ({comments.length})
              </h2>

              {user ? (
                <form
                  onSubmit={this.handleAddComment}
                  className="medium-response-form"
                  style={{ borderColor: theme.imageDark }}
                >
                  {user && user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || "You"}
                      className="medium-response-avatar"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      className="medium-response-avatar"
                      style={{
                        backgroundColor: "#1a8917",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {user && user.name
                        ? user.name[0].toUpperCase()
                        : user && user.username
                        ? user.username[0].toUpperCase()
                        : "U"}
                    </div>
                  )}
                  <div className="medium-response-input-wrap">
                    <textarea
                      value={newCommentText}
                      onChange={(e) =>
                        this.setState({ newCommentText: e.target.value })
                      }
                      placeholder="What are your thoughts?"
                      className="medium-response-textarea"
                      style={{
                        backgroundColor: theme.body,
                        color: theme.text,
                        borderColor: theme.imageDark,
                      }}
                      rows={3}
                      required
                    />
                    <div className="medium-response-actions">
                      <button
                        type="submit"
                        disabled={isSubmitting || !newCommentText.trim()}
                        className="medium-response-submit-btn"
                        style={{
                          opacity:
                            isSubmitting || !newCommentText.trim() ? 0.5 : 1,
                        }}
                      >
                        {isSubmitting ? "Publishing..." : "Publish"}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div
                  className="medium-response-login"
                  style={{ borderColor: theme.imageDark }}
                >
                  <a
                    href="/login"
                    style={{ color: "#1a8917", fontWeight: 600 }}
                  >
                    Sign in
                  </a>{" "}
                  <span style={{ color: theme.secondaryText }}>
                    to respond to this story.
                  </span>
                </div>
              )}

              {/* Comment List */}
              <div className="medium-response-list">
                {comments.length === 0 ? (
                  <p
                    className="medium-no-responses"
                    style={{ color: theme.secondaryText }}
                  >
                    Be the first to respond.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="medium-response-item"
                      style={{ borderBottomColor: theme.imageDark }}
                    >
                      <div className="medium-response-item-header">
                        <div className="medium-response-item-author">
                          <div
                            className="medium-response-initial"
                            style={{
                              backgroundColor: "#1a8917",
                              color: "#fff",
                              overflow: "hidden",
                            }}
                          >
                            {c.picture ? (
                              <img
                                src={c.picture}
                                alt={c.name || c.username}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              (c.name || c.username || "U")[0].toUpperCase()
                            )}
                          </div>
                          <div>
                            <span
                              className="medium-response-username"
                              style={{ color: theme.text }}
                            >
                              {c.name || c.username}
                            </span>
                            <span
                              className="medium-response-date"
                              style={{ color: theme.secondaryText }}
                            >
                              {new Date(c.timestamp).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                        {user &&
                          (user.username === c.username ||
                            user.role === "admin") && (
                            <button
                              onClick={() => this.handleDeleteComment(c.id)}
                              className="medium-response-delete-btn"
                              title="Delete"
                            >
                              ✕
                            </button>
                          )}
                      </div>
                      <p
                        className="medium-response-text"
                        style={{ color: theme.text }}
                      >
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Related Stories */}
            {relatedBlogs.length > 0 && (
              <div
                className="medium-related"
                style={{ borderTopColor: theme.imageDark }}
              >
                <h2
                  className="medium-related-heading"
                  style={{ color: theme.text }}
                >
                  More from Amrit
                </h2>
                <div className="medium-related-list">
                  {relatedBlogs.map((rb) => (
                    <Link
                      key={rb.slug}
                      to={`/blogs/${rb.slug}`}
                      className="medium-related-item"
                      style={{
                        textDecoration: "none",
                        borderColor: theme.imageDark,
                      }}
                    >
                      {rb.coverImage && (
                        <img
                          src={rb.coverImage}
                          alt={rb.title}
                          className="medium-related-thumb"
                        />
                      )}
                      <div className="medium-related-meta">
                        <span
                          className="medium-related-tag"
                          style={{ color: "#1a8917" }}
                        >
                          {rb.tags && rb.tags[0]}
                        </span>
                        <h3
                          className="medium-related-title"
                          style={{ color: theme.text }}
                        >
                          {rb.title}
                        </h3>
                        <span
                          className="medium-related-time"
                          style={{ color: theme.secondaryText }}
                        >
                          {rb.readTime || "5 min read"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default BlogDetail;
