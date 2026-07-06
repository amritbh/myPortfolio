import React, { Component } from "react";
import { marked } from "marked";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import {
  fetchBlogBySlug,
  likeBlog,
  commentBlog,
  deleteComment,
  getStoredUser,
} from "../../utils/apiClient";
import "./BlogDetail.css";

class BlogDetail extends Component {
  state = {
    blog: null,
    loading: true,
    error: false,
    likes: [],
    comments: [],
    newCommentText: "",
    isLiking: false,
    isSubmitting: false,
    user: null,
  };

  async componentDidMount() {
    const slug = this.props.match.params.slug;
    const blog = await fetchBlogBySlug(slug);
    const user = getStoredUser();

    if (blog) {
      this.setState({
        blog,
        likes: blog.likes || [],
        comments: blog.comments || [],
        loading: false,
        user,
      });
    } else {
      this.setState({ error: true, loading: false, user });
    }
  }

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
      this.setState((prevState) => ({
        comments: [...prevState.comments, response.comment],
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
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    const response = await deleteComment(blog.slug, commentId);
    if (response.success) {
      this.setState((prevState) => ({
        comments: prevState.comments.filter((c) => c.id !== commentId),
      }));
    } else {
      alert(response.error || "Failed to delete comment.");
    }
  };

  render() {
    const { theme } = this.props;
    const {
      blog,
      loading,
      error,
      likes,
      comments,
      newCommentText,
      isLiking,
      isSubmitting,
      user,
    } = this.state;

    if (loading) {
      return (
        <div className="blog-detail-main">
          <Header theme={theme} />
          <div className="blog-detail-loading">
            <div
              className="loader"
              style={{
                borderColor: theme.text,
                borderTopColor: theme.imageHighlight,
              }}
            ></div>
          </div>
          <Footer theme={theme} onToggle={this.props.onToggle} />
        </div>
      );
    }

    if (error || !blog) {
      return (
        <div className="blog-detail-main">
          <Header theme={theme} />
          <div className="blog-detail-error">
            <h2 style={{ color: theme.text }}>Blog post not found!</h2>
            <p style={{ color: theme.secondaryText }}>
              It might have been removed or the URL is incorrect.
            </p>
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
    } = blog;

    // Fallbacks if backend doesn't have some fields yet
    const displayAuthor = author || {
      name: "Amrit",
      avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
    };
    const displayTags = tags || ["Engineering"];
    const displayReadTime = readTime || "5 min read";

    // Configure marked for safe HTML
    const htmlContent = marked(content || "");

    return (
      <div className="blog-detail-main" style={{ backgroundColor: theme.body }}>
        <Header theme={theme} />

        <article className="blog-article">
          {/* Hero Section */}
          <header className="blog-hero">
            <div className="blog-hero-content">
              <div className="blog-meta-top">
                {displayTags.map((tag, i) => (
                  <span
                    key={i}
                    className="blog-tag"
                    style={{
                      backgroundColor: theme.imageDark,
                      color: theme.text,
                    }}
                  >
                    {tag}
                  </span>
                ))}
                <span
                  className="blog-read-time"
                  style={{ color: theme.secondaryText }}
                >
                  • {displayReadTime}
                </span>
              </div>

              <h1 className="blog-title" style={{ color: theme.text }}>
                {title}
              </h1>

              <div className="blog-author-bar">
                <img
                  src={displayAuthor.avatar}
                  alt={displayAuthor.name}
                  className="blog-author-avatar"
                />
                <div className="blog-author-info">
                  <span
                    className="blog-author-name"
                    style={{ color: theme.text }}
                  >
                    {displayAuthor.name}
                  </span>
                  <span
                    className="blog-publish-date"
                    style={{ color: theme.secondaryText }}
                  >
                    {new Date(publishDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {coverImage && (
              <div className="blog-cover-wrapper">
                <div
                  className="blog-cover-overlay"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${theme.body})`,
                  }}
                ></div>
                <img
                  src={coverImage}
                  alt={title}
                  className="blog-cover-image"
                />
              </div>
            )}
          </header>

          {/* Content Section */}
          <div className="blog-content-wrapper">
            <div
              className="blog-content markdown-body"
              style={{ color: theme.text }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>

          {/* Footer Author Block */}
          <div
            className="blog-footer-author"
            style={{
              borderTop: `1px solid ${theme.imageDark}`,
              backgroundColor: theme.body,
            }}
          >
            <img
              src={displayAuthor.avatar}
              alt={displayAuthor.name}
              className="blog-footer-avatar"
            />
            <div className="blog-footer-text">
              <h3 style={{ color: theme.text }}>
                Written by {displayAuthor.name}
              </h3>
              <p style={{ color: theme.secondaryText }}>
                Thanks for reading! If you enjoyed this post, feel free to like
                or leave a comment below.
              </p>
            </div>
          </div>

          {/* Engagement Section */}
          <div
            className="blog-engagement-section"
            style={{
              borderTop: `1px solid ${theme.imageDark}`,
              paddingTop: "20px",
              marginTop: "20px",
            }}
          >
            <div className="blog-likes">
              <button
                onClick={this.handleLike}
                disabled={isLiking}
                className="blog-like-btn"
                style={{
                  backgroundColor:
                    user && likes.includes(user.username)
                      ? theme.imageHighlight
                      : "transparent",
                  color:
                    user && likes.includes(user.username) ? "#fff" : theme.text,
                  border: `1px solid ${theme.imageHighlight}`,
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                }}
              >
                <span>
                  {user && likes.includes(user.username)
                    ? "❤️ Liked"
                    : "🤍 Like"}
                </span>
                <strong>{likes.length}</strong>
              </button>
            </div>

            <div className="blog-comments" style={{ marginTop: "40px" }}>
              <h3 style={{ color: theme.text, marginBottom: "20px" }}>
                Comments ({comments.length})
              </h3>

              {user ? (
                <form
                  onSubmit={this.handleAddComment}
                  className="blog-comment-form"
                  style={{ marginBottom: "30px" }}
                >
                  <textarea
                    value={newCommentText}
                    onChange={(e) =>
                      this.setState({ newCommentText: e.target.value })
                    }
                    placeholder="Add a comment..."
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "12px",
                      backgroundColor: theme.body,
                      color: theme.text,
                      border: `1px solid ${theme.imageDark}`,
                      borderRadius: "8px",
                      marginBottom: "10px",
                      fontFamily: "inherit",
                    }}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newCommentText.trim()}
                    style={{
                      backgroundColor: theme.imageHighlight,
                      color: "#fff",
                      border: "none",
                      padding: "8px 20px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      opacity: isSubmitting || !newCommentText.trim() ? 0.6 : 1,
                    }}
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    padding: "15px",
                    backgroundColor: theme.imageDark,
                    borderRadius: "8px",
                    marginBottom: "30px",
                    color: theme.text,
                  }}
                >
                  Please{" "}
                  <a
                    href="/login"
                    style={{
                      color: theme.imageHighlight,
                      textDecoration: "underline",
                    }}
                  >
                    log in
                  </a>{" "}
                  to like or comment.
                </div>
              )}

              <div className="blog-comments-list">
                {comments.length === 0 ? (
                  <p style={{ color: theme.secondaryText }}>
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c.id}
                      className="blog-comment-item"
                      style={{
                        padding: "15px",
                        borderBottom: `1px solid ${theme.imageDark}`,
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <strong style={{ color: theme.text }}>
                          {c.username}
                        </strong>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              color: theme.secondaryText,
                              fontSize: "0.85rem",
                            }}
                          >
                            {new Date(c.timestamp).toLocaleDateString()}
                          </span>
                          {user &&
                            (user.username === c.username ||
                              user.role === "admin") && (
                              <button
                                onClick={() => this.handleDeleteComment(c.id)}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "red",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                  opacity: 0.7,
                                }}
                                title="Delete Comment"
                              >
                                ✕
                              </button>
                            )}
                        </div>
                      </div>
                      <p
                        style={{
                          color: theme.text,
                          margin: 0,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default BlogDetail;
