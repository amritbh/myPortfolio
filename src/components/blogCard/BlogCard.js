import React from "react";
import { Link } from "react-router-dom";
import "./BlogCard.css";

export default function BlogCard({ blog, theme }) {
  const {
    title,
    summary,
    publishDate,
    slug,
    coverImage: imageUrl,
    author,
    tags,
    readTime,
    likes,
    comments,
  } = blog;

  const displayAuthor = author || {
    name: "Amrit",
    avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
  };
  const displayTags = tags || ["Engineering"];
  const displayReadTime = readTime || "5 min read";
  const likeCount = Array.isArray(likes) ? likes.length : 0;
  const commentCount = Array.isArray(comments) ? comments.length : 0;

  const formattedDate = new Date(publishDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/blogs/${slug}`}
      className="medium-story-link"
      style={{ textDecoration: "none" }}
    >
      <article
        className="medium-story-card"
        style={{ borderBottomColor: theme.imageDark }}
      >
        {/* Left Content */}
        <div className="medium-story-body">
          {/* Author Row */}
          <div className="medium-story-author-row">
            <img
              src={displayAuthor.avatar}
              alt={displayAuthor.name}
              className="medium-story-avatar"
            />
            <span
              className="medium-story-author-name"
              style={{ color: theme.text }}
            >
              {displayAuthor.name}
            </span>
            <span
              className="medium-story-dot"
              style={{ color: theme.secondaryText }}
            >
              ·
            </span>
            <span
              className="medium-story-date"
              style={{ color: theme.secondaryText }}
            >
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h2 className="medium-story-title" style={{ color: theme.text }}>
            {title}
          </h2>

          {/* Summary */}
          <p
            className="medium-story-summary"
            style={{ color: theme.secondaryText }}
          >
            {summary}
          </p>

          {/* Footer Row */}
          <div className="medium-story-footer">
            <div className="medium-story-tags">
              {displayTags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="medium-story-tag"
                  style={{
                    backgroundColor: theme.imageDark,
                    color: theme.secondaryText,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              className="medium-story-meta"
              style={{ color: theme.secondaryText }}
            >
              <span>{displayReadTime}</span>
              {likeCount > 0 && (
                <>
                  <span className="medium-story-dot">·</span>
                  <span>❤ {likeCount}</span>
                </>
              )}
              {commentCount > 0 && (
                <>
                  <span className="medium-story-dot">·</span>
                  <span>💬 {commentCount}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Thumbnail */}
        {imageUrl && (
          <div className="medium-story-thumbnail-wrapper">
            <img
              src={imageUrl}
              alt={title}
              className="medium-story-thumbnail"
            />
          </div>
        )}
      </article>
    </Link>
  );
}
