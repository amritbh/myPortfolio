import React, { Component } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import TopButton from "../../components/topButton/TopButton";
import BlogCard from "../../components/blogCard/BlogCard";
import BlogsImg from "./BlogsImg";
import { Fade } from "react-reveal";
import { fetchBlogs } from "../../utils/apiClient";
import "./ContactComponent.css";

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
      <div className="contact-main">
        <Header theme={theme} />

        <div className="basic-contact">
          <Fade bottom duration={1000} distance="40px">
            <div className="blog-heading-div">
              <div className="blog-heading-text-div">
                <h1 className="blog-heading-text" style={{ color: theme.text }}>
                  My Blogs
                </h1>
                <p
                  className="blog-header-detail-text subTitle"
                  style={{ color: theme.secondaryText }}
                >
                  Documenting my professional journey, technical discoveries,
                  and experiences.
                </p>
              </div>
              <div className="blog-heading-img-div">
                <BlogsImg theme={theme} />
              </div>
            </div>
          </Fade>
        </div>

        <div className="blog-main-div">
          <div className="blog-text-div">
            {loading ? (
              <h3 style={{ color: theme.text }}>Loading blogs...</h3>
            ) : (
              <div
                className="blog-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                  padding: "20px",
                }}
              >
                {blogs.map((blog) => (
                  <BlogCard key={blog.slug} blog={blog} theme={theme} />
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer theme={theme} onToggle={this.props.onToggle} />
        <TopButton theme={theme} />
      </div>
    );
  }
}

export default BlogList;
