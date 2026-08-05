import React, { Component } from "react";
import "./ThemeSwitcher.css";

const MODES = [
  { key: "light", icon: "☀️", label: "Light" },
  { key: "system", icon: "💻", label: "System" },
  { key: "dark", icon: "🌙", label: "Dark" },
];

class ThemeSwitcher extends Component {
  handleKeyDown = (event, mode) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.props.onThemeChange(mode);
    }
  };

  render() {
    const { themeMode, onThemeChange, theme } = this.props;
    const activeIndex = MODES.findIndex((m) => m.key === themeMode);

    return (
      <div
        className="theme-switcher"
        role="radiogroup"
        aria-label="Color theme"
      >
        {/* Desktop: 3-segment pill */}
        <div
          className="theme-switcher-pill"
          style={{ backgroundColor: theme.highlight }}
        >
          {/* Sliding indicator */}
          <div
            className="theme-switcher-indicator"
            style={{
              transform: `translateX(${activeIndex * 100}%)`,
              backgroundColor: theme.imageHighlight,
            }}
          />
          {MODES.map((mode) => (
            <button
              key={mode.key}
              role="radio"
              aria-checked={themeMode === mode.key}
              aria-label={`${mode.label} theme`}
              className={`theme-switcher-btn ${
                themeMode === mode.key ? "active" : ""
              }`}
              style={{
                color: themeMode === mode.key ? "#ffffff" : theme.secondaryText,
              }}
              onClick={() => onThemeChange(mode.key)}
              onKeyDown={(e) => this.handleKeyDown(e, mode.key)}
              type="button"
              id={`theme-btn-${mode.key}`}
            >
              <span className="theme-switcher-icon">{mode.icon}</span>
              <span className="theme-switcher-label">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile: compact icon-only toggle (cycles light → dark → system) */}
        <button
          className="theme-switcher-mobile"
          aria-label={`Current theme: ${themeMode}. Click to cycle theme.`}
          onClick={() => {
            const next =
              MODES[
                (MODES.findIndex((m) => m.key === themeMode) + 1) % MODES.length
              ];
            onThemeChange(next.key);
          }}
          type="button"
          id="theme-toggle-mobile"
          style={{ color: theme.text, borderColor: theme.secondaryText }}
        >
          <span>{MODES.find((m) => m.key === themeMode)?.icon}</span>
        </button>
      </div>
    );
  }
}

export default ThemeSwitcher;
