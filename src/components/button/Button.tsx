import React from "react";
import "./Button.css";

const onMouseEnter = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, color: string, bgColor: string) => {
  const el = event.target as HTMLAnchorElement;
  el.style.color = color;
  el.style.backgroundColor = bgColor;
};

const onMouseOut = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, color: string, bgColor: string) => {
  const el = event.target as HTMLAnchorElement;
  el.style.color = color;
  el.style.backgroundColor = bgColor;
};

interface ButtonProps {
  text: string;
  className?: string;
  href: string;
  newTab?: boolean;
  theme: {
    body: string;
    text: string;
  };
}

export default function Button({ text, className, href, newTab, theme }: ButtonProps) {
  return (
    <div className={className}>
      <a
        className="main-button"
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer noopener" : undefined}
        style={{
          color: theme.body,
          backgroundColor: theme.text,
          border: `solid 1px ${theme.text}`,
        }}
        onMouseEnter={(event) => onMouseEnter(event, theme.text, theme.body)}
        onMouseOut={(event) => onMouseOut(event, theme.body, theme.text)}
      >
        {text}
      </a>
    </div>
  );
}
