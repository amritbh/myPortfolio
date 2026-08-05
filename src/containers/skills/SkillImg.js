import React from "react";

/**
 * Renders a skill section image from S3 (amrit.cloud/media/).
 * Falls back to the dark-on-dark placeholder gradient if the image fails to load.
 */
function SkillImg({ src, alt, theme }) {
  return (
    <div className="skill-img-wrapper">
      <img
        src={src}
        alt={alt}
        className="skill-img"
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  );
}

export default SkillImg;
