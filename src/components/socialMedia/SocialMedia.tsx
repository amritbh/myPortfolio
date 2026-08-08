import React from "react";
import "./SocialMedia.css";
import { socialMediaLinks } from "../../portfolio";
import styled from "styled-components";

const IconWrapper = styled.span<{ backgroundColor: string; theme?: any }>`
  i {
    background-color: ${(props) => props.backgroundColor};
  }
  &:hover i {
    background-color: ${({ theme }) => theme.text};
    transition: 0.3s ease-in;
  }
`;

interface SocialMediaProps {
  theme?: any;
}

export default function socialMedia(props: SocialMediaProps) {
  return (
    <div className="social-media-div">
      {socialMediaLinks.map((media, i) => {
        return (
          <a
            key={media.link}
            href={media.link}
            className={`icon-button`}
            target="_blank"
            rel="noreferrer noopener"
          >
            <IconWrapper {...media} {...props}>
              <i className={`fab ${media.fontAwesomeIcon}`}></i>
            </IconWrapper>
            {/* <span></span> */}
          </a>
        );
      })}
    </div>
  );
}
