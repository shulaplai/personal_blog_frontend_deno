# CV-Based Frontend Improvements — Design Spec

**Date:** 2026-07-21
**Status:** Approved

## Goal

Personalize the public blog frontend with Shulap Lai's CV content — richer homepage
hero, a full About/Resume page with split layout, and removal of the Novels section
from public view.

## Data Layer

New static data file: `src/data/profile.js`

All CV content lives in a single JS object export. Components import only the fields
they need. Edits require a redeploy — acceptable since CV data changes rarely.

### Schema

```js
export const profile = {
  name: "Shulap Lai",
  nameZh: "黎庶立",
  title: "Full-Stack Developer",
  tagline: "Building modern web & mobile apps with React and Laravel",
  email: "shulaplai@gmail.com",
  phone: "+852 9062 5668",
  github: "github.com/shulaplai",
  techStack: {
    frontend: ["React", "React Native", "Tailwind CSS", "JavaScript", "TypeScript"],
    backend:  ["PHP", "Laravel", "RESTful APIs"],
    devops:   ["Docker", "Git", "CLI & Shell"],
  },
  languages: [
    { name: "Cantonese", level: "Native" },
    { name: "Mandarin",  level: "Fluent" },
    { name: "English",   level: "Fluent" },
    { name: "Japanese",  level: "JLPT N2" },
  ],
  experience: [
    {
      role: "Programmer",
      period: "2022–2025",
      highlights: [
        "Full-stack web applications with React, Laravel & Tailwind CSS",
        "SaaS booking platform with WhatsApp Business API integration",
        "Smart home IoT mobile app with React Native",
        "Docker-based containerization for development and deployment",
      ],
    },
  ],
  education: {
    degree: "B.S.Sc. Social Sciences",
    school: "Lingnan University",
    schoolZh: "嶺南大學",
    period: "2015–2019",
  },
  softSkills: [
    "Cross-functional Communication",
    "Problem Solving",
    "Project Coordination",
    "Multi-tasking",
  ],
};
```

## File Changes

### New Files (6)

| File | Purpose |
|------|---------|
| `src/data/profile.js` | Static CV data — single source of truth |
| `src/components/public/ProfileHero.jsx` | Homepage hero: name, title, tagline, tech pills, contact links |
| `src/components/public/TechStackBadges.jsx` | Reusable category-grouped tech badge grid |
| `src/components/public/LanguageBadges.jsx` | Language name + proficiency level bars |
| `src/components/public/ExperienceTimeline.jsx` | Vertical timeline with role, period, highlights |
| `src/components/public/ProfileSidebar.jsx` | Right-column composite: tech + languages + education + contact |

### Modified Files (4)

| File | Change |
|------|--------|
| `src/pages/public/HomePage.jsx` | Replace hero section with `<ProfileHero />`, remove novels section and stats novels card |
| `src/pages/public/AboutPage.jsx` | Replace single-paragraph layout with split layout: bio + timeline (left), sidebar (right) |
| `src/layouts/PublicLayout.jsx` | Remove `Novels` from `NAV_ITEMS` array |
| `src/routes/index.jsx` | Comment out 3 novel public routes with a `{/* Novels hidden */}` note |

## Component Design

### ProfileHero (Homepage)

```
┌────────────────────────────────────────┐
│        [Avatar — initial circle]        │
│        Shulap Lai · 黎庶立              │
│        Full-Stack Developer            │
│        Building modern web & mobile     │
│        apps with React and Laravel      │
│                                         │
│   [React] [Laravel] [Tailwind] [Docker] │
│                                         │
│   [📧 Email] [🐙 GitHub] [View Resume]  │
└────────────────────────────────────────┘
```

- Avatar: first character of `profile.name`, same circle style as current
- Tech pills: small rounded badges, `bg-muted` with `text-muted-foreground`, hover subtle
- Contact row: icon + text links, inline-flex, gap
- "View Resume" links to `/about`
- Reuses existing `animate-fade-in` + `animate-delay-50`

### AboutPage — Split Layout

**Left column (65% width on desktop):**
1. **About Me card** — bio paragraph from settings API (`settings.about_me`), CMS-editable
2. **Experience card** — `<ExperienceTimeline />` with single Programmer entry (2022–2025), company name hidden, 4 bullet highlights
3. **Soft Skills card** — badge pills for each skill

**Right column (35% width on desktop):**
1. **Tech Stack card** — `<TechStackBadges />` grouped by category (Frontend / Backend / DevOps)
2. **Languages card** — `<LanguageBadges />` with proficiency bars
3. **Education card** — degree, school (English + Chinese), period
4. **Contact card** — email, phone, GitHub with icons

**Mobile:** Right column stacks below left. Single-column, full-width cards.

### ExperienceTimeline

- Vertical line (left border) with dot indicator per entry
- Role as heading, period as muted subtext
- Highlights as bullet list below
- Single entry: "Programmer · 2022–2025" with 4 bullets

### TechStackBadges

- Category label (small-caps, muted)
- Row of pill badges per category
- Each badge: `rounded-full px-3 py-1 text-sm border bg-muted`

### LanguageBadges

- Language name + proficiency level label
- Horizontal bar showing relative proficiency (Native = full width, Fluent = ~80%, N2 = ~60%)
- Monochrome, using `--color-primary` for the fill

### ProfileSidebar

- Composite component rendering TechStack, Languages, Education, Contact cards
- Each card: `rounded-2xl border p-5` matching existing card style

## Novel Removal (Public Only)

Three targeted changes, no deletions:

1. **`PublicLayout.jsx`**: Remove `{ label: 'Novels', path: '/novels' }` from `NAV_ITEMS`
2. **`HomePage.jsx`**: Remove novels dispatch, selector, section JSX, and stats card
3. **`routes/index.jsx`**: Comment out the 3 novel routes:
   - `novels` → `{/* <Route path="novels" ... /> */}`
   - `novels/:slug` → `{/* <Route path="novels/:slug" ... /> */}`
   - `novels/:novelSlug/chapters/:chapterNumber` → commented out

**Kept intact:** Admin novel pages, Redux slices (`publicNovelsSlice`), lazy imports, and novel components. Easily re-enabled.

## Styling

- All new components use **Tailwind CSS** (matches public site convention)
- Existing design tokens reused: `--color-muted`, `--color-border`, `--color-primary`, etc.
- Cards: `rounded-2xl border border-border bg-background p-5`
- Dark mode: inherited from existing `.dark` CSS variables — no new tokens needed
- Responsive: `flex-col` on mobile, `md:flex-row` split layout, single-column cards on mobile
- Animations: reuse existing `animate-fade-in` classes

## What Stays Unchanged

- Admin section (MUI, DataGrid, forms) — zero changes
- Blog and Projects pages — zero changes
- PublicLayout header/footer structure — nav items reduced only
- Redux store — all slices intact
- Backend API — no changes needed
- Dark mode, theme toggle — no changes
- Vercel/Edge Function deployment — no impact

## Spec Self-Review

- **Placeholders:** None. All data fields map to real CV content.
- **Internal consistency:** ProfileHero and AboutPage both read from same `profile.js` — no data divergence possible.
- **Scope:** Focused — 6 new files, 4 modified. No backend, no admin, no API changes.
- **Ambiguity:** None. All component layouts specified, responsive behavior defined, novel removal scope explicit.
