import React from "react";
import { Link } from "react-router-dom";
import "./BlogCard.css";
import amritPic from "../../assests/images/amrit-pp.jpg";

interface Blog {
  title: string;
  summary: string;
  publishDate: string;
  slug: string;
  coverImage?: string;
  tags?: string[];
  readTime?: string;
  likes?: any[];
  comments?: any[];
  updatedAt?: string;
  isExternal?: boolean;
  externalLink?: string;
}

interface BlogCardProps {
  blog: Blog;
  theme: {
    compImgHighlight: string;
    text: string;
    secondaryText: string;
  };
}

export default function BlogCard({ blog, theme }: Readonly<BlogCardProps>) {
  const {
    title,
    summary,
    publishDate,
    slug,
    coverImage,
    tags,
    readTime,
    likes,
    comments,
  } = blog;

  const imageUrl =
    coverImage || "https://amrit.cloud/media/blog_default_cover.png";

  const displayAuthor = {
    name: "Amrit Bhattarai",
    avatar: amritPic,
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

  const innerContent = (
    <article
      className="medium-story-card"
      style={{ borderBottomColor: theme.compImgHighlight }}
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
            {formattedDate}{" "}
            {blog.updatedAt &&
              `(Last updated: ${new Date(blog.updatedAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )})`}
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
                key={tag}
                className="medium-story-tag"
                style={{
                  backgroundColor: theme.compImgHighlight,
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
                <span>
                  <span role="img" aria-label="likes">
                    ❤
                  </span>{" "}
                  {likeCount}
                </span>
              </>
            )}
            {commentCount > 0 && (
              <>
                <span className="medium-story-dot">·</span>
                <span>
                  <span role="img" aria-label="comments">
                    💬
                  </span>{" "}
                  {commentCount}
                </span>
              </>
            )}
            {blog.isExternal && (
              <>
                <span className="medium-story-dot">·</span>
                <span>
                  <span role="img" aria-label="external link">
                    ↗️
                  </span>{" "}
                  Medium
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Thumbnail */}
      {imageUrl && (
        <div className="medium-story-thumbnail-wrapper">
          <img src={imageUrl} alt={title} className="medium-story-thumbnail" />
        </div>
      )}
    </article>
  );

  if (blog.isExternal) {
    return (
      <a
        href={blog.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className="medium-story-link"
        style={{ textDecoration: "none" }}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <Link
      to={`/blogs/${slug}`}
      className="medium-story-link"
      style={{ textDecoration: "none" }}
    >
      {innerContent}
    </Link>
  );
}
