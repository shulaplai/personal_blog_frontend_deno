# Codebase Improvements — Design Spec

**Date:** 2026-07-21
**Status:** Approved

## Goal

Address technical debt and fill key gaps in the personal blog frontend: fix broken
ESLint, establish test infrastructure with key component/service tests, add CI/CD
guardrails, improve accessibility, and add per-page SEO meta tags.

## Part 1: ESLint Fix + Pre-commit Hooks + CI

### ESLint Config (`eslint.config.js`)

**Problem:** 59 `.jsx` files fail to parse — no JSX parser config. 6 browser
globals missing from `languageOptions.globals`.

**Fix:**

1. Add `parserOptions: { ecmaFeatures: { jsx: true } }` to
   `languageOptions`
2. Add missing globals: `URL`, `FormData`, `Blob`, `File`, `setTimeout`,
   `clearTimeout` (all `'readonly'`)

**Unused vars fixes (2 files):**

| File | Change |
|------|--------|
| `src/services/mediaService.js` | Rename `progressEvent` → `_progressEvent` |
| `src/store/slices/authSlice.test.js` | Remove unused `logoutUser` import |

### Pre-commit Hooks

New devDependencies: `husky`, `lint-staged`

- **lint-staged config** (in `package.json`): `*.{js,jsx}` → `eslint --fix`,
  `*.{js,jsx,css,json}` → `prettier --write`
- **husky**: `pre-commit` hook triggers lint-staged
- No `npm test` in pre-commit (too slow; delegated to CI)

### GitHub Actions CI

New file: `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci --legacy-peer-deps
      - run: npm test
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci --legacy-peer-deps
      - run: npm run build
```

Jobs run sequentially (`lint` → `test` → `build`) with fail-fast. If lint
fails, test and build are skipped.

## Part 2: Test Infrastructure + Key Tests

### Coverage Setup

New devDependency: `@vitest/coverage-v8`

`vitest.config.js` additions:
```js
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov'],
  include: ['src/**/*.{js,jsx}'],
  exclude: ['src/test/**', 'src/**/*.test.*', 'src/**/index.js'],
},
```

No hard coverage threshold in CI — target ~50% lines as starting point.

### Test Libraries

New devDependencies:
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`

`src/test/setup.js` updated to import `@testing-library/jest-dom`.

### New Test Files (9)

**Tier 1 — Services (highest ROI, pure logic):**

| File | What It Tests | Est. Lines |
|------|--------------|------------|
| `src/services/base.test.js` | Token interceptor (attach + skip on login), 401 redirect (admin only), array-to-data wrapping fallback | ~60 |
| `src/services/authService.test.js` | login, logout, checkAuth flows | ~40 |

**Tier 2 — Redux Slices (state machines, easy to test):**

| File | What It Tests | Est. Lines |
|------|--------------|------------|
| `src/store/slices/postsSlice.test.js` | Async thunk states (pending/fulfilled/rejected), reducer immutability | ~50 |
| `src/store/slices/projectsSlice.test.js` | Same pattern as posts | ~40 |

**Tier 3 — Components (smoke tests, confirm render doesn't crash):**

| File | What It Tests | Est. Lines |
|------|--------------|------------|
| `src/components/public/BlogCard.test.jsx` | Render with mock post props, link href | ~30 |
| `src/components/public/ProfileHero.test.jsx` | Render with profile data, key elements present | ~30 |
| `src/components/common/ErrorBoundary.test.jsx` | Child error → fallback UI, retry button, reset flow | ~35 |

**Tier 4 — Hooks:**

| File | What It Tests | Est. Lines |
|------|--------------|------------|
| `src/utils/useDebounce.test.js` | Debounce delay behavior, value update | ~30 |
| `src/utils/useDocumentTitle.test.js` | Title set on mount, restore on unmount | ~30 |

**Total: ~345 lines of test code across 9 files.**

Zero production code changes required. All tests are read-only verification.

### Scripts

Add to `package.json`:
```json
"test:coverage": "vitest run --coverage"
```

## Part 3: Accessibility + Bundle Tuning

### Accessibility Fixes

All decorative SVG icons get `aria-hidden="true"`. Interactive elements get
proper ARIA state attributes. Zero visual changes.

| File | Change |
|------|--------|
| `src/components/public/Icons.jsx` | All 7 SVG components: add `aria-hidden="true"` |
| `src/components/public/ProfileHero.jsx` | MailIcon, GitHubIcon SVGs: add `aria-hidden="true"` |
| `src/components/public/ChapterNav.jsx` | Arrow SVG icons: add `aria-hidden="true"` |
| `src/components/public/ExperienceTimeline.jsx` | Dot/line decoration SVGs: add `aria-hidden="true"` |
| `src/components/public/TechStackBadges.jsx` | Category icon SVGs: add `aria-hidden="true"` + use semantic element for section heading |
| `src/components/public/LanguageBadges.jsx` | Icon SVGs: add `aria-hidden="true"` |
| `src/components/public/ProfileSidebar.jsx` | Card header icon SVGs: add `aria-hidden="true"` |
| `src/components/public/CategoryFilter.jsx` | Active/selected item: add `aria-current="page"` |
| `src/components/public/GenreFilter.jsx` | Active chip: add `aria-pressed="true"` |
| `src/layouts/PublicLayout.jsx` | Nav link matching current route: add `aria-current="page"` |

### Bundle Tuning

`vite.config.js` changes:
```js
build: {
  chunkSizeWarningLimit: 1000,  // MUI 848kB is expected; reduce log noise
  sourcemap: false,              // Explicitly disable for prod
}
```

MUI at 848kB raw (257kB gzip) is normal for MUI 6 with tree-shaking. No further
manual chunk splitting needed.

## Part 4: Lightweight SEO

### Package

New dependency: `react-helmet-async`

### Changes

| File | Change |
|------|--------|
| `src/main.jsx` | Wrap app with `<HelmetProvider>` |
| `src/pages/public/BlogDetailPage.jsx` | Add `<Helmet>`: dynamic title (post.title), meta description (post.excerpt), OG tags |
| `src/pages/public/BlogListPage.jsx` | Add `<Helmet>`: title "Blog — Shulap Lai", meta description |
| `src/pages/public/ProjectDetailPage.jsx` | Add `<Helmet>`: dynamic title, description, OG tags |
| `src/pages/public/AboutPage.jsx` | Add `<Helmet>`: title "About — Shulap Lai", meta description |
| `src/pages/public/HomePage.jsx` | Add `<Helmet>`: title "Shulap Lai — Full-Stack Developer", OG tags |

### OG Tags Pattern

Each detail page includes at minimum:
```jsx
<Helmet>
  <title>{item.title} — Shulap Lai</title>
  <meta name="description" content={item.excerpt || item.title} />
  <meta property="og:title" content={item.title} />
  <meta property="og:description" content={item.excerpt} />
  <meta property="og:type" content="article" />
</Helmet>
```

### Out of Scope (Keep Simple)

- No structured data / JSON-LD
- No Twitter card tags (OG covers it)
- No sitemap.xml generation
- No canonical URL tags

## Summary

| Part | New Deps | New Files | Modified Files |
|------|----------|-----------|----------------|
| 1. ESLint + CI | husky, lint-staged | 2 (`.github/ci.yml`, `.husky/pre-commit`) | 4 |
| 2. Testing | @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, @vitest/coverage-v8 | 10 (9 tests + setup update) | 2 |
| 3. A11y + Bundle | 0 | 0 | 11 |
| 4. SEO | react-helmet-async | 0 | 6 |
| **Total** | **5** | **12** | **23** |

## What Stays Unchanged

- Backend API — zero changes
- Admin section (MUI, DataGrid, forms) — zero changes
- Public site visual design — zero changes
- Redux store structure — zero changes
- Vercel deployment config — zero changes
- Docker deployment configs — zero changes
- All existing features — zero regressions

## Spec Self-Review

- **Placeholders:** None. All file paths, dep versions, and config values are concrete.
- **Internal consistency:** All four parts are independent — each can be implemented
  and merged separately without breaking others. Part 1 (ESLint) should go first
  since it catches issues in subsequent parts.
- **Scope:** Focused on quality/infra. No feature changes, no visual redesign.
  5 new deps (all dev-only except react-helmet-async), 12 new files, 23 modified.
- **Ambiguity:** None. Every change has a specific file path and described action.
