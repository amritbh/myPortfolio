// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { Link, useParams } from "react-router-dom";
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
import amritPic from "../../assests/images/amrit-pp.jpg";
import { Theme } from "../../types";

interface BlogDetailProps {
  theme: Theme;
  themeMode?: string;
  onThemeChange?: (mode: string) => void;
  onToggle?: (mode: string) => void;
}

const EngagementBar = ({ theme, user, likes, isLiked, isLiking, handleLike, comments, scrollToComments, linkCopied, handleShareLink }: any) => (
  <div
    className="medium-engagement-bar"
    style={{ backgroundColor: theme.body }}
  >
    {/* Like */}
    <div className="medium-engagement-item">
      <button
        type="button"
        className={`medium-engagement-btn ${isLiked ? "liked" : ""}`}
        onClick={handleLike}
        disabled={isLiking}
        title={user ? "Like this story" : "Log in to like"}
        style={{
          borderColor: isLiked ? "#e74c3c" : theme.compImgHighlight,
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
        type="button"
        className="medium-engagement-btn"
        onClick={scrollToComments}
        title="Jump to responses"
        style={{
          borderColor: theme.compImgHighlight,
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
        type="button"
        className="medium-engagement-btn"
        onClick={handleShareLink}
        title="Copy link"
        style={{
          borderColor: theme.compImgHighlight,
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
);

const ResponseItem = ({ c, theme, user, handleDeleteComment }: any) => (
  <div
    key={c.id}
    className="medium-response-item"
    style={{ borderBottomColor: theme.compImgHighlight }}
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
            {c.name?.split("@")[0] || c.username?.split("@")[0] || "User"}
          </span>
          <span
            className="medium-response-date"
            style={{ color: theme.secondaryText }}
          >
            {new Date(c.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
      {user &&
        (user.username === c.username || user.role === "admin") && (
          <button
            type="button"
            onClick={() => handleDeleteComment(c.id)}
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
);

const BlogDetail: React.FC<BlogDetailProps> = ({ theme, themeMode, onThemeChange, onToggle }) => {
  const { slug } = useParams<{ slug: string }>();

  const [blog, setBlog] = useState<any>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);

  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    loadBlog();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    if (!loading && window.location.hash) {
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && articleRef.current) {
      const pres = articleRef.current.querySelectorAll("pre");
      pres.forEach((pre) => {
        // Skip if already added
        if (pre.querySelector(".copy-code-button")) return;

        const button = document.createElement("button");
        button.className = "copy-code-button";
        button.innerText = "Copy";
        button.onclick = () => {
          const code = pre.querySelector("code")?.textContent || "";
          navigator.clipboard.writeText(code).then(() => {
            button.innerText = "Copied!";
            setTimeout(() => {
              button.innerText = "Copy";
            }, 2000);
          });
        };
        pre.appendChild(button);
      });
    }
  }, [loading, blog]);

  const loadBlog = async () => {
    setLoading(true);
    const [fetchedBlog, allBlogs] = await Promise.all([
      fetchBlogBySlug(slug),
      fetchBlogs(),
    ]);
    const storedUser = getStoredUser();

    if (fetchedBlog) {
      const related = Array.isArray(allBlogs)
        ? allBlogs.filter((b: any) => b.slug !== slug).slice(0, 3)
        : [];
      setBlog(fetchedBlog);
      setRelatedBlogs(related);
      setLikes(fetchedBlog.likes || []);
      setComments(fetchedBlog.comments || []);
      setLoading(false);
      setUser(storedUser);
    } else {
      setError(true);
      setLoading(false);
      setUser(storedUser);
    }
  };

  const handleScroll = () => {
    const el = articleRef.current;
    if (!el) return;
    const { top, height } = el.getBoundingClientRect();
    const scrolled = Math.max(0, -top);
    const total = height - window.innerHeight;
    const progress = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
    setReadingProgress(progress);
  };

  const handleLike = async () => {
    if (!user) return alert("Please log in to like this post.");
    if (isLiking || !blog) return;
    setIsLiking(true);
    const response = await likeBlog(blog.slug);
    if (response.success) {
      setLikes(response.likes);
    } else {
      alert(response.error || "Failed to like blog.");
    }
    setIsLiking(false);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please log in to comment.");
    if (isSubmitting || !blog || !newCommentText.trim()) return;
    setIsSubmitting(true);
    const response = await commentBlog(blog.slug, newCommentText.trim());
    if (response.success) {
      setComments((prev) => [...prev, response.comment]);
      setNewCommentText("");
    } else {
      alert(response.error || "Failed to add comment.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;
    if (!window.confirm("Delete this comment?")) return;
    const response = await deleteComment(blog.slug, commentId);
    if (response.success) {
      setComments((prev) => prev.filter((c: any) => c.id !== commentId));
    } else {
      alert(response.error || "Failed to delete comment.");
    }
  };

  const handleShareLink = async () => {
    if (!blog) return;

    const shareUrl = `https://amrit.cloud/blogs/${blog.slug}`;
    const shareData = {
      title: blog.title,
      text: blog.summary,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById("comments");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div
        className="medium-article-root"
        style={{ backgroundColor: theme.body }}
      >
        <Header
          theme={theme}
          themeMode={themeMode || ""}
          onThemeChange={onThemeChange || (() => { })}
        />
        <div className="medium-article-loading">
          <div
            className="medium-article-spinner"
            style={{
              borderColor: theme.compImgHighlight,
              borderTopColor: theme.text,
            }}
          />
        </div>
        <Footer theme={theme} />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div
        className="medium-article-root"
        style={{ backgroundColor: theme.body }}
      >
        <Header
          theme={theme}
          themeMode={themeMode || ""}
          onThemeChange={onThemeChange || (() => { })}
        />
        <div className="medium-article-error">
          <h2 style={{ color: theme.text }}>Post not found</h2>
          <p style={{ color: theme.secondaryText }}>
            This story may have been removed or the link is incorrect.
          </p>
          <Link to="/blogs" style={{ color: "#1a8917", fontWeight: 600 }}>
            ← Back to stories
          </Link>
        </div>
        <Footer theme={theme} />
      </div>
    );
  }

  const {
    title,
    publishDate,
    coverImage,
    content,
    tags,
    readTime,
    summary,
    updatedAt,
  } = blog;

  const displayCoverImage =
    coverImage || "https://amrit.cloud/media/blog_default_cover.png";
  const displayAuthor = {
    name: "Amrit Bhattarai",
    avatar: amritPic,
  };
  const displayTags = tags || ["Engineering"];
  const displayReadTime = readTime || "5 min read";
  let rawContent = content || "";
  
  // Convert navigation links into stylized cards BEFORE marked parses them
  const prevRegex = /\*\*Read Previous:\*\* \[([^\]]+)\]\(([^)]+)\)/i;
  const nextRegex = /\*\*Read Next:\*\* \[([^\]]+)\]\(([^)]+)\)/i;
  
  let navCardsHtml = "";
  if (prevRegex.test(rawContent) || nextRegex.test(rawContent)) {
    navCardsHtml += '<div class="blog-nav-cards-container">';
    
    if (prevRegex.test(rawContent)) {
      rawContent = rawContent.replace(prevRegex, (match, title, link) => {
        navCardsHtml += `<a href="${link}" class="blog-nav-card prev-card"><span class="nav-label">Read Previous</span><span class="nav-title">${title}</span></a>`;
        return ""; // Remove from main content
      });
    }
    
    if (nextRegex.test(rawContent)) {
      rawContent = rawContent.replace(nextRegex, (match, title, link) => {
        navCardsHtml += `<a href="${link}" class="blog-nav-card next-card"><span class="nav-label">Read Next</span><span class="nav-title">${title}</span></a>`;
        return ""; // Remove from main content
      });
    }
    
    navCardsHtml += '</div>';
    
    // Append the nav cards to the end of the raw content
    rawContent += `\n\n${navCardsHtml}`;
  }

  let htmlContent = marked(rawContent) as string;

  // Add a stylistic divider before the Conclusion section
  htmlContent = htmlContent.replace(
    /<h3[^>]*>Conclusion<\/h3>/i,
    '<hr class="medium-article-divider conclusion-divider" /><h3 class="conclusion-heading">Conclusion</h3>'
  );
  const isLiked = user && likes.includes(user.username);

  const getUserInitial = (u: any) => {
    if (u?.name) return u.name[0].toUpperCase();
    if (u?.username) return u.username[0].toUpperCase();
    return "U";
  };

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

      <Header
        theme={theme}
        themeMode={themeMode || ""}
        onThemeChange={onThemeChange || (() => { })}
      />

      <div className="medium-article-layout">
        {/* Floating Engagement Bar (or bottom bar on mobile) */}
        <EngagementBar 
          theme={theme}
          user={user}
          likes={likes}
          isLiked={isLiked}
          isLiking={isLiking}
          handleLike={handleLike}
          comments={comments}
          scrollToComments={scrollToComments}
          linkCopied={linkCopied}
          handleShareLink={handleShareLink}
        />

        {/* Article */}
        <article className="medium-article" ref={articleRef}>
          {/* Tags above title */}
          <div className="medium-article-tags">
            {displayTags.map((tag: string) => (
              <span
                key={tag}
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
                  {updatedAt &&
                    ` (Last updated: ${new Date(
                      updatedAt
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })})`}
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
            style={{ borderColor: theme.compImgHighlight }}
          />

          {/* Cover Image */}
          {displayCoverImage && (
            <figure className="medium-article-cover">
              <img
                src={displayCoverImage}
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
              borderTopColor: theme.compImgHighlight,
              borderBottomColor: theme.compImgHighlight,
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
                Amrit Bhattarai, Sr. Cloud Software Engineer
              </p>
            </div>
          </div>

          {/* Responses Section */}
          <div
            id="comments"
            className="medium-responses"
            style={{ borderTopColor: theme.compImgHighlight }}
          >
            <h2
              className="medium-responses-heading"
              style={{ color: theme.text }}
            >
              Responses ({comments.length})
            </h2>

            {user && (
              <form
                onSubmit={handleAddComment}
                className="medium-response-form"
                style={{
                  backgroundColor: theme.body,
                  boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
                }}
              >
                {user?.picture ? (
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
                    {getUserInitial(user)}
                  </div>
                )}
                <div className="medium-response-input-wrap">
                  <textarea
                    value={newCommentText}
                    onChange={(e) =>
                      setNewCommentText(e.target.value)
                    }
                    placeholder="What are your thoughts?"
                    className="medium-response-textarea"
                    style={{
                      backgroundColor: "transparent",
                      color: theme.text,
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
            )}

            {!user && comments.length > 0 && (
              <div className="medium-response-login-box">
                <div className="login-box-text">
                  <h4 style={{ color: theme.text }}>Join the Conversation</h4>
                  <p style={{ color: theme.secondaryText }}>
                    Sign in to share your thoughts, ask questions, and engage
                    with this story.
                  </p>
                </div>
                <Link 
                  to="/login" 
                  className="login-box-button"
                  onClick={() => localStorage.setItem("redirect_after_login", window.location.pathname + "#comments")}
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Comment List */}
            <div className="medium-response-list">
              {comments.length === 0 ? (
                <div className="medium-no-responses-empty">
                  <div className="empty-bubble">
                    <span role="img" aria-label="comment">
                      💬
                    </span>
                  </div>
                  <h4 style={{ color: theme.text, margin: "4px 0 8px 0", fontSize: "1.3rem", fontFamily: "'Google Sans', sans-serif" }}>
                    No responses yet
                  </h4>
                  <p style={{ color: theme.secondaryText, marginBottom: user ? "0" : "24px" }}>
                    {user 
                      ? "Be the first to share your thoughts!" 
                      : "Sign in to join the conversation and be the first to share your thoughts."}
                  </p>
                  {!user && (
                    <Link 
                      to="/login" 
                      className="login-box-button" 
                      style={{ marginLeft: 0 }}
                      onClick={() => localStorage.setItem("redirect_after_login", window.location.pathname + "#comments")}
                    >
                      Sign In to Respond
                    </Link>
                  )}
                </div>
              ) : (
                comments.map((c) => (
                  <ResponseItem
                    key={c.id}
                    c={c}
                    theme={theme}
                    user={user}
                    handleDeleteComment={handleDeleteComment}
                  />
                ))
              )}
            </div>
          </div>

          {/* Related Stories */}
          {relatedBlogs.length > 0 && (
            <div
              className="medium-related"
              style={{ borderTopColor: theme.compImgHighlight }}
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
                      borderColor: theme.compImgHighlight,
                    }}
                  >
                    <div className="medium-related-image">
                      <img
                        src={
                          rb.coverImage ||
                          "https://amrit.cloud/media/blog_default_cover.png"
                        }
                        alt={rb.title}
                        className="medium-related-thumb"
                      />
                    </div>
                    <div className="medium-related-meta">
                      <span
                        className="medium-related-tag"
                        style={{ color: "#1a8917" }}
                      >
                        {rb.tags?.[0]}
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

      <Footer theme={theme} />
      <TopButton theme={theme} />
    </div>
  );
};

export default BlogDetail;
