---
name: Theme Switcher System
description: Architecture and conventions for the 3-mode (Light/System/Dark) theme switcher. Use this skill when modifying App.js theme state, adding new theme tokens, updating the ThemeSwitcher component, or debugging theme persistence issues.
---

# Theme Switcher System

The site supports three theme modes: **Light**, **System**, and **Dark**. The user's preference is persisted in `localStorage` and applied globally via a state-driven `App.js` class component.

## Theme Modes

| Mode     | Behavior                                                               |
| -------- | ---------------------------------------------------------------------- |
| `light`  | Always uses `lightTheme` (alias for `blueTheme`)                       |
| `dark`   | Always uses `darkTheme` (rich GitHub-dark palette)                     |
| `system` | Reads OS `prefers-color-scheme`; auto-switches when OS setting changes |

**localStorage key:** `amrit-theme-preference`  
**Default on first visit:** `"system"`

## Theme Objects (`src/theme.js`)

All themes have the **same shape**. Theme properties:

```js
{
  body: string,            // Page background
  text: string,            // Primary text
  expTxtColor: string,     // Experience section text
  highlight: string,       // Hover/accent highlight color
  dark: string,            // Dark variant
  secondaryText: string,   // Muted/secondary text
  imageHighlight: string,  // Image accent
  compImgHighlight: string,// Component image highlight
  jacketColor: string,     // Character jacket (illustration)
  headerColor: string,     // Header background (with alpha)
  splashBg: string,        // Splash screen background
}
```

### Active Themes

| Export        | Maps to                      | Usage                                           |
| ------------- | ---------------------------- | ----------------------------------------------- |
| `lightTheme`  | `blueTheme`                  | Light mode                                      |
| `darkTheme`   | new dark palette             | Dark mode                                       |
| `chosenTheme` | **deprecated static export** | Do not use — kept for legacy compatibility only |

### Dark Theme Palette

```js
export const darkTheme = {
  body: "#0D1117", // GitHub-dark background
  text: "#E6EDF3", // Near-white text
  expTxtColor: "#C9D1D9",
  highlight: "#1F3A5F", // Deep navy
  dark: "#010409",
  secondaryText: "#8B949E", // Muted blue-gray
  imageHighlight: "#58A6FF", // Bright blue accent
  compImgHighlight: "#21262D",
  jacketColor: "#388BFD",
  headerColor: "#161B2277", // Semi-transparent dark header
  splashBg: "#010409",
};
```

## App.js State Architecture

`App.js` is a **class component** (matching codebase convention) with state:

```js
state = {
  themeMode: "system", // "light" | "dark" | "system"
  activeTheme: lightTheme,
};
```

### Lifecycle

```
componentDidMount:
  1. Read localStorage.getItem("amrit-theme-preference")
  2. Fall back to "system" if null
  3. If mode is "system": attach window.matchMedia listener
  4. Resolve and set activeTheme

componentWillUnmount:
  - Remove matchMedia listener (prevent memory leak)
```

### Theme Resolution

```js
resolveTheme(mode) {
  if (mode === "dark") return darkTheme;
  if (mode === "light") return lightTheme;
  // "system"
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? darkTheme : lightTheme;
}
```

### Prop Flow

```
App (state: themeMode, activeTheme)
  └── ThemeProvider theme={activeTheme}
  └── Main theme={activeTheme} themeMode={themeMode} onThemeChange={fn}
        └── Header theme={...} themeMode={...} onThemeChange={...}
              └── ThemeSwitcher themeMode={...} onThemeChange={...} theme={...}
        └── (all pages) theme={activeTheme}
```

## ThemeSwitcher Component

**Location:** `src/components/themeSwitcher/ThemeSwitcher.js`

**Props:**

```js
{
  themeMode: "light" | "dark" | "system",
  onThemeChange: (mode: string) => void,
  theme: ThemeObject,
}
```

**Desktop UI:** 3-segment pill `[ ☀️ Light ] [ 💻 System ] [ 🌙 Dark ]`

- ARIA: `role="radiogroup"` wrapper, each button has `role="radio"` and `aria-checked`
- Active segment: accent background, white text
- Animated sliding indicator between segments

**Mobile UI (< 768px):** Icon-only toggle (☀️ / 🌙), no "System" label. Tapping cycles: light → dark → system.

## Checklist: Adding a New Theme Color Token

1. Add the property to **all** theme objects in `src/theme.js` (all 14 themes + `darkTheme`)
2. Update the `Theme` interface in `src/types/index.ts` (after Sprint 5 TypeScript migration)
3. Use the token via `this.props.theme.newToken` in components

## Checklist: Debugging Theme Issues

- **Theme not persisting across reload:** Check `localStorage.getItem("amrit-theme-preference")` in devtools
- **System mode not switching:** Verify `matchMedia` listener is attached and removed in lifecycle
- **Dark mode white boxes:** The component is using a hardcoded color instead of `theme.body` or `theme.text` — find and replace with theme prop
- **SSR/hydration flash:** Not applicable (this is a CRA SPA), but if migrating to Next.js later, add `suppressHydrationWarning`

## Test Requirements

**File:** `src/components/themeSwitcher/ThemeSwitcher.test.js`

- Renders all 3 segments (Light, System, Dark)
- Clicking "Dark" calls `onThemeChange("dark")`
- `localStorage` is read on mount; stored preference is applied
- System mode: mock `window.matchMedia` and verify dark/light resolves correctly
- Mobile: at narrow viewport, icon-only toggle renders

```bash
npm test -- --coverage
```
