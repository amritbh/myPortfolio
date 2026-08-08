import React from "react";
import "./AiOpenSourceSection.css";
import { Fade } from "react-reveal";
import { aiOpenSourceData } from "../../portfolio";

interface AiOpenSourceSectionProps {
  theme: {
    text: string;
    highlight: string;
    secondaryText: string;
  };
}

export default function AiOpenSourceSection({ theme }: Readonly<AiOpenSourceSectionProps>) {
  return (
    <div className="ai-trends-main">
      <div className="ai-trends-header-div">
        <Fade bottom duration={2000} distance="20px">
          <h1 className="ai-trends-header" style={{ color: theme.text }}>
            {aiOpenSourceData.title}
          </h1>
        </Fade>
      </div>
      <div className="ai-trends-body-div">
        {aiOpenSourceData.data.map((item) => (
          <Fade bottom duration={2000} distance="40px" key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ai-trend-card"
              style={{ backgroundColor: theme.highlight, display: "block", textDecoration: "none" }}
            >
              <div className="ai-trend-name-div">
                <p className="ai-trend-name" style={{ color: theme.text }}>
                  {item.name}
                </p>
              </div>
              <p className="ai-trend-description" style={{ color: theme.text }}>
                {item.description}
              </p>
              <div className="ai-trend-details">
                <p
                  className="ai-trend-date subTitle"
                  style={{ color: theme.secondaryText }}
                >
                  Released/Trending: {item.releaseDate}
                </p>
              </div>
            </a>
          </Fade>
        ))}
      </div>
    </div>
  );
}
