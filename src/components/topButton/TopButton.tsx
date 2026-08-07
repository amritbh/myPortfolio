import React from "react";
import "./TopButton.css";

interface TopButtonProps {
  theme: {
    body: string;
    text: string;
  };
}

export default function TopButton({ theme }: TopButtonProps) {
  function GoUpEvent() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  function scrollFunction() {
    const topButton = document.getElementById("topButton");
    if (!topButton) return;
    
    if (
      document.body.scrollTop > 30 ||
      document.documentElement.scrollTop > 30
    ) {
      topButton.style.visibility = "visible";
    } else {
      topButton.style.visibility = "hidden";
    }
  }

  window.onscroll = function () {
    scrollFunction();
  };

  const onMouseEnter = (color: string, bgColor: string) => {
    /* For the button */
    const topButton = document.getElementById("topButton");
    if (topButton) {
      topButton.style.color = color;
      topButton.style.backgroundColor = bgColor;
    }

    /* For arrow icon */
    const arrow = document.getElementById("arrow");
    if (arrow) {
      arrow.style.color = color;
      arrow.style.backgroundColor = bgColor;
    }
  };

  const onMouseLeave = (color: string, bgColor: string) => {
    /* For the button */
    const topButton = document.getElementById("topButton");
    if (topButton) {
      topButton.style.color = color;
      topButton.style.backgroundColor = bgColor;
    }

    /* For arrow icon */
    const arrow = document.getElementById("arrow");
    if (arrow) {
      arrow.style.color = color;
      arrow.style.backgroundColor = bgColor;
    }
  };

  return (
    <div
      onClick={GoUpEvent}
      id="topButton"
      style={{
        color: theme.body,
        backgroundColor: theme.text,
        border: `solid 1px ${theme.text}`,
      }}
      title="Go up"
      onMouseEnter={() => onMouseEnter(theme.text, theme.body)}
      onMouseLeave={() => onMouseLeave(theme.body, theme.text)}
    >
      <i className="fas fa-arrow-up" id="arrow" aria-hidden="true" />
    </div>
  );
}
