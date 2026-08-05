---
name: Stack Modernization
description: Migration guide and conventions for upgrading the portfolio from CRA + React 16 + class components + JavaScript to Vite + React 18 + functional components + TypeScript. Use this skill when executing Sprint 5 or any part of the stack upgrade.
---

# Stack Modernization (Sprint 5)

This skill documents the planned migration from the legacy CRA-based stack to a modern Vite + React 18 + TypeScript setup. **Do not start this migration until all 4 redesign sprints are merged and live on `amrit.cloud`.**

## Current Stack (Before Migration)

| Technology      | Version                          | Status                               |
| --------------- | -------------------------------- | ------------------------------------ |
| Build tool      | CRA `react-scripts@3.2.0`        | Deprecated — no longer maintained    |
| React           | `^16.10.2`                       | Old — missing concurrent features    |
| Component style | Class components                 | Verbose, no hooks ecosystem          |
| Type safety     | Plain JavaScript                 | No compile-time checks               |
| Node workaround | `--openssl-legacy-provider` flag | Required due to old tooling          |
| Test runner     | Jest (via CRA)                   | Works but slow; config buried in CRA |

## Target Stack (After Migration)

| Technology      | Version            | Notes                                          |
| --------------- | ------------------ | ---------------------------------------------- |
| Build tool      | Vite `^5.x`        | 10x faster HMR, native ESM, active maintenance |
| React           | `^18.x`            | Concurrent mode, `useId`, automatic batching   |
| Component style | Functional + Hooks | `useState`, `useEffect`, `useRef`, `useMemo`   |
| Type safety     | TypeScript `^5.x`  | Strict mode, full inference                    |
| Node workaround | None needed        | Vite supports Node 18+ natively                |
| Test runner     | Vitest             | Vite-native, Jest-compatible API, ~zero config |

## Pre-Migration Checklist

Before starting Sprint 5:

- [ ] All redesign sprints (1–4) are merged to `main` and live
- [ ] No open bugs or visual regressions on `amrit.cloud`
- [ ] Create a safety tag: `git tag v1.0-pre-ts-migration`
- [ ] Confirm `npm test -- --coverage` passes fully on current code
- [ ] Notify in PR description that this is a non-functional infrastructure change

## Migration Steps (in order)

### Step 5.1 — Install Vite and TypeScript

```bash
npm remove react-scripts
npm install --save-dev vite @vitejs/plugin-react typescript
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom
```

Create `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: "build" }, // keep "build" dir so CI/CD S3 upload is unchanged
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
  },
});
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

Update `package.json` scripts:

```json
"scripts": {
  "start": "vite",
  "dev": "vite",
  "build": "vite build",
  "test": "vitest run --coverage",
  "test:watch": "vitest",
  "preview": "vite preview"
}
```

**Remove** `--openssl-legacy-provider` from all scripts — no longer needed.

---

### Step 5.2 — Create Shared Type Definitions

**File (NEW):** `src/types/index.ts`

```ts
export interface Theme {
  body: string;
  text: string;
  expTxtColor: string;
  highlight: string;
  dark: string;
  secondaryText: string;
  imageHighlight: string;
  compImgHighlight: string;
  jacketColor: string;
  headerColor: string;
  splashBg: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface Blog {
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  coverImage?: string;
  author?: {
    name: string;
    avatar?: string;
  };
}

export interface HeroChip {
  icon: string;
  label: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export interface SocialLink {
  name: string;
  link: string;
  fontAwesomeIcon: string;
  backgroundColor: string;
}

export interface TravelDestinations {
  nepal: string[];
  usa: string[];
  moto: string[];
}

export interface TravelData {
  tagline: string;
  destinations: TravelDestinations;
  nepalCard: { icon: string; title: string; subtitle: string; link: string };
  usaCard: { icon: string; title: string; subtitle: string; link: string };
  motoStrip: { icon: string; label: string; link: string };
}
```

---

### Step 5.3 — Rename and Type `theme.ts`

```bash
mv src/theme.js src/theme.ts
```

Add `import type { Theme } from "./types"` and type all theme objects:

```ts
export const darkTheme: Theme = { ... };
export const lightTheme: Theme = blueTheme;
```

---

### Step 5.4 — Rename and Type `portfolio.ts`

```bash
mv src/portfolio.js src/portfolio.ts
```

Import interfaces from `./types` and type all exported objects.

---

### Step 5.5 — Rename and Type `apiClient.ts`

```bash
mv src/utils/apiClient.js src/utils/apiClient.ts
```

Type all function signatures:

```ts
export async function fetchBlogs(): Promise<Blog[]>;
export async function fetchBlogBySlug(slug: string): Promise<Blog | null>;
```

---

### Step 5.6 — Convert Components (Class → Functional)

**Pattern for conversion:**

```ts
// BEFORE (class)
class MyComponent extends Component<{ theme: Theme }> {
  state = { count: 0 };
  render() {
    return (
      <div style={{ color: this.props.theme.text }}>{this.state.count}</div>
    );
  }
}

// AFTER (functional)
import type { Theme } from "../../types";
interface Props {
  theme: Theme;
}

const MyComponent: React.FC<Props> = ({ theme }) => {
  const [count, setCount] = useState(0);
  return <div style={{ color: theme.text }}>{count}</div>;
};
```

**Conversion order** (least to most complex):

1. `Footer.tsx`
2. `TopButton.tsx`
3. `SocialMedia.tsx`
4. `ThemeSwitcher.tsx`
5. `Header.tsx`
6. `Greeting.tsx`
7. `FeaturedBlogs.tsx`
8. `TravelTeaser.tsx`
9. `TravelPage.tsx`
10. `Skills.tsx`, `SkillSection.tsx`
11. `BlogList.tsx`, `BlogDetail.tsx`
12. `App.tsx`, `Main.tsx`

---

### Step 5.7 — Update CI/CD Pipeline

**File:** `.github/workflows/ci-cd.yml`

- Remove `--openssl-legacy-provider` from any `NODE_OPTIONS` env vars
- Update build step from `CI=true npm run build` → `npm run build` (Vite doesn't need CI flag)
- Update test step from `CI=true npm test -- --coverage` → `npm test` (Vitest handles this)
- Keep S3 sync command unchanged (`aws s3 sync build/ s3://...`) — output dir remains `build/`

---

### Step 5.8 — Migrate Tests to Vitest

Vitest has a Jest-compatible API. Most tests require only:

1. Remove `jest` from imports (Vitest globals are auto-imported via `globals: true` in config)
2. Replace `jest.fn()` with `vi.fn()`
3. Replace `jest.mock()` with `vi.mock()`
4. Replace `jest.spyOn()` with `vi.spyOn()`

Example:

```ts
// BEFORE
jest.mock("../../utils/apiClient");
const mockFetchBlogs = jest.fn();

// AFTER
vi.mock("../../utils/apiClient");
const mockFetchBlogs = vi.fn();
```

---

## File Rename Map

| Before                                          | After                                            |
| ----------------------------------------------- | ------------------------------------------------ |
| `src/App.js`                                    | `src/App.tsx`                                    |
| `src/theme.js`                                  | `src/theme.ts`                                   |
| `src/portfolio.js`                              | `src/portfolio.ts`                               |
| `src/global.js`                                 | `src/global.ts`                                  |
| `src/utils/apiClient.js`                        | `src/utils/apiClient.ts`                         |
| `src/containers/Main.js`                        | `src/containers/Main.tsx`                        |
| `src/components/header/Header.js`               | `src/components/header/Header.tsx`               |
| `src/components/footer/Footer.js`               | `src/components/footer/Footer.tsx`               |
| `src/components/themeSwitcher/ThemeSwitcher.js` | `src/components/themeSwitcher/ThemeSwitcher.tsx` |
| `src/pages/home/HomeComponent.js`               | `src/pages/home/HomeComponent.tsx`               |
| `src/pages/travel/TravelPage.js`                | `src/pages/travel/TravelPage.tsx`                |
| All `*.test.js`                                 | `*.test.tsx` or `*.test.ts`                      |

## Common TypeScript Gotchas in This Codebase

- **`require()` for images:** Vite uses `import` not `require`. Replace:
  ```ts
  // BEFORE
  require(`../../assests/images/${logo_path}`);
  // AFTER
  // Use dynamic import or move to a typed image map
  ```
- **`styled-components`:** Add `@types/styled-components`. Typed theme: `import type { Theme } from "../../types"` then `const Div = styled.div<{ theme: Theme }>`.
- **`react-reveal`:** No official types; add `// @ts-ignore` or create `src/types/react-reveal.d.ts` with a module declaration.
- **`react-router-dom v5`:** Has `@types/react-router-dom` — install it. Route `render` prop typing: `render={(props: RouteComponentProps) => <Component {...props} theme={theme} />}`.

## Acceptance Criteria Before Merging Sprint 5

```bash
npm run build        # Must produce ./build/ with no TS errors
npm test             # All tests pass, coverage above 80%
```

- No `--openssl-legacy-provider` in any script
- No `any` types in core files (`apiClient.ts`, `portfolio.ts`, `theme.ts`)
- All components have typed `Props` interfaces
- CI/CD pipeline green on the PR
