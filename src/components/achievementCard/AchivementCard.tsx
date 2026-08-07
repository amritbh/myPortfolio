import React from "react";

interface FooterLink {
  name: string;
  url: string;
}

interface AchievementCardInfo {
  image: string;
  title: string;
  description: string;
  footer: FooterLink[];
}

interface AchievementCardProps {
  cardInfo: AchievementCardInfo;
}

export default function AchivementCard({ cardInfo }: AchievementCardProps) {

  return (
    <div className="certificate-card">
      <div className="certificate-image-div">
        <img src={cardInfo.image} alt="PWA" className="card-image"></img>
      </div>
      <div className="certificate-detail-div">
        <h5 className="card-title">{cardInfo.title}</h5>
        <p className="card-subtitle">{cardInfo.description}</p>
      </div>
      <div className="certificate-card-footer">
        {cardInfo.footer.map((v) => {
          return (
            <a 
              key={v.name} 
              href={v.url} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {v.name}
            </a>
          );
        })}
      </div>
    </div>
  );
}
