import React, { useState, useEffect } from "react";
import "./FeaturedBlogs.css";
import { fetchBlogs } from "../../utils/apiClient";
import { Link } from "react-router-dom";
import type { Theme } from "../../types";

const TAG_COLORS: Record<string, string> = {
  AWS: "#FF9900",
  Terraform: "#7B42BC",
  Python: "#3776AB",
  React: "#61DAFB",
  TypeScript: "#3178C6",
  DevOps: "#0DB7ED",
  CI_CD: "#F05032",
  Security: "#D73A49",
  Serverless: "#FF6600",
  default: "#58A6FF",
};

function tagColor(tag: string): string {
  return TAG_COLORS[tag] || TAG_COLORS.default;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface FeaturedBlogsProps {
  theme?: Theme;
}

const FeaturedBlogs: React.FC<FeaturedBlogsProps> = ({ theme }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs()
      .then((allBlogs) => {
        const sorted = [...allBlogs]
          .filter((b) => b.publishDate)
          .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        setBlogs(sorted.slice(0, 3));
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load posts.");
        setLoading(false);
      });
  }, []);

  const renderSkeleton = () => {
    return [1, 2, 3].map((n) => (
      <div key={n} className="blog-card skeleton" aria-hidden="true">
        <div className="skeleton-cover" />
        <div className="skeleton-body">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
        </div>
      </div>
    ));
  };

  const renderCards = () => {
    if (blogs.length === 0) {
      return (
        <p
          className="no-posts-msg"
          style={{ color: theme ? theme.secondaryText : undefined }}
        >
          No posts yet — check back soon!
        </p>
      );
    }

    return blogs.map((blog) => {
      const tags = blog.tags || [];
      const firstTag = tags[0] || "Blog";
      const accentColor = tagColor(firstTag);

      return (
        <Link
          to={`/blogs/${blog.slug}`}
          key={blog.slug}
          className="blog-card"
          style={{
            backgroundColor: theme ? theme.headerColor : undefined,
            borderColor: theme ? theme.highlight : undefined,
            textDecoration: "none",
          }}
        >
          <div
            className="blog-card-cover"
            style={{ backgroundColor: accentColor }}
          />
          <div className="blog-card-body">
            <div className="blog-card-tags">
              {tags.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  className="blog-tag"
                  style={{
                    backgroundColor: `${tagColor(tag)}22`,
                    color: theme ? theme.text : undefined,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3
              className="blog-card-title"
              style={{ color: theme ? theme.text : undefined }}
            >
              {blog.title}
            </h3>
            <p
              className="blog-card-excerpt"
              style={{ color: theme ? theme.text : undefined }}
            >
              {blog.summary || blog.excerpt || ""}
            </p>
            <div className="blog-card-meta">
              <span
                className="blog-meta-date"
                style={{ color: theme ? theme.text : undefined }}
              >
                {formatDate(blog.publishDate)}
              </span>
              {blog.readTime && (
                <span
                  className="blog-meta-read"
                  style={{ color: theme ? theme.text : undefined }}
                >
                  {blog.readTime}
                </span>
              )}
            </div>
            <span className="blog-card-cta" style={{ color: accentColor }}>
              Read More →
            </span>
          </div>
        </Link>
      );
    });
  };

  return (
    <section className="featured-blogs-section" id="featured-blogs">
      <div className="featured-blogs-header">
        <h2
          className="section-title"
          style={{ color: theme ? theme.text : undefined }}
        >
          Latest from the Blog
        </h2>
        <p
          className="section-subtitle"
          style={{ color: theme ? theme.secondaryText : undefined }}
        >
          Technical deep dives on cloud architecture, DevOps, and building
          this serverless portfolio.
        </p>
      </div>

      <div className="blog-cards-grid">
        {loading && renderSkeleton()}
        {!loading && !error && renderCards()}
        {!loading && error && (
          <p
            className="no-posts-msg"
            style={{ color: theme ? theme.secondaryText : undefined }}
          >
            {error}
          </p>
        )}
      </div>

      <div className="featured-blogs-footer">
        <Link
          to="/blogs"
          className="view-all-link"
          style={{ color: theme ? theme.jacketColor : undefined }}
        >
          View All Posts →
        </Link>
      </div>
    </section>
  );
};

export default FeaturedBlogs;
