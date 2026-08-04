# Landing Page Redesign — Sprint Tracker

**Project:** amrit.cloud landing page redesign  
**Plan reference:** [Landing_Page_Redesign_Plan.md](./Landing_Page_Redesign_Plan.md)  
**Blog series:** [blog-content-plan.md](./blog-content-plan.md) (Phase 4, Blogs 16–20)  
**Last updated:** 2026-08-04

---

## Sprint Status Overview

| Sprint | Name                                | Status            | Branch                | PR                                                    |
| ------ | ----------------------------------- | ----------------- | --------------------- | ----------------------------------------------------- |
| 1      | Theme Switcher System               | ✅ Done (PR open) | `feat/theme-switcher` | [#86](https://github.com/amritbh/myPortfolio/pull/86) |
| 2      | Hero Section Redesign               | ⬜ Not Started    | —                     | —                                                     |
| 3      | Blog Preview + Travel Teaser        | ⬜ Not Started    | —                     | —                                                     |
| 4      | Travel Page + Footer                | ⬜ Not Started    | —                     | —                                                     |
| 5      | Stack Modernization (post-redesign) | ⬜ Not Started    | —                     | —                                                     |

---

## Sprint 1 — Theme Switcher System

**Branch:** `feat/theme-switcher`  
**Goal:** 3-mode Light/System/Dark theme switcher in the header with localStorage persistence.

### Tasks

- [x] **1.1** Add `darkTheme` and `lightTheme` alias to `src/theme.js`
- [x] **1.2** Convert `src/App.js` to state-driven theming with localStorage
- [x] **1.3** Create `ThemeSwitcher` component (`ThemeSwitcher.js` + `ThemeSwitcher.css`)
- [x] **1.4** Wire `ThemeSwitcher` into `Header.js` + update `Main.js` prop flow
- [x] **1.5** Remove dead `ToggleSwitch` reference from `Footer.js`
- [x] **1.6** Write `ThemeSwitcher.test.js` (11 tests) + update `Header.test.js` (+2 tests)
- [x] **1.7** Run `npm test -- --coverage` — 23/23 tests passing
- [x] **1.8** Created draft PR [#86](https://github.com/amritbh/myPortfolio/pull/86)
- [ ] **1.9** Write Blog 16 after PR is merged

### Blog for this Sprint

**Blog 16:** "How I Redesigned My Portfolio Landing Page (Sprint 1: Dark Mode Done Right)"  
**Slug:** `redesign-s1-dark-mode-theme-switcher`  
**Tags:** React, Frontend, UX, Dark Mode, JavaScript  
**Read time:** ~10 min  
**Write after:** Sprint 1 PR merged to `main`  
**Key sections:** why state-driven theming, `App.js` walkthrough, ThemeSwitcher component deep-dive, dark theme palette decisions, testing strategy

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
- [ ] **2.6** Write Blog 17 after PR is merged

### Blog for this Sprint

**Blog 17:** "Redesigning the Hero Section (Sprint 2: First Impressions Matter)"  
**Slug:** `redesign-s2-hero-section`  
**Tags:** React, CSS, UX, Frontend, Design  
**Read time:** ~12 min  
**Write after:** Sprint 2 PR merged to `main`  
**Key sections:** hero design principles, gradient text CSS, chip animations, Nepal-flag ring, stats bar, responsive layout

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
- [ ] **3.8** Write Blog 18 after PR is merged

### Blog for this Sprint

**Blog 18:** "Adding a Blog Preview and Travel Teaser to the Home Page (Sprint 3)"  
**Slug:** `redesign-s3-blog-preview-travel-teaser`  
**Tags:** React, Frontend, API, UX, Travel  
**Read time:** ~10 min  
**Write after:** Sprint 3 PR merged to `main`  
**Key sections:** FeaturedBlogs skeleton loading, API reuse, TravelTeaser design, Nepal destination chips, mountain SVG background

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
- [ ] **4.8** Write Blog 19 after PR is merged

### Blog for this Sprint

**Blog 19:** "Building the Travel Page and Redesigning the Footer (Sprint 4)"  
**Slug:** `redesign-s4-travel-page-footer`  
**Tags:** React, Frontend, Travel, Nepal, UX  
**Read time:** ~11 min  
**Write after:** Sprint 4 PR merged to `main`  
**Key sections:** `/travel` route creation, 7 Himalayan treks, subdomain vs page decision, newsletter UI, enhanced footer layout

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
- [ ] **5.14** Write Blog 20 after PR is merged

### Blog for this Sprint

**Blog 20:** "Migrating from CRA to Vite and JavaScript to TypeScript (Sprint 5)"  
**Slug:** `redesign-s5-vite-typescript-migration`  
**Tags:** TypeScript, Vite, React 18, Frontend, Migration  
**Read time:** ~15 min  
**Write after:** Sprint 5 PR merged to `main`  
**Key sections:** why CRA is dead, Vite config, tsconfig strict mode, shared interfaces, class-to-hooks conversion, Jest-to-Vitest, CI/CD pipeline changes

---

## Completed Sprints

_(none yet)_

---

## Notes

- Always run `gh pr status` before starting a new sprint to check if the previous branch was merged
- Always create **draft PRs** (never push directly to `main`)
- Test coverage must stay above 80% before any PR is created
