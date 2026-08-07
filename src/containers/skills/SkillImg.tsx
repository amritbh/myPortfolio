import React from "react";

import { Theme } from "../../types";

interface SkillImgProps {
  src: string;
  alt: string;
  theme: Theme;
}

/**
 * Renders a skill section image from S3 (amrit.cloud/media/).
 * Falls back to the dark-on-dark placeholder gradient if the image fails to load.
 */
function SkillImg({ src, alt, theme }: SkillImgProps) {
  // If the theme is not the pure dark theme, apply the light blend filter
  const isLightMode = theme && theme.body !== "#0D1117";
  const imgClass = `skill-img ${isLightMode ? "skill-img-light-blend" : ""}`;

  return (
    <div className="skill-img-wrapper">
      <img
        src={src}
        alt={alt}
        className={imgClass}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

export default SkillImg;
