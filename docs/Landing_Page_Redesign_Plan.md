# Landing Page Redesign — Sprint Plan

**Project:** amrit.cloud landing page redesign  
**Status:** Ready to implement  
**Created:** 2026-08-04  
**Total Sprints:** 4  
**Estimated total effort:** ~4 focused sessions

---

## Overview

| Sprint   | Focus                          | Key Deliverable                          |
| -------- | ------------------------------ | ---------------------------------------- |
| Sprint 1 | Theme Switcher System          | Dark/Light/System mode working site-wide |
| Sprint 2 | Hero Redesign + Content        | Cinematic landing hero with identity     |
| Sprint 3 | Blog Preview + Travel Sections | Featured blogs and travel teaser live    |
| Sprint 4 | Travel Page + Footer           | `/travel` page and newsletter signup UI  |

---

## Architecture Decisions (Locked)

- **Travel content:** `/travel` page on main site (not `travel.amrit.cloud`) — migrate later when 20+ posts exist
- **Theme persistence:** `localStorage` key `amrit-theme-preference`
- **Dark theme palette:** Rich GitHub-dark style (not flat black)
- **All components:** Class components (React 16 convention)
- **Styling:** Vanilla CSS per-component, no Tailwind

---

## Sprint 1 — Theme Switcher System

**Goal:** Replace the hardcoded `blueTheme` with a live 3-mode (Light / System / Dark) switcher visible in the header. This is the foundation for everything else — do this first so dark mode works for every change in later sprints.

**Branches suggestion:** `feat/theme-switcher`

### Acceptance Criteria

- [ ] Clicking Light / System / Dark in the nav applies the theme instantly
- [ ] Theme persists across page refresh (localStorage)
- [ ] System mode auto-switches when OS dark mode toggles
- [ ] All existing pages look correct in dark mode (no white boxes or unreadable text)
- [ ] Mobile: collapses to icon-only toggle
- [ ] Tests passing, coverage above 80%

### Tasks

#### 1.1 — Add `darkTheme` to `src/theme.js`

**File:** [theme.js](file:///Users/breeze/workspace/myPortfolio/src/theme.js)

Add after the existing themes:

```js
export const darkTheme = {
  body: "#0D1117", // GitHub-dark background
  text: "#E6EDF3", // Near-white primary text
  expTxtColor: "#C9D1D9",
  highlight: "#1F3A5F", // Deep navy highlight
  dark: "#010409",
  secondaryText: "#8B949E", // Muted blue-gray
  imageHighlight: "#58A6FF", // Bright blue accent
  compImgHighlight: "#21262D",
  jacketColor: "#388BFD",
  headerColor: "#161B2277", // Semi-transparent dark header
  splashBg: "#010409",
};

export const lightTheme = blueTheme; // Named alias for clarity
```

---

#### 1.2 — Convert `src/App.js` to state-driven theming

**File:** [App.js](file:///Users/breeze/workspace/myPortfolio/src/App.js)

Convert from functional to class component. Add state `{ themeMode, activeTheme }`.

Logic:

- `componentDidMount`: read from `localStorage`, fall back to `"system"`
- `"system"` mode: detect via `window.matchMedia("(prefers-color-scheme: dark)")` and listen for changes
- `handleThemeChange(mode)`: update state + persist to `localStorage`
- Pass `activeTheme`, `themeMode`, `onThemeChange` down to `<Main>`

```
State shape:
{
  themeMode: "light" | "dark" | "system",
  activeTheme: lightTheme | darkTheme   // resolved from mode
}
```

---

#### 1.3 — Create `ThemeSwitcher` component

**Files (NEW):**

- `src/components/themeSwitcher/ThemeSwitcher.js`
- `src/components/themeSwitcher/ThemeSwitcher.css`

UI: 3-segment pill selector

```
[ ☀️ Light ]  [ 💻 System ]  [ 🌙 Dark ]
```

Props: `{ themeMode, onThemeChange, theme }`

Behavior:

- Active segment has accent background + white text
- Animated sliding pill underline/highlight indicator
- ARIA: `role="radiogroup"` with `role="radio"` buttons
- On mobile (width < 768px): renders as a simple `☀️ / 🌙` icon toggle (no "System" label, just auto)

---

#### 1.4 — Wire ThemeSwitcher into Header

**Files:**

- [Header.js](file:///Users/breeze/workspace/myPortfolio/src/components/header/Header.js) — import and render `<ThemeSwitcher>` as the last item in the nav `<ul>`, right-aligned
- [Main.js](file:///Users/breeze/workspace/myPortfolio/src/containers/Main.js) — accept `themeMode` and `onThemeChange` props, pass to Header

Remove the dead `ToggleSwitch` from `Footer.js` (it was never wired up).

---

#### 1.5 — Write tests

**File (NEW):** `src/components/themeSwitcher/ThemeSwitcher.test.js`

- Renders all 3 segments
- Click "Dark" applies dark theme callback
- localStorage is read on mount and persisted on change
- System mode: mock `matchMedia` and verify correct theme resolves

**Update:** `src/components/header/Header.test.js`

- Assert ThemeSwitcher is present in the rendered header

**Verify:**

```bash
npm test -- --coverage
```

---

## Sprint 2 — Hero Section Redesign

**Goal:** Transform the flat `<Greeting>` section into a cinematic, split-screen hero that immediately communicates who Amrit is — engineer, trekker, writer — and creates a premium first impression.

**Prerequisite:** Sprint 1 complete (dark mode must work before restyling)

**Branch suggestion:** `feat/hero-redesign`

### Acceptance Criteria

- [ ] Hero renders the split-screen layout (text left, photo right)
- [ ] Gradient name text visible in both light and dark mode
- [ ] Identity chips animate in sequentially on page load
- [ ] Stats bar (5+ Treks, 10+ Yrs, Active Writer) visible below photo
- [ ] All 3 CTA buttons functional (Blog, Resume, GitHub)
- [ ] Nepal-flag-inspired gradient ring animates around profile photo
- [ ] Fully responsive: stacks vertically on mobile (photo first)
- [ ] Passes existing `npm test -- --coverage`

### Tasks

#### 2.1 — Update `portfolio.js` content

**File:** [portfolio.js](file:///Users/breeze/workspace/myPortfolio/src/portfolio.js)

Update the `greeting` object:

```js
const greeting = {
  title: "Amrit Bhattarai",
  logo_name: "AmritBhattarai",
  subTitle:
    "Sr. Cloud Architect at HP, building Agentic AI systems and cloud infrastructure at scale. Nepal born, Oregon based. I write technical blogs and document adventures from Himalayan trails to Oregon coastlines.",
  resumeLink:
    "https://drive.google.com/file/d/1wu7cCnwAQny08dUcX5mnCoPap-2R4Yql/view",
  portfolio_repository: "https://github.com/amritbh/myPortfolio",
  githubProfile: "https://github.com/amritbh",
  heroChips: [
    { icon: "☁️", label: "Cloud Architect @ HP" },
    { icon: "🏔️", label: "Nepal Trekker" },
    { icon: "✍️", label: "Technical Blogger" },
  ],
  heroStats: [
    { value: "5+", label: "Himalayan Treks" },
    { value: "10+", label: "Yrs Engineering" },
    { value: "Active", label: "Writer" },
  ],
};
```

---

#### 2.2 — Redesign `Greeting.js`

**File:** [Greeting.js](file:///Users/breeze/workspace/myPortfolio/src/containers/greeting/Greeting.js)

New layout (class component, existing functional component style is already fine):

```
<section class="hero-section">
  <div class="hero-text-col">
    <p class="hero-greeting-label">Hi, I'm</p>
    <h1 class="hero-name gradient-text">Amrit Bhattarai</h1>
    <div class="hero-chips">
      {greeting.heroChips.map chip => <span class="chip">icon label</span>}
    </div>
    <p class="hero-subtitle">{greeting.subTitle}</p>
    <div class="hero-cta-row">
      <Link to="/blogs" class="btn-primary">Read My Blog</Link>
      <a href={resumeLink} class="btn-outlined">View Resume</a>
      <a href={githubRepo} class="btn-ghost">⭐ Star on GitHub</a>
    </div>
    <SocialMedia theme={theme} />
  </div>
  <div class="hero-photo-col">
    <div class="hero-photo-ring">
      <img src={heroImage} class="hero-photo" />
    </div>
    <div class="hero-stats-bar">
      {greeting.heroStats.map stat => <div class="stat"><span class="stat-val">{val}</span><span>{label}</span></div>}
    </div>
  </div>
</section>
```

---

#### 2.3 — Redesign `Greeting.css`

**File:** [Greeting.css](file:///Users/breeze/workspace/myPortfolio/src/containers/greeting/Greeting.css)

Key styles:

- `.hero-section` — `display: flex`, `min-height: 85vh`, section padding, subtle gradient background overlay
- `.hero-name.gradient-text` — `background: linear-gradient(135deg, theme-accent, theme-secondary)` with `background-clip: text; -webkit-text-fill-color: transparent`
- `.hero-chips` — flex row, each `.chip` has border, border-radius pill, slight hover scale transform
- `.chip` — staggered animation delays (`nth-child` based) for sequential appear
- `.hero-photo-ring` — `border-radius: 50%`, animated `conic-gradient` rotation ring (Nepal crimson `#DC143C` and blue `#003893`)
- `.hero-stats-bar` — 3-column flex below photo, compact stat values
- `.btn-primary` — filled, accent background, white text, hover lift
- `.btn-outlined` — transparent background, accent border, hover fill
- `.btn-ghost` — minimal, text only, hover underline
- Mobile (`max-width: 768px`): `.hero-section` becomes `flex-direction: column-reverse` (photo first)

---

## Sprint 3 — Featured Blogs Preview + Travel Teaser

**Goal:** Add two new home page sections. The blogs preview gives visitors a direct path to technical content. The travel teaser introduces the Nepal identity and builds anticipation.

**Prerequisite:** Sprint 2 complete

**Branch suggestion:** `feat/home-sections`

### Acceptance Criteria

- [ ] "Latest from the Blog" section shows 3 most recent posts with loading skeleton
- [ ] Blog cards show title, excerpt, tags, read time, date
- [ ] "View All Posts →" links to `/blogs`
- [ ] Travel Teaser shows destination chips, Nepal card, USA card, motorcycling strip
- [ ] Both sections render correctly in light and dark mode
- [ ] Tests: FeaturedBlogs and TravelTeaser components covered
- [ ] `npm test -- --coverage` passes above 80%

### Tasks

#### 3.1 — Create `FeaturedBlogs` component

**Files (NEW):**

- `src/containers/featuredBlogs/FeaturedBlogs.js`
- `src/containers/featuredBlogs/FeaturedBlogs.css`

Logic:

- `componentDidMount`: call existing `fetchBlogs()` from `apiClient.js`
- Take first 3 results by `publishDate` descending
- State: `{ blogs: [], loading: true, error: null }`

Card design:

- Cover color strip (use tag-based color mapping or blog `coverImage` if present)
- Title (2-line clamp), short excerpt (3-line clamp)
- Tag pills, read time, date
- Hover: card lifts with shadow, "Read More →" appears

Section layout:

- Headline: "Latest from the Blog"
- 3-column grid (collapses to 1 col on mobile)
- Loading: 3 skeleton cards (CSS animated shimmer)
- Error/empty: "No posts yet — check back soon!" message
- Footer of section: right-aligned "View All Posts →" button to `/blogs`

---

#### 3.2 — Create `TravelTeaser` component

**Files (NEW):**

- `src/containers/travelTeaser/TravelTeaser.js`
- `src/containers/travelTeaser/TravelTeaser.css`

Add `travelData` export to `portfolio.js`:

```js
export const travelData = {
  tagline:
    "From the trails of the Himalayas to the roads of Oregon, I document every journey.",
  destinations: {
    nepal: [
      "ABC",
      "Tilicho Lake",
      "Gosaikunda",
      "Mustang",
      "Pokhara",
      "Badimalika",
      "Aama Yangri",
    ],
    usa: ["Oregon", "Pacific Coast", "Crater Lake"],
    moto: ["Nepal Mountain Roads"],
  },
  nepalCard: {
    icon: "🏔️",
    title: "Himalayan Adventures",
    subtitle: "7+ Trek Destinations",
    link: "/travel",
  },
  usaCard: {
    icon: "🇺🇸",
    title: "Exploring America",
    subtitle: "Oregon and beyond, since 2023",
    link: "/travel",
  },
  motoStrip: {
    icon: "🏍️",
    label: "Also: Motorcycling through Nepal's mountain roads",
    link: "/travel",
  },
};
```

Section design:

- Full-width background with subtle mountain silhouette SVG (inline, theme-aware opacity)
- Section headline: "Beyond the Code"
- Subtitle from `travelData.tagline`
- Scrollable chip row of all destinations
- 2-column card grid: Nepal card (crimson left border) and USA card (blue left border)
- Motorcycling strip below: full-width muted banner with moto icon
- "Coming Soon — Posts in Progress" badge with subscribe anchor link to footer

---

#### 3.3 — Update `HomeComponent.js`

**File:** [HomeComponent.js](file:///Users/breeze/workspace/myPortfolio/src/pages/home/HomeComponent.js)

```jsx
import FeaturedBlogs from "../../containers/featuredBlogs/FeaturedBlogs";
import TravelTeaser from "../../containers/travelTeaser/TravelTeaser";

// render():
<Header theme={theme} />
<Greeting theme={theme} />
<FeaturedBlogs theme={theme} />
<Skills theme={theme} />
<TravelTeaser theme={theme} />
<Footer theme={theme} />
<TopButton theme={theme} />
```

---

#### 3.4 — Write tests

**Files (NEW):**

- `src/containers/featuredBlogs/FeaturedBlogs.test.js`

  - Mock `fetchBlogs()` — assert 3 cards render
  - Renders skeleton on loading state
  - Renders empty state message when API returns `[]`
  - "View All Posts" link points to `/blogs`

- `src/containers/travelTeaser/TravelTeaser.test.js`
  - All destination chips render
  - Nepal card and USA card present
  - Motorcycling strip present
  - Links to `/travel`

**Verify:**

```bash
npm test -- --coverage
```

---

## Sprint 4 — Travel Page + Footer Enhancement

**Goal:** Ship the `/travel` page introducing Nepal and USA travel content, add "Travel" to the nav, and enhance the footer with newsletter signup UI (frontend only — no backend wiring yet).

**Prerequisite:** Sprint 3 complete

**Branch suggestion:** `feat/travel-and-footer`

### Acceptance Criteria

- [ ] `/travel` route renders the full travel page
- [ ] "Travel" link appears in the header nav (between Blog and Contact Me)
- [ ] Trek cards for all 7 Nepal destinations are visible with "Coming Soon" badges
- [ ] Motorcycling section and USA section both present
- [ ] Nepal tourism support note visible
- [ ] Footer has newsletter form (email input + Subscribe button)
- [ ] Subscribe form shows confirmation toast/message on submit (no backend)
- [ ] Footer has quick links: Home, Blog, Travel, Contact
- [ ] All pages render correctly at 375px, 768px, 1280px
- [ ] Tests passing, coverage above 80%

### Tasks

#### 4.1 — Create `/travel` page

**Files (NEW):**

- `src/pages/travel/TravelPage.js`
- `src/pages/travel/Travel.css`

Page sections (top to bottom):

**Hero:**

- Full-width, gradient background using Nepal flag colors as accent
- `<h1>` "Adventures and Journeys"
- Subtitle: "Nepal born. Mountain shaped. Documenting every trail, road, and horizon."
- Scroll-down indicator arrow

**Nepal Treks section** (`id="nepal"`):

- Section heading: "Himalayan Treks"
- Intro: "From the iconic Annapurna Base Camp to the remote trails of Mustang, these are the routes that shaped me."
- Grid of trek cards — one per destination:
  - ABC (Annapurna Base Camp)
  - Tilicho Lake
  - Gosaikunda
  - Mustang (Upper Mustang)
  - Pokhara
  - Badimalika
  - Aama Yangri
- Each card: destination name, emoji, a one-line description, elevation badge, "Coming Soon" status badge

**Motorcycling section** (`id="moto"`):

- Section heading: "On Two Wheels"
- Brief: "Nepal's mountain roads on a motorcycle — raw, remote, and unforgettable."
- Single featured card with moto icon + "Posts coming soon"

**USA Travel section** (`id="usa"`):

- Section heading: "Exploring America"
- Brief: "Moved to Oregon in 2023. Discovering the Pacific Northwest and beyond."
- Cards: Oregon, Pacific Coast (more TBD)
- Each card: "Coming Soon" badge

**Nepal Tourism Support note:**

- A styled callout box: "I aim to share these trails to inspire and support Nepal tourism. If you love the Himalayas, share these posts when they go live."

**Subscribe CTA:**

- "Get notified when new travel posts go live" + anchor link to footer newsletter section

---

#### 4.2 — Wire `/travel` into router and nav

**File:** [Main.js](file:///Users/breeze/workspace/myPortfolio/src/containers/Main.js)

```jsx
import TravelPage from "../pages/travel/TravelPage";
// Inside <Switch>:
<Route
  path="/travel"
  render={(props) => <TravelPage {...props} theme={this.props.theme} />}
/>;
```

**File:** [Header.js](file:///Users/breeze/workspace/myPortfolio/src/components/header/Header.js)

Add nav `<li>` for "Travel" → `/travel` between "Blog" and "Contact Me" (same pattern as existing links).

---

#### 4.3 — Enhance `Footer.js` with newsletter UI

**File:** [Footer.js](file:///Users/breeze/workspace/myPortfolio/src/components/footer/Footer.js)

New 3-row footer structure:

```
Row 1 (newsletter):
  "Stay updated on new posts"
  [ email input ]  [ Subscribe → ]
  (on submit: show "Thanks! You'll be notified." — no backend yet)

Row 2 (quick links + social):
  Left: Home | Blog | Travel | Contact
  Right: social icon links (GitHub, LinkedIn, YouTube, Gmail, X)

Row 3 (copyright):
  Made with ❤️ by Amrit Bhattarai · © 2024–2026
```

**State:** `{ email: "", submitted: false }`  
On submit with non-empty email: set `submitted: true`, show confirmation, clear field.

**File:** [Footer.css](file:///Users/breeze/workspace/myPortfolio/src/components/footer/Footer.css)

- `.footer-newsletter-row` — centered, max-width 480px, pill input + button
- `.footer-links-row` — flex space-between, nav links + social icons inline
- `.footer-copyright` — centered, secondary text color, small font
- Dark mode: footer gets a subtle top border `1px solid theme.highlight`

---

#### 4.4 — Write tests

**Files (NEW):**

- `src/pages/travel/TravelPage.test.js`
  - Renders all 4 sections (Nepal Treks, Motorcycling, USA, Subscribe CTA)
  - All 7 trek card names visible
  - "Coming Soon" badges present

**Update:** `src/components/header/Header.test.js`

- Assert "Travel" link to `/travel` is present

**Update:** `src/components/footer/Footer.test.js` (create if not exists)

- Newsletter input present
- Submit with email shows confirmation message
- Quick links present: Home, Blog, Travel, Contact

**Verify:**

```bash
npm test -- --coverage
```

---

## Git Workflow (Per AGENTS.md Rules)

Before starting each sprint:

```bash
gh pr status            # check if current branch PR is merged
git checkout main
git pull
git checkout -b feat/sprint-name
```

Never push to `main`. Create a Draft PR for each sprint:

```bash
gh pr create --draft --title "Sprint N: ..." --body "..."
```

---

## Sprint Dependency Map

```
Sprint 1 (Theme Switcher)
    ↓
Sprint 2 (Hero Redesign)
    ↓
Sprint 3 (Blog Preview + Travel Teaser)
    ↓
Sprint 4 (Travel Page + Footer)
    ↓
Sprint 5 (Stack Modernization — separate initiative, post-redesign)
```

Each sprint is independently deployable and mergeable. Do not start a sprint until the previous one is merged to `main`.

---

## File Change Summary (All Sprints)

| Sprint | File                                                 | Action                                            |
| ------ | ---------------------------------------------------- | ------------------------------------------------- |
| 1      | `src/theme.js`                                       | MODIFY — add `darkTheme`, `lightTheme` alias      |
| 1      | `src/App.js`                                         | MODIFY — state-driven theme, localStorage         |
| 1      | `src/components/themeSwitcher/ThemeSwitcher.js`      | NEW                                               |
| 1      | `src/components/themeSwitcher/ThemeSwitcher.css`     | NEW                                               |
| 1      | `src/components/themeSwitcher/ThemeSwitcher.test.js` | NEW                                               |
| 1      | `src/components/header/Header.js`                    | MODIFY — add ThemeSwitcher                        |
| 1      | `src/containers/Main.js`                             | MODIFY — pass theme props                         |
| 2      | `src/portfolio.js`                                   | MODIFY — `greeting` content, heroChips, heroStats |
| 2      | `src/containers/greeting/Greeting.js`                | MODIFY — cinematic hero                           |
| 2      | `src/containers/greeting/Greeting.css`               | MODIFY — hero styles                              |
| 3      | `src/portfolio.js`                                   | MODIFY — add `travelData` export                  |
| 3      | `src/containers/featuredBlogs/FeaturedBlogs.js`      | NEW                                               |
| 3      | `src/containers/featuredBlogs/FeaturedBlogs.css`     | NEW                                               |
| 3      | `src/containers/featuredBlogs/FeaturedBlogs.test.js` | NEW                                               |
| 3      | `src/containers/travelTeaser/TravelTeaser.js`        | NEW                                               |
| 3      | `src/containers/travelTeaser/TravelTeaser.css`       | NEW                                               |
| 3      | `src/containers/travelTeaser/TravelTeaser.test.js`   | NEW                                               |
| 3      | `src/pages/home/HomeComponent.js`                    | MODIFY — add new sections                         |
| 4      | `src/pages/travel/TravelPage.js`                     | NEW                                               |
| 4      | `src/pages/travel/Travel.css`                        | NEW                                               |
| 4      | `src/pages/travel/TravelPage.test.js`                | NEW                                               |
| 4      | `src/containers/Main.js`                             | MODIFY — add `/travel` route                      |
| 4      | `src/components/header/Header.js`                    | MODIFY — add Travel nav link                      |
| 4      | `src/components/footer/Footer.js`                    | MODIFY — newsletter + quick links                 |
| 4      | `src/components/footer/Footer.css`                   | MODIFY — footer layout styles                     |

**Total: 25 file changes across 4 sprints**

---

## Sprint 5 — Stack Modernization (Post-Redesign Initiative)

**Goal:** After all 4 redesign sprints are live and stable, modernize the entire technology stack in one clean sweep. Do NOT attempt this during the redesign — it would create too much churn.

**Branch suggestion:** `feat/stack-modernization`

### Why this sprint exists

The current stack carries significant technical debt:

| Debt            | Current                                | Target                                         |
| --------------- | -------------------------------------- | ---------------------------------------------- |
| Build tool      | CRA `react-scripts@3.2.0` (deprecated) | Vite (actively maintained, 10x faster HMR)     |
| React version   | 16.10.2                                | 18.x (concurrent features, automatic batching) |
| Component style | Class components                       | Functional components + Hooks                  |
| Type safety     | Plain JavaScript                       | TypeScript                                     |
| Node workaround | `--openssl-legacy-provider` flag       | No longer needed on modern tooling             |

Typescript is worth it in the long run, but doing it on top of the old CRA + React 16 + class components stack is painful. The right move is to upgrade everything together so TypeScript feels natural from day one.

### Why TypeScript specifically

Once on the modern stack, TypeScript protects the areas of this codebase most prone to silent bugs:

```typescript
// portfolio.js data shapes — currently untyped, easy to add wrong keys
interface HeroChip {
  icon: string;
  label: string;
}
interface GreetingData {
  title: string;
  subTitle: string;
  heroChips: HeroChip[];
  heroStats: { value: string; label: string }[];
}

// Blog API response — currently any[], field typos go undetected
interface Blog {
  slug: string;
  title: string;
  summary: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
}

// Theme — currently passed as untyped prop through every component
interface Theme {
  body: string;
  text: string;
  secondaryText: string;
  highlight: string;
  imageHighlight: string;
  headerColor: string;
  // ...
}
```

### Acceptance Criteria

- [ ] CRA removed, Vite configured (`vite.config.ts`)
- [ ] All source files renamed from `.js` / `.jsx` to `.ts` / `.tsx`
- [ ] `tsconfig.json` configured with strict mode
- [ ] All class components converted to functional components with hooks
- [ ] `portfolio.js` → `portfolio.ts` with full TypeScript interfaces
- [ ] `apiClient.js` → `apiClient.ts` with typed Blog and response interfaces
- [ ] `theme.js` → `theme.ts` with `Theme` interface
- [ ] `App.js` → `App.tsx` using `useState` and `useEffect` (no class needed)
- [ ] `ThemeSwitcher`, `Header`, `Footer` and all Sprint 1-4 new components converted
- [ ] `npm run dev` works (Vite dev server)
- [ ] `npm run build` produces a valid production bundle
- [ ] All existing tests pass with updated `vitest` (Vite's test runner, replaces Jest)
- [ ] CI/CD pipeline updated to use new build commands
- [ ] No `--openssl-legacy-provider` flag needed

### Migration Order Within Sprint 5

```
Step 5.1  — Set up Vite + TypeScript config (new vite.config.ts, tsconfig.json)
Step 5.2  — Rename files to .ts/.tsx, fix import errors
Step 5.3  — Define core interfaces (Theme, Blog, GreetingData, TravelData)
Step 5.4  — Convert App, Main, Header, Footer to functional + typed
Step 5.5  — Convert page components (Home, Blog, Travel, etc.)
Step 5.6  — Convert container components (Greeting, Skills, FeaturedBlogs, TravelTeaser)
Step 5.7  — Type apiClient.ts and portfolio.ts fully
Step 5.8  — Migrate tests from Jest to Vitest (minimal config change)
Step 5.9  — Update CI/CD pipeline (remove --openssl-legacy-provider, update build scripts)
Step 5.10 — Full QA pass across all pages in light, dark, and system themes
```

### Key Files Affected

| File                          | Change                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| `package.json`                | Remove `react-scripts`, add `vite`, `@vitejs/plugin-react`, `typescript`, `vitest` |
| `vite.config.ts`              | NEW — Vite config with React plugin and path aliases                               |
| `tsconfig.json`               | NEW — strict TypeScript config                                                     |
| `src/types/index.ts`          | NEW — shared interfaces (Theme, Blog, GreetingData, TravelData, etc.)              |
| All `*.js` / `*.jsx`          | Rename to `*.ts` / `*.tsx` and add types                                           |
| `src/portfolio.js`            | Becomes `portfolio.ts` with exported interfaces                                    |
| `src/apiClient.js`            | Becomes `apiClient.ts` with typed fetch responses                                  |
| `src/theme.js`                | Becomes `theme.ts` with `Theme` interface                                          |
| `.github/workflows/ci-cd.yml` | Remove `--openssl-legacy-provider`, update build command                           |

### Prerequisite Checklist Before Starting Sprint 5

- [ ] All 4 redesign sprints are merged to `main` and live on `amrit.cloud`
- [ ] No open bugs or visual regressions from the redesign
- [ ] A full backup / snapshot of the working JavaScript codebase exists (git tag recommended: `git tag v1.0-pre-ts-migration`)

---

## Future Backlog (Post All Sprints)

| Item                           | Sprint   | Notes                                                          |
| ------------------------------ | -------- | -------------------------------------------------------------- |
| Newsletter backend             | Post-S4  | DynamoDB table + Lambda `POST /subscribe` + SES delivery       |
| Travel blog posts              | Post-S4  | Individual posts at `/travel/:slug` using existing blog system |
| Travel tag filtering           | Post-S4  | Filter `/travel` by Nepal / USA / Moto                         |
| SEO for travel pages           | Post-S4  | Add `react-helmet` meta tags with Nepal trek keywords          |
| Stack modernization            | Sprint 5 | CRA → Vite, React 16 → 18, class → hooks, JS → TypeScript      |
| `travel.amrit.cloud` migration | Post-S5  | Only if 20+ travel posts and distinct audience                 |
