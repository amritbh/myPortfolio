import React from "react";
import "./TalkCard.css";

export default function TalkCard({ talkDetails }) {
  return (
    <div>
      <div class="container">
        <div class="rectangle">
          <div class="diagonal-fill"></div>
          <div class="talk-card-title">{talkDetails.title}</div>
          <p className="talk-card-subtitle">{talkDetails.subtitle}</p>

          <div className="card-footer-button-div">
            <a
              href={talkDetails.slides_url}
              target="_blank"
              rel="noreferrer noopener"
              className="talk-button"
            >
              Slides
            </a>
            <a
              href={talkDetails.event_url}
              target="_blank"
              rel="noreferrer noopener"
              className="talk-button"
            >
              Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
