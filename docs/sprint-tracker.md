# Landing Page Redesign — Sprint Tracker

**Project:** amrit.cloud landing page redesign  
**Plan reference:** [Landing_Page_Redesign_Plan.md](./Landing_Page_Redesign_Plan.md)  
**Last updated:** 2026-08-04

---

## Sprint Status Overview

| Sprint | Name                                | Status         | Branch                | PR  |
| ------ | ----------------------------------- | -------------- | --------------------- | --- |
| 1      | Theme Switcher System               | 🔄 In Progress | `feat/theme-switcher` | —   |
| 2      | Hero Section Redesign               | ⬜ Not Started | —                     | —   |
| 3      | Blog Preview + Travel Teaser        | ⬜ Not Started | —                     | —   |
| 4      | Travel Page + Footer                | ⬜ Not Started | —                     | —   |
| 5      | Stack Modernization (post-redesign) | ⬜ Not Started | —                     | —   |

---

## Sprint 1 — Theme Switcher System

**Branch:** `feat/theme-switcher`  
**Goal:** 3-mode Light/System/Dark theme switcher in the header with localStorage persistence.

### Tasks

- [/] **1.1** Add `darkTheme` and `lightTheme` alias to `src/theme.js`
- [ ] **1.2** Convert `src/App.js` to state-driven theming with localStorage
- [ ] **1.3** Create `ThemeSwitcher` component (`ThemeSwitcher.js` + `ThemeSwitcher.css`)
- [ ] **1.4** Wire `ThemeSwitcher` into `Header.js` + update `Main.js` prop flow
- [ ] **1.5** Remove dead `ToggleSwitch` reference from `Footer.js`
- [ ] **1.6** Write `ThemeSwitcher.test.js` + update `Header.test.js`
- [ ] **1.7** Run `npm test -- --coverage` and verify >80% coverage
- [ ] **1.8** Create draft PR

### Acceptance Criteria

- [ ] Light / System / Dark switching works in the nav
- [ ] Theme persists across page refresh
- [ ] System mode auto-switches with OS setting
- [ ] All existing pages look correct in dark mode
- [ ] Mobile: collapses to icon-only toggle
- [ ] Tests passing, coverage above 80%

---

## Sprint 2 — Hero Section Redesign

**Branch:** `feat/hero-redesign`  
**Goal:** Cinematic split-screen hero with identity chips, animated stats, and new intro copy.  
**Prerequisite:** Sprint 1 merged to `main`

### Tasks

- [ ] **2.1** Update `greeting` object in `src/portfolio.js` (subTitle, heroChips, heroStats)
- [ ] **2.2** Redesign `Greeting.js` — split-screen layout, chips, CTA buttons, stats bar
- [ ] **2.3** Redesign `Greeting.css` — gradient text, chip animations, photo ring, responsive
- [ ] **2.4** Run `npm test -- --coverage` and verify no regressions
- [ ] **2.5** Create draft PR

---

## Sprint 3 — Blog Preview + Travel Teaser

**Branch:** `feat/home-sections`  
**Goal:** Featured blog posts preview and Nepal/USA travel teaser on the home page.  
**Prerequisite:** Sprint 2 merged to `main`

### Tasks

- [ ] **3.1** Create `FeaturedBlogs` component (`FeaturedBlogs.js` + `FeaturedBlogs.css`)
- [ ] **3.2** Add `travelData` export to `portfolio.js`
- [ ] **3.3** Create `TravelTeaser` component (`TravelTeaser.js` + `TravelTeaser.css`)
- [ ] **3.4** Update `HomeComponent.js` to include both new sections
- [ ] **3.5** Write `FeaturedBlogs.test.js` and `TravelTeaser.test.js`
- [ ] **3.6** Run `npm test -- --coverage` and verify >80% coverage
- [ ] **3.7** Create draft PR

---

## Sprint 4 — Travel Page + Footer

**Branch:** `feat/travel-and-footer`  
**Goal:** `/travel` page with trek categories, "Travel" nav link, enhanced footer with newsletter UI.  
**Prerequisite:** Sprint 3 merged to `main`

### Tasks

- [ ] **4.1** Create `TravelPage.js` + `Travel.css`
- [ ] **4.2** Add `/travel` route to `Main.js`
- [ ] **4.3** Add "Travel" nav link to `Header.js`
- [ ] **4.4** Enhance `Footer.js` + `Footer.css` with newsletter UI and quick links
- [ ] **4.5** Write `TravelPage.test.js`, update `Header.test.js` and `Footer.test.js`
- [ ] **4.6** Run `npm test -- --coverage` and verify >80% coverage
- [ ] **4.7** Create draft PR

---

## Sprint 5 — Stack Modernization

**Branch:** `feat/stack-modernization`  
**Goal:** CRA → Vite, React 16 → 18, class → hooks, JS → TypeScript.  
**Prerequisite:** All of Sprints 1–4 merged, no open bugs on production

### Tasks

- [ ] **5.1** Install Vite + TypeScript, create `vite.config.ts` and `tsconfig.json`
- [ ] **5.2** Update `package.json` scripts, remove `--openssl-legacy-provider`
- [ ] **5.3** Create `src/types/index.ts` with all shared interfaces
- [ ] **5.4** Rename + type `theme.js` → `theme.ts`
- [ ] **5.5** Rename + type `portfolio.js` → `portfolio.ts`
- [ ] **5.6** Rename + type `apiClient.js` → `apiClient.ts`
- [ ] **5.7** Convert `App.js`, `Main.js`, `Header.js`, `Footer.js` to functional + typed
- [ ] **5.8** Convert all page components
- [ ] **5.9** Convert all container components
- [ ] **5.10** Migrate tests from Jest to Vitest
- [ ] **5.11** Update CI/CD pipeline
- [ ] **5.12** Full QA pass (all pages, all themes, all screen sizes)
- [ ] **5.13** Create draft PR

---

## Completed Sprints

_(none yet)_

---

## Notes

- Always run `gh pr status` before starting a new sprint to check if the previous branch was merged
- Always create **draft PRs** (never push directly to `main`)
- Test coverage must stay above 80% before any PR is created
