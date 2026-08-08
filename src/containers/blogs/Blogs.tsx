// @ts-nocheck
import React from "react";
import "./Blog.css";
import BlogCard from "../../components/blogCard/BlogCard";
import { blogSection } from "../../portfolio";

export default function Blogs() {
  return (
    <div className="main" id="blogs">
      <div className="blog-header">
        <h1 className="blog-header-text">{blogSection.title}</h1>
        <p className="subTitle blog-subtitle">{blogSection.subtitle}</p>
      </div>
      <div className="blog-main-div">
        <div className="blog-text-div">
          {blogSection.blogs.map((blog) => {
            return (
              <BlogCard
                key={blog.url}
                blog={{
                  slug: blog.url,
                  coverImage: blog.image,
                  title: blog.title,
                  summary: blog.description,
                  publishDate: new Date().toISOString(),
                }}
                theme={{
                  compImgHighlight: "#ffffff",
                  text: "#000000",
                  secondaryText: "#333333"
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
