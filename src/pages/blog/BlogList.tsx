import React, { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import BlogCard from "../../components/blogCard/BlogCard";
import { fetchBlogs, fetchMediumBlogs } from "../../utils/apiClient";
import "./BlogList.css";
import amritPic from "../../assests/images/amrit-pp.jpg";
import { Theme } from "../../types";

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

interface BlogListProps {
  theme: Theme;
  themeMode: string;
  onThemeChange: (mode: string) => void;
  onToggle: (mode: string) => void;
}

const BlogList: React.FC<BlogListProps> = ({ theme, themeMode, onThemeChange, onToggle }) => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [mediumBlogs, setMediumBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("All");

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    const [fetchedBlogs, fetchedMediumBlogs] = await Promise.all([
      fetchBlogs(),
      fetchMediumBlogs(),
    ]);
    setBlogs(Array.isArray(fetchedBlogs) ? fetchedBlogs : []);
    setMediumBlogs(Array.isArray(fetchedMediumBlogs) ? fetchedMediumBlogs : []);
    setLoading(false);
  };

  const getFilteredBlogs = () => {
    if (activeTopic === "All") return blogs;
    return blogs.filter(
      (b) =>
        b.tags &&
        b.tags.some((t: string) => t.toLowerCase() === activeTopic.toLowerCase())
    );
  };

  const filtered = getFilteredBlogs();

  // Pick trending (top 3 most liked)
  const trending = [...blogs]
    .sort(
      (a, b) =>
        (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0)
    )
    .slice(0, 3);

  return (
    <div className="medium-feed-root" style={{ backgroundColor: theme.body }}>
      <Header
        theme={theme}
        themeMode={themeMode}
        onThemeChange={onThemeChange}
      />

      {/* Topic Filter Bar */}
      <div
        className="medium-topic-bar"
        style={{
          borderBottomColor: theme.compImgHighlight,
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
              onClick={() => setActiveTopic(topic)}
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
                  borderColor: theme.compImgHighlight,
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
          {mediumBlogs.length > 0 && (
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
                {mediumBlogs.map((blog) => (
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
            style={{ borderBottomColor: theme.compImgHighlight }}
          >
            <div className="medium-sidebar-author">
              <img
                src={amritPic}
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
            style={{ borderBottomColor: theme.compImgHighlight }}
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
                    backgroundColor: theme.compImgHighlight,
                    color: theme.text,
                  }}
                  onClick={() => setActiveTopic(topic)}
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
                      style={{ color: theme.compImgHighlight }}
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

      <Footer theme={theme} onToggle={onToggle} />
      <TopButton theme={theme} />
    </div>
  );
};

export default BlogList;
