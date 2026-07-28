---
name: React Component Patterns
description: Conventions for creating and modifying React components in this portfolio project including class components, theming, routing, file structure, and styling. Use this skill when adding new pages, components, or modifying the frontend UI.
---

# React Component Patterns

This is a **React 16** portfolio app using class components, `styled-components` theming, `react-router-dom` v5, and vanilla CSS.

## Technology Stack

| Technology                  | Version                     | Purpose               |
| --------------------------- | --------------------------- | --------------------- |
| React                       | `^16.10.2`                  | UI library            |
| react-router-dom            | `^5.1.2`                    | Client-side routing   |
| styled-components           | `^5.1.1`                    | Global theme provider |
| react-scripts               | `3.2.0`                     | Build tooling (CRA)   |
| react-helmet                | `^6.1.0`                    | SEO meta tags         |
| react-reveal                | `^1.2.2`                    | Scroll animations     |
| bootstrap / react-bootstrap | `^5.0.2` / `^1.0.0-beta.16` | Layout utilities      |
| baseui                      | `^9.65.3`                   | Some UI components    |
| chart.js / react-chartjs-2  | `^2.9.3` / `^2.9.0`         | Charts                |
| marked                      | `^4.3.0`                    | Markdown rendering    |

### Build Requirement

Node 18 with `--openssl-legacy-provider` flag (already configured in `package.json` scripts).

## File Structure Conventions

```
src/
├── App.js                    # Root component (ThemeProvider wrapper)
├── App.css                   # App-level styles
├── index.js                  # Entry point (ReactDOM.render)
├── index.css                 # Global base styles
├── global.js                 # GlobalStyles (styled-components)
├── theme.js                  # Theme definitions + chosenTheme export
├── portfolio.js              # All portfolio data (950 lines)
│
├── containers/               # Layout/routing containers
│   └── Main.js               # BrowserRouter + Switch with all routes
│
├── pages/                    # Page-level components (one per route)
│   ├── home/
│   ├── blog/                 # BlogList.js, BlogDetail.js, BlogList.css, etc.
│   ├── admin/
│   ├── login/
│   ├── contact/
│   ├── education/
│   ├── experience/
│   ├── opensource/
│   ├── projects/
│   ├── splash/
│   └── errors/
│
├── components/               # Reusable UI components
│   ├── header/
│   ├── footer/
│   ├── blogCard/
│   ├── button/
│   ├── socialMedia/
│   ├── softwareSkills/
│   └── ... (24 component directories)
│
├── utils/                    # Utility modules
│   ├── apiClient.js          # All API calls + session management
│   └── apiClient.test.js     # Tests
│
├── shared/                   # Shared data files
│   ├── contact_data.json
│   ├── experience_data.json
│   └── opensource/
│
├── styles/                   # Additional stylesheets
└── assests/                  # Images and static assets (NOTE: typo is intentional)
```

### ⚠️ Important: The directory is named `assests/` (not `assets/`)

This is a historical typo that's baked into all import paths. Do NOT rename it.

## Component Pattern

### ALL components use Class Components (not hooks/functional)

```jsx
import React, { Component } from "react";
import "./ComponentName.css";

class ComponentName extends Component {
  state = {
    /* ... */
  };

  componentDidMount() {
    /* ... */
  }

  render() {
    const { theme } = this.props;
    return (
      <div>{/* Use theme.body, theme.text, etc. for inline styles */}</div>
    );
  }
}

export default ComponentName;
```

### Each component gets its own directory:

```
src/components/myComponent/
├── MyComponent.js
└── MyComponent.css
```

Or for pages:

```
src/pages/myPage/
├── MyPageComponent.js
└── MyPage.css
```

## Theming

### Theme Provider (`App.js`)

```jsx
<ThemeProvider theme={chosenTheme}>
  <>
    <GlobalStyles />
    <div>
      <Main theme={chosenTheme} />
    </div>
  </>
</ThemeProvider>
```

### Theme Object Shape (from `theme.js`)

```js
{
  body: "#EDF9FE",           // Page background
  text: "#001C55",           // Primary text color
  expTxtColor: "#000a12",    // Experience section text
  highlight: "#A6E1FA",      // Highlight/accent color
  dark: "#00072D",           // Dark variant
  secondaryText: "#7F8DAA",  // Secondary text
  imageHighlight: "#0E6BA8", // Image accent color
  compImgHighlight: "#E6E6E6", // Component image highlight
  jacketColor: "#0A2472",    // Character jacket color
  headerColor: "#0E6BA877",  // Header background (with alpha)
  splashBg: "#001C55",       // Splash screen background
}
```

Currently active theme: `blueTheme` (set via `export const chosenTheme = blueTheme`)

Available themes: blue, brown, purple, green, red, black, pink, violet, teal, orange, yellow, materialDark, materialLight, materialTeal

### Theme is passed as props

Theme flows through: `App.js` → `Main.js` → each page → each component. Access via `this.props.theme`.

## Routing (`containers/Main.js`)

Uses `react-router-dom` v5 with `BrowserRouter`, `Switch`, and `Route`:

```jsx
<BrowserRouter basename="/">
  <Switch>
    <Route path="/" exact render={(props) => <Home {...props} theme={this.props.theme} />} />
    <Route path="/home" render={(props) => <Home {...props} theme={this.props.theme} />} />
    <Route path="/experience" exact render={...} />
    <Route path="/education" render={...} />
    <Route path="/opensource" render={...} />
    <Route path="/login" exact render={...} />
    <Route path="/admin" exact render={...} />
    <Route path="/blogs" exact render={...} />
    <Route path="/blogs/:slug" render={...} />
    <Route path="/contact" render={...} />
    <Route path="/projects" render={...} />
    <Route path="*" render={...} />  {/* 404 catch-all */}
  </Switch>
</BrowserRouter>
```

**Key patterns:**

- All routes use `render` prop (not `component`) to pass `theme`
- Props spread: `{...props}` passes router props (history, match, location)
- Splash screen: conditionally rendered based on `settings.isSplash`
- 404: `Error404` component as catch-all

## Styling

### CSS approach: Vanilla CSS with file-per-component

- No CSS modules, no Tailwind, no CSS-in-JS (except GlobalStyles)
- Import CSS directly: `import "./ComponentName.css"`
- Use `theme` prop for dynamic colors via inline styles

### Global styles (`global.js`)

```js
export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; }
  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    font-family: BlinkMacSystemFont, -apple-system, 'Segoe UI', Roboto, ...;
    transition: all 0.25s linear;
  }
`;
```

## Data-Driven Pages

Most pages render data from `portfolio.js` exports. The data is imported directly:

```jsx
import { skills, experience, degrees } from "../portfolio.js";
```

Blog data comes from `apiClient.js` (API calls or mock fallback).

## Checklist: Adding a New Page

1. Create directory: `src/pages/myPage/`
2. Create `MyPage.js` as a class component extending `Component`
3. Create `MyPage.css` with page-specific styles
4. Accept `theme` prop and use it for dynamic colors
5. Add `<Route>` in `containers/Main.js` with `render` prop passing theme
6. Add navigation link in `components/header/Header.js` if needed
7. Use `react-helmet` for page-specific SEO meta tags
8. Use `react-reveal` for scroll animations if applicable
