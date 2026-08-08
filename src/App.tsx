import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import Main from "./containers/Main";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";
import { GlobalStyles } from "./global";
import type { Theme, ThemeMode } from "./types";

const STORAGE_KEY = "amrit-theme-preference";

function resolveTheme(mode: ThemeMode): Theme {
  if (mode === "dark") return darkTheme;
  if (mode === "light") return lightTheme;
  // "system" mode: follow OS preference
  if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
    return darkTheme;
  }
  return lightTheme;
}

const App: React.FC = () => {
  const savedMode = (localStorage.getItem(STORAGE_KEY) || "dark") as ThemeMode;
  const [themeMode, setThemeMode] = useState<ThemeMode>(savedMode);
  const [activeTheme, setActiveTheme] = useState<Theme>(() =>
    resolveTheme(savedMode)
  );
  const mediaQueryRef = useRef<MediaQueryList | null>(null);

  const handleSystemPreferenceChange = useCallback(() => {
    setThemeMode((current) => {
      if (current === "system") {
        setActiveTheme(resolveTheme("system"));
      }
      return current;
    });
  }, []);

  useEffect(() => {
    mediaQueryRef.current = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (mediaQueryRef.current?.addEventListener) {
      mediaQueryRef.current.addEventListener(
        "change",
        handleSystemPreferenceChange
      );
    }
    return () => {
      if (mediaQueryRef.current?.removeEventListener) {
        mediaQueryRef.current.removeEventListener(
          "change",
          handleSystemPreferenceChange
        );
      }
    };
  }, [handleSystemPreferenceChange]);

  const handleThemeChange = useCallback((mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeMode(mode);
    setActiveTheme(resolveTheme(mode));
  }, []);

  return (
    <ThemeProvider theme={activeTheme}>
      <>
        <GlobalStyles />
        <div>
          <Main
            theme={activeTheme}
            themeMode={themeMode}
            onThemeChange={handleThemeChange}
          />
        </div>
      </>
    </ThemeProvider>
  );
};

export default App;
