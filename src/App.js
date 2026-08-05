import React, { Component } from "react";
import "./App.css";
import Main from "./containers/Main";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";
import { GlobalStyles } from "./global";

/**
 * Resolves the active theme object based on the chosen mode.
 * "system" reads the OS prefers-color-scheme media query.
 */
function resolveTheme(mode) {
  if (mode === "dark") return darkTheme;
  if (mode === "light") return lightTheme;
  // "system" mode: follow OS preference
  if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
    return darkTheme;
  }
  return lightTheme;
}

const STORAGE_KEY = "amrit-theme-preference";

class App extends Component {
  constructor(props) {
    super(props);
    const savedMode = localStorage.getItem(STORAGE_KEY) || "dark";
    this.state = {
      themeMode: savedMode,
      activeTheme: resolveTheme(savedMode),
    };
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleSystemPreferenceChange = this.handleSystemPreferenceChange.bind(
      this
    );
    this.mediaQuery = null;
  }

  componentDidMount() {
    // Attach system preference listener when in "system" mode
    this.mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (this.mediaQuery && this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener(
        "change",
        this.handleSystemPreferenceChange
      );
    }
  }

  componentWillUnmount() {
    // Clean up listener to prevent memory leaks
    if (this.mediaQuery && this.mediaQuery.removeEventListener) {
      this.mediaQuery.removeEventListener(
        "change",
        this.handleSystemPreferenceChange
      );
    }
  }

  handleSystemPreferenceChange() {
    // Only re-resolve if we're in system mode
    if (this.state.themeMode === "system") {
      this.setState({ activeTheme: resolveTheme("system") });
    }
  }

  handleThemeChange(mode) {
    localStorage.setItem(STORAGE_KEY, mode);
    this.setState({
      themeMode: mode,
      activeTheme: resolveTheme(mode),
    });
  }

  render() {
    const { activeTheme, themeMode } = this.state;
    return (
      <ThemeProvider theme={activeTheme}>
        <>
          <GlobalStyles />
          <div>
            <Main
              theme={activeTheme}
              themeMode={themeMode}
              onThemeChange={this.handleThemeChange}
            />
          </div>
        </>
      </ThemeProvider>
    );
  }
}

export default App;
