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
  } = blog;

  const displayAuthor = author || {
    name: "Amrit",
    avatar: "https://avatars.githubusercontent.com/u/79965355?v=4",
  };
  const displayTags = tags || ["Engineering"];
  const displayReadTime = readTime || "5 min read";

  return (
    <Link
      to={`/blogs/${slug}`}
      className="blog-card-link"
      style={{ textDecoration: "none" }}
    >
      <div
        className="premium-blog-card"
        style={{ backgroundColor: theme.imageDark }}
      >
        {imageUrl && (
          <div className="blog-card-image-wrapper">
            <img src={imageUrl} alt={title} className="blog-card-image" />
            <div className="blog-card-tags">
              {displayTags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="blog-card-tag"
                  style={{ backgroundColor: theme.body, color: theme.text }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="blog-card-content">
          <div
            className="blog-card-meta"
            style={{ color: theme.secondaryText }}
          >
            <span>
              {new Date(publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="dot-separator">•</span>
            <span>{displayReadTime}</span>
          </div>

          <h2 className="blog-card-title" style={{ color: theme.text }}>
            {title}
          </h2>

          <p
            className="blog-card-summary"
            style={{ color: theme.secondaryText }}
          >
            {summary}
          </p>

          <div
            className="blog-card-footer"
            style={{ borderTopColor: theme.secondaryText }}
          >
            <div className="blog-card-author">
              <img
                src={displayAuthor.avatar}
                alt={displayAuthor.name}
                className="blog-card-avatar"
              />
              <span
                className="blog-card-author-name"
                style={{ color: theme.text }}
              >
                {displayAuthor.name}
              </span>
            </div>

            <div className="blog-card-readmore" style={{ color: theme.text }}>
              Read Article
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
