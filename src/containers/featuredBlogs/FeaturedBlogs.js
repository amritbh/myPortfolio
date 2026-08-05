import React, { Component } from "react";
import "./FeaturedBlogs.css";
import { fetchBlogs } from "../../utils/apiClient";
import { Link } from "react-router-dom";

const TAG_COLORS = {
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

function tagColor(tag) {
  return TAG_COLORS[tag] || TAG_COLORS.default;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

class FeaturedBlogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      blogs: [],
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    fetchBlogs()
      .then((allBlogs) => {
        const sorted = [...allBlogs]
          .filter((b) => b.publishDate)
          .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        this.setState({ blogs: sorted.slice(0, 3), loading: false });
      })
      .catch(() => {
        this.setState({ error: "Could not load posts.", loading: false });
      });
  }

  renderSkeleton() {
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
  }

  renderCards() {
    const { blogs } = this.state;
    const theme = this.props.theme;

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
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="blog-tag"
                  style={{
                    backgroundColor: `${tagColor(tag)}22`,
                    color: tagColor(tag),
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
              style={{ color: theme ? theme.secondaryText : undefined }}
            >
              {blog.summary || blog.excerpt || ""}
            </p>
            <div className="blog-card-meta">
              <span
                className="blog-meta-date"
                style={{ color: theme ? theme.secondaryText : undefined }}
              >
                {formatDate(blog.publishDate)}
              </span>
              {blog.readTime && (
                <span
                  className="blog-meta-read"
                  style={{ color: theme ? theme.secondaryText : undefined }}
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
  }

  render() {
    const { loading, error } = this.state;
    const theme = this.props.theme;

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
          {loading && this.renderSkeleton()}
          {!loading && !error && this.renderCards()}
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
  }
}

export default FeaturedBlogs;
