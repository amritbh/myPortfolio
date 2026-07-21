import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import BlogCard from "../../components/blogCard/BlogCard";
import { fetchBlogs, fetchMediumBlogs } from "../../utils/apiClient";
import "./BlogList.css";

const TOPICS = [
  "All",
  "React",
  "AWS",
  "Terraform",
  "DevOps",
  "Python",
  "Security",
  "Engineering",
];

class BlogList extends Component {
  state = {
    blogs: [],
    mediumBlogs: [],
    loading: true,
    activeTopic: "All",
  };

  componentDidMount() {
    this.loadBlogs();
  }

  loadBlogs = async () => {
    const [blogs, mediumBlogs] = await Promise.all([
      fetchBlogs(),
      fetchMediumBlogs(),
    ]);
    this.setState({
      blogs: Array.isArray(blogs) ? blogs : [],
      mediumBlogs: Array.isArray(mediumBlogs) ? mediumBlogs : [],
      loading: false,
    });
  };

  getFilteredBlogs() {
    const { blogs, activeTopic } = this.state;
    if (activeTopic === "All") return blogs;
    return blogs.filter(
      (b) =>
        b.tags &&
        b.tags.some((t) => t.toLowerCase() === activeTopic.toLowerCase())
    );
  }

  render() {
    const { theme } = this.props;
    const { loading, activeTopic, blogs } = this.state;
    const filtered = this.getFilteredBlogs();

    // Pick trending (top 3 most liked)
    const trending = [...blogs]
      .sort(
        (a, b) =>
          (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0)
      )
      .slice(0, 3);

    return (
      <div className="medium-feed-root" style={{ backgroundColor: theme.body }}>
        <Header theme={theme} />

        {/* Topic Filter Bar */}
        <div
          className="medium-topic-bar"
          style={{
            borderBottomColor: theme.imageDark,
            backgroundColor: theme.body,
          }}
        >
          <div className="medium-topic-bar-inner">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                className={`medium-topic-pill ${
                  activeTopic === topic ? "active" : ""
                }`}
                style={{
                  color:
                    activeTopic === topic ? theme.text : theme.secondaryText,
                  borderBottomColor:
                    activeTopic === topic ? theme.text : "transparent",
                }}
                onClick={() => this.setState({ activeTopic: topic })}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="medium-feed-layout">
          {/* Feed Column */}
          <main className="medium-feed-main">
            {loading ? (
              <div className="medium-feed-loading">
                <div
                  className="medium-spinner"
                  style={{
                    borderColor: theme.imageDark,
                    borderTopColor: theme.text,
                  }}
                />
              </div>
            ) : (
              <div>
                {filtered.length > 0 ? (
                  filtered.map((blog) => (
                    <BlogCard key={blog.slug} blog={blog} theme={theme} />
                  ))
                ) : (
                  <div style={{ color: theme.secondaryText }}>
                    No blogs found for this topic.
                  </div>
                )}
              </div>
            )}

            {/* Medium Blogs Section */}
            {this.state.mediumBlogs.length > 0 && (
              <div style={{ marginTop: "40px" }}>
                <h2
                  style={{
                    color: theme.text,
                    marginBottom: "20px",
                    fontSize: "1.5rem",
                  }}
                >
                  Articles on Medium
                </h2>
                <div className="medium-feed-list">
                  {this.state.mediumBlogs.map((blog) => (
                    <BlogCard key={blog.slug} blog={blog} theme={theme} />
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="medium-feed-sidebar">
            {/* About */}
            <div
              className="medium-sidebar-section"
              style={{ borderBottomColor: theme.imageDark }}
            >
              <div className="medium-sidebar-author">
                <img
                  src="https://avatars.githubusercontent.com/u/79965355?v=4"
                  alt="Amrit Bhattarai"
                  className="medium-sidebar-avatar"
                />
                <div>
                  <p
                    className="medium-sidebar-author-name"
                    style={{ color: theme.text }}
                  >
                    Amrit Bhattarai
                  </p>
                  <p
                    className="medium-sidebar-author-bio"
                    style={{ color: theme.secondaryText }}
                  >
                    Software Engineer · AWS · Terraform · React
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Topics */}
            <div
              className="medium-sidebar-section"
              style={{ borderBottomColor: theme.imageDark }}
            >
              <h3
                className="medium-sidebar-heading"
                style={{ color: theme.text }}
              >
                Recommended topics
              </h3>
              <div className="medium-sidebar-topics">
                {TOPICS.filter((t) => t !== "All").map((topic) => (
                  <button
                    key={topic}
                    className="medium-sidebar-topic-pill"
                    style={{
                      backgroundColor: theme.imageDark,
                      color: theme.text,
                    }}
                    onClick={() => this.setState({ activeTopic: topic })}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Trending */}
            {trending.length > 0 && (
              <div className="medium-sidebar-section">
                <h3
                  className="medium-sidebar-heading"
                  style={{ color: theme.text }}
                >
                  Trending
                </h3>
                <div className="medium-sidebar-trending">
                  {trending.map((blog, i) => (
                    <a
                      key={blog.slug}
                      href={`/blogs/${blog.slug}`}
                      className="medium-trending-item"
                      style={{ textDecoration: "none" }}
                    >
                      <span
                        className="medium-trending-num"
                        style={{ color: theme.imageDark }}
                      >
                        0{i + 1}
                      </span>
                      <div>
                        <p
                          className="medium-trending-title"
                          style={{ color: theme.text }}
                        >
                          {blog.title}
                        </p>
                        <p
                          className="medium-trending-meta"
                          style={{ color: theme.secondaryText }}
                        >
                          {blog.readTime || "5 min read"}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default BlogList;
