import React from "react";
import "./TalkCard.css";

interface TalkDetails {
  title: string;
  subtitle: string;
  slides_url: string;
  event_url: string;
}

interface TalkCardProps {
  talkDetails: TalkDetails;
}

export default function TalkCard({ talkDetails }: Readonly<TalkCardProps>) {
  return (
    <div>
      <div className="container">
        <div className="rectangle">
          <div className="diagonal-fill"></div>
          <div className="talk-card-title">{talkDetails.title}</div>
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
