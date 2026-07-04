import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import BlogCard from "../../components/blogCard/BlogCard";
import BlogsImg from "./BlogsImg";
import { Fade } from "react-reveal";
import { fetchBlogs } from "../../utils/apiClient";
import "./BlogList.css"; // We will use a dedicated CSS file

class BlogList extends Component {
  state = {
    blogs: [],
    loading: true,
  };

  async componentDidMount() {
    const blogs = await fetchBlogs();
    this.setState({ blogs, loading: false });
  }

  render() {
    const { theme } = this.props;
    const { blogs, loading } = this.state;

    return (
      <div className="blog-list-main" style={{ backgroundColor: theme.body }}>
        <Header theme={theme} />

        {/* Premium Header Section */}
        <div className="blog-header-container">
          <Fade bottom duration={1000} distance="40px">
            <div className="blog-header-flex">
              <div className="blog-header-text">
                <h1 className="blog-title-main" style={{ color: theme.text }}>
                  Articles & Insights
                </h1>
                <p
                  className="blog-subtitle-main"
                  style={{ color: theme.secondaryText }}
                >
                  Documenting my professional journey, technical discoveries,
                  and software engineering experiences.
                </p>
              </div>
              <div className="blog-header-image">
                <BlogsImg theme={theme} />
              </div>
            </div>
          </Fade>
        </div>

        {/* Premium Grid Section */}
        <div className="blog-grid-container">
          {loading ? (
            <div className="blog-detail-loading">
              <div
                className="loader"
                style={{
                  borderColor: theme.text,
                  borderTopColor: theme.imageHighlight,
                }}
              ></div>
            </div>
          ) : (
            <Fade bottom duration={1200} distance="40px">
              <div className="premium-blog-grid">
                {blogs.map((blog) => (
                  <BlogCard key={blog.slug} blog={blog} theme={theme} />
                ))}
              </div>
            </Fade>
          )}
        </div>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default BlogList;
