import React, { Component } from "react";
import { marked } from "marked";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import { fetchBlogBySlug } from "../../utils/contentfulClient";
import "./ContactComponent.css";

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
        <div className="contact-main">
          <Header theme={theme} />
          <div
            style={{
              minHeight: "60vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2 style={{ color: theme.text }}>Loading...</h2>
          </div>
          <Footer theme={theme} onToggle={this.props.onToggle} />
        </div>
      );
    }

    if (error || !blog) {
      return (
        <div className="contact-main">
          <Header theme={theme} />
          <div
            style={{
              minHeight: "60vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2 style={{ color: theme.text }}>Blog post not found!</h2>
          </div>
          <Footer theme={theme} onToggle={this.props.onToggle} />
        </div>
      );
    }

    const { title, publishDate, coverImage, content } = blog.fields;
    const imageUrl = coverImage?.fields?.file?.url || "";

    // Convert Markdown to HTML
    const htmlContent = marked(content || "");

    return (
      <div className="contact-main">
        <Header theme={theme} />

        <div className="basic-contact" style={{ padding: "40px 20px" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1
              style={{
                color: theme.text,
                fontSize: "40px",
                marginBottom: "10px",
              }}
            >
              {title}
            </h1>
            <p style={{ color: theme.secondaryText, marginBottom: "30px" }}>
              {new Date(publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {imageUrl && (
              <img
                src={imageUrl}
                alt="cover"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginBottom: "40px",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            )}

            <div
              className="blog-content"
              style={{
                color: theme.text,
                lineHeight: "1.8",
                fontSize: "1.1rem",
              }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </div>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default BlogDetail;
