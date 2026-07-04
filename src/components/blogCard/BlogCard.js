import React from "react";
import { Link } from "react-router-dom";
import "./BlogCard.css";

export default function BlogCard({ blog, theme }) {
  const { title, summary, publishDate, slug, coverImage: imageUrl } = blog;

  return (
    <div>
      <div className="container">
        <div className="square" style={{ backgroundColor: theme.imageDark }}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="blog cover"
              className="blog-card-image mask"
            />
          )}
          <div className="blog-card-title" style={{ color: theme.text }}>
            {title}
          </div>
          <p
            className="blog-card-subtitle"
            style={{ color: theme.secondaryText }}
          >
            {summary}
          </p>
          <p
            className="blog-card-subtitle"
            style={{ color: theme.secondaryText, fontSize: "0.8em" }}
          >
            {new Date(publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div>
            <Link to={`/blogs/${slug}`} className="button">
              Read More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
