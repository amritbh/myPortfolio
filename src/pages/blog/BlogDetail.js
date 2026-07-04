import React, { Component } from "react";
import { marked } from "marked";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import { fetchBlogBySlug } from "../../utils/apiClient";
import "./BlogDetail.css";

class BlogDetail extends Component {
  state = {
    blog: null,
    loading: true,
    error: false,
  };

  async componentDidMount() {
    const slug = this.props.match.params.slug;
    const blog = await fetchBlogBySlug(slug);

    if (blog) {
      this.setState({ blog, loading: false });
    } else {
      this.setState({ error: true, loading: false });
    }
  }

  render() {
    const { theme } = this.props;
    const { blog, loading, error } = this.state;

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
                Cloud Architect & Full Stack Developer
              </p>
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
