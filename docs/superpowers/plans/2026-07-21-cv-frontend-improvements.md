# CV-Based Frontend Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Personalize the public blog frontend with CV content — richer homepage hero, split-layout About page, and hide novels from public view.

**Architecture:** Static profile data file (`src/data/profile.js`) feeds 5 new leaf components, which compose into `ProfileHero` (homepage) and `AboutPage` split layout. Three targeted edits remove novels from public nav, homepage, and routes — admin and Redux slices stay intact.

**Tech Stack:** React 18, Tailwind CSS 4, Vite 5

## Global Constraints

- All new components use Tailwind CSS (matches public site convention)
- Existing design tokens: `--color-muted`, `--color-border`, `--color-primary`, `--color-background`, `--color-foreground`, `--color-muted-foreground`
- Card style: `rounded-2xl border border-border bg-background p-5`
- Dark mode: inherited from existing `.dark` CSS variables — no new tokens
- Responsive: `flex-col` on mobile, `md:flex-row` split layout
- Animations: reuse existing `animate-fade-in` classes
- No backend changes, no admin changes, no Redux changes
- `npm run build` must pass with zero errors after each task

---

### Task 1: Create profile data file

**Files:**
- Create: `src/data/profile.js`

**Interfaces:**
- Produces: `export const profile` — object with `name`, `nameZh`, `title`, `tagline`, `email`, `phone`, `github`, `techStack` (object of arrays), `languages` (array of `{name, level}`), `experience` (array of `{role, period, highlights[]}`), `education` (object), `softSkills` (string array)

- [ ] **Step 1: Write the data file**

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
    backend: ["PHP", "Laravel", "RESTful APIs"],
    devops: ["Docker", "Git", "CLI & Shell"],
  },
  languages: [
    { name: "Cantonese", level: "Native" },
    { name: "Mandarin", level: "Fluent" },
    { name: "English", level: "Fluent" },
    { name: "Japanese", level: "JLPT N2" },
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

- [ ] **Step 2: Verify the file parses correctly**

Run: `node -e "import('@/data/profile.js').then(m => console.log(Object.keys(m.profile)))" 2>&1 || node -e "const p = require('./src/data/profile.js'); console.log(Object.keys(p.profile))" 2>&1 || echo "Check with build"`

Since the project uses Vite path aliases, verify with the build instead:

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -5`
Expected: No errors related to profile.js (build may warn about unused import — that's fine)

- [ ] **Step 3: Commit**

```bash
git add src/data/profile.js
git commit -m "feat: add profile data file with CV content"
```

---

### Task 2: Create TechStackBadges component

**Files:**
- Create: `src/components/public/TechStackBadges.jsx`

**Interfaces:**
- Consumes: `profile.techStack` from `@/data/profile` — `{ frontend: string[], backend: string[], devops: string[] }`
- Produces: `<TechStackBadges />` — renders a card with category-grouped tech badges

- [ ] **Step 1: Write the component**

```jsx
import { profile } from '@/data/profile';

const CATEGORY_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps & Tools',
};

export default function TechStackBadges() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Tech Stack
      </h3>
      <div className="flex flex-col gap-y-4">
        {Object.entries(profile.techStack).map(([category, skills]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[category] || category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -10`
Expected: Build succeeds (component unused is fine at this stage)

- [ ] **Step 3: Commit**

```bash
git add src/components/public/TechStackBadges.jsx
git commit -m "feat: add TechStackBadges component"
```

---

### Task 3: Create LanguageBadges component

**Files:**
- Create: `src/components/public/LanguageBadges.jsx`

**Interfaces:**
- Consumes: `profile.languages` from `@/data/profile` — `Array<{ name: string, level: string }>`
- Produces: `<LanguageBadges />` — renders language proficiency bars

- [ ] **Step 1: Write the component**

```jsx
import { profile } from '@/data/profile';

const LEVEL_WIDTH = {
  Native: 'w-full',
  Fluent: 'w-4/5',
  'JLPT N2': 'w-3/5',
};

export default function LanguageBadges() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Languages
      </h3>
      <div className="flex flex-col gap-y-3">
        {profile.languages.map((lang) => (
          <div key={lang.name} className="flex items-center justify-between gap-x-3">
            <span className="w-24 shrink-0 text-sm text-foreground">{lang.name}</span>
            <div className="flex flex-1 items-center gap-x-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-primary ${LEVEL_WIDTH[lang.level] || 'w-1/2'}`}
                />
              </div>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {lang.level === 'JLPT N2' ? 'N2' : lang.level.slice(0, 3)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/public/LanguageBadges.jsx
git commit -m "feat: add LanguageBadges component"
```

---

### Task 4: Create ExperienceTimeline component

**Files:**
- Create: `src/components/public/ExperienceTimeline.jsx`

**Interfaces:**
- Consumes: `profile.experience` from `@/data/profile` — `Array<{ role: string, period: string, highlights: string[] }>`
- Produces: `<ExperienceTimeline />` — vertical timeline with role, period, bullet highlights

- [ ] **Step 1: Write the component**

```jsx
import { profile } from '@/data/profile';

export default function ExperienceTimeline() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Experience
      </h3>
      <div className="relative">
        {profile.experience.map((exp, i) => (
          <div
            key={i}
            className={`relative pl-6 ${
              i < profile.experience.length - 1 ? 'mb-6 pb-2' : ''
            }`}
          >
            {/* Vertical line */}
            <div className="absolute left-0 top-1.5 h-full w-px bg-border" />

            {/* Dot */}
            <div className="absolute left-[-3.5px] top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />

            {/* Content */}
            <h4 className="text-base font-medium text-foreground">{exp.role}</h4>
            <p className="mb-2 text-sm text-muted-foreground">{exp.period}</p>
            <ul className="flex flex-col gap-y-1">
              {exp.highlights.map((item, j) => (
                <li key={j} className="flex items-start gap-x-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/public/ExperienceTimeline.jsx
git commit -m "feat: add ExperienceTimeline component"
```

---

### Task 5: Create ProfileSidebar component

**Files:**
- Create: `src/components/public/ProfileSidebar.jsx`

**Interfaces:**
- Consumes: `TechStackBadges`, `LanguageBadges`, `profile.education`, `profile.email`, `profile.phone`, `profile.github` from `@/data/profile`
- Produces: `<ProfileSidebar />` — right-column composite of Tech Stack, Languages, Education, Contact cards

- [ ] **Step 1: Write the component**

```jsx
import { profile } from '@/data/profile';
import TechStackBadges from './TechStackBadges';
import LanguageBadges from './LanguageBadges';

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function ProfileSidebar() {
  return (
    <div className="flex flex-col gap-y-4">
      <TechStackBadges />
      <LanguageBadges />

      {/* Education */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Education
        </h3>
        <p className="text-sm font-medium text-foreground">{profile.education.degree}</p>
        <p className="text-sm text-muted-foreground">
          {profile.education.school}
          {profile.education.schoolZh && (
            <span className="ml-1 text-xs">({profile.education.schoolZh})</span>
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{profile.education.period}</p>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact
        </h3>
        <div className="flex flex-col gap-y-2.5">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-x-2 text-sm text-muted-foreground no-underline transition-colors hover:text-primary"
          >
            <MailIcon />
            <span>{profile.email}</span>
          </a>
          <a
            href={`tel:${profile.phone}`}
            className="inline-flex items-center gap-x-2 text-sm text-muted-foreground no-underline transition-colors hover:text-primary"
          >
            <PhoneIcon />
            <span>{profile.phone}</span>
          </a>
          <a
            href={`https://${profile.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-x-2 text-sm text-muted-foreground no-underline transition-colors hover:text-primary"
          >
            <GitHubIcon />
            <span>{profile.github}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/public/ProfileSidebar.jsx
git commit -m "feat: add ProfileSidebar component"
```

---

### Task 6: Create ProfileHero component

**Files:**
- Create: `src/components/public/ProfileHero.jsx`

**Interfaces:**
- Consumes: `profile` from `@/data/profile`, `MailIcon` and `GitHubIcon` inline SVGs, `RouterLink` from `react-router-dom`
- Produces: `<ProfileHero />` — name, title, tagline, tech pills, contact row, View Resume CTA

- [ ] **Step 1: Write the component**

```jsx
import { Link as RouterLink } from 'react-router-dom';
import { profile } from '@/data/profile';

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function ProfileHero() {
  const topTechs = [
    ...profile.techStack.frontend.slice(0, 2),
    ...profile.techStack.backend.slice(0, 1),
    ...profile.techStack.devops.slice(0, 1),
  ];

  return (
    <div className="mb-10 flex flex-col items-center gap-y-5">
      {/* Avatar */}
      <div className="flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
        {profile.name.charAt(0)}
      </div>

      {/* Name & Title */}
      <div className="flex flex-col items-center gap-y-1.5">
        <h1 className="text-3xl font-bold text-foreground">
          {profile.name}
          {profile.nameZh && (
            <span className="ml-2 text-xl font-normal text-muted-foreground">
              · {profile.nameZh}
            </span>
          )}
        </h1>
        <p className="text-base font-medium text-foreground">{profile.title}</p>
        <p className="text-sm text-muted-foreground">{profile.tagline}</p>
      </div>

      {/* Tech pills */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {topTechs.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Contact row */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-x-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
        >
          <MailIcon />
          <span>Email</span>
        </a>
        <a
          href={`https://${profile.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-x-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        <RouterLink
          to="/about"
          className="inline-flex items-center gap-x-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
        >
          <span>View Resume</span>
        </RouterLink>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/public/ProfileHero.jsx
git commit -m "feat: add ProfileHero component"
```

---

### Task 7: Integrate ProfileHero into HomePage and remove novels section

**Files:**
- Modify: `src/pages/public/HomePage.jsx`

**Interfaces:**
- Consumes: `ProfileHero` from `@/components/public/ProfileHero`
- Removes: `fetchPublicNovels` dispatch, novels selector, novels section JSX, novels stats card
- Produces: Updated HomePage with ProfileHero replacing hero, no novels section

- [ ] **Step 1: Read the current file**

Read `/Users/laishulap/Documents/GitHub/personal_blog_frontend_deno/src/pages/public/HomePage.jsx` to confirm current state.

- [ ] **Step 2: Apply the changes**

Edit 1 — Replace the import block. Remove `fetchPublicNovels` and `NovelCard`, add `ProfileHero`:

Find:
```jsx
import { fetchPublicNovels } from '@/store/slices/publicNovelsSlice';
```

Replace with (delete the line entirely). Then add the ProfileHero import after the last import from `@/components/public/`:

Find:
```jsx
import { ArrowRightIcon } from '@/components/public/Icons';
```

Replace with:
```jsx
import { ArrowRightIcon } from '@/components/public/Icons';
import ProfileHero from '@/components/public/ProfileHero';
```

Edit 2 — Replace the hero section. Find:
```jsx
      {/* Hero Section */}
      <section className="animate-fade-in animate-delay-50 mb-10 flex flex-col items-center gap-y-7 relative z-50">
        {/* Avatar placeholder */}
        <div className="flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
          {siteName.charAt(0)}
        </div>

        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-3xl font-bold">{siteName}</h1>
          <p className="text-muted-foreground">{siteDesc}</p>
        </div>

        <div className="flex flex-row gap-3">
          <RouterLink
            to="/about"
            className="flex flex-row items-center gap-x-3 rounded-full border bg-background px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md no-underline"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute size-2 animate-ping rounded-full border border-green-400 bg-green-400 opacity-75" />
              <span className="size-2 rounded-full bg-green-400" />
            </span>
            <span className="font-medium text-muted-foreground">Connect Me!</span>
          </RouterLink>
        </div>
      </section>
```

Replace with:
```jsx
      {/* Hero Section */}
      <section className="animate-fade-in animate-delay-50 relative z-50">
        <ProfileHero />
      </section>
```

Edit 3 — Remove novels dispatch. Find:
```jsx
    dispatch(fetchPublicNovels({ per_page: 3 }));
```

Delete this line.

Edit 4 — Remove novels selector. Find:
```jsx
  const { items: novels, pagination: novelsPagination, status: novelsStatus } = useAppSelector((state) => state.publicNovels);
```

Delete this line.

Edit 5 — Remove the entire Novels section JSX block. Find from `{/* Novels Section */}` through the closing `</section>` of the novels section, and delete it.

Edit 6 — Remove novels from stats. Find the stats card:
```jsx
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-2xl font-medium tabular-nums">{novelsPagination.total || novels.length || '-'}</div>
                <div className="mt-1 text-xs text-muted-foreground">Novels</div>
              </div>
```

Delete that entire `<div>` block. Update the stats grid from `grid-cols-4` to `grid-cols-3`:
```jsx
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
```

Edit 7 — Remove unused variables. Delete `siteName` and `siteDesc` since ProfileHero no longer needs them. Find:
```jsx
  const siteName = settings.site_name || 'Personal Blog';
  const siteDesc = settings.site_description || 'Welcome to my personal space.';
```

Delete both lines.

- [ ] **Step 3: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -15`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/public/HomePage.jsx
git commit -m "feat: integrate ProfileHero into homepage and remove novels section"
```

---

### Task 8: Redesign AboutPage with split layout

**Files:**
- Modify: `src/pages/public/AboutPage.jsx`

**Interfaces:**
- Consumes: `ExperienceTimeline`, `ProfileSidebar`, `profile` from `@/data/profile`, `publicSettingsSlice`
- Produces: Split-layout About page — left (bio + experience + soft skills), right (sidebar)

- [ ] **Step 1: Read the current file**

Read `/Users/laishulap/Documents/GitHub/personal_blog_frontend_deno/src/pages/public/AboutPage.jsx` to confirm current state.

- [ ] **Step 2: Write the new AboutPage**

```jsx
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicSettings } from '@/store/slices/publicSettingsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import { profile } from '@/data/profile';
import ExperienceTimeline from '@/components/public/ExperienceTimeline';
import ProfileSidebar from '@/components/public/ProfileSidebar';

export default function AboutPage() {
  const dispatch = useAppDispatch();
  const { settings, status } = useAppSelector((state) => state.publicSettings);

  useDocumentTitle('About');

  useEffect(() => {
    dispatch(fetchPublicSettings());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <div className="animate-fade-in mx-auto py-16">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
          {profile.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {profile.name}
          {profile.nameZh && (
            <span className="ml-2 text-xl font-normal text-muted-foreground">
              · {profile.nameZh}
            </span>
          )}
        </h1>
        <p className="mt-1 text-base text-muted-foreground">{profile.title}</p>
      </div>

      {/* Split layout */}
      <div className="flex flex-col gap-y-6 md:flex-row md:gap-x-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-y-4 md:w-[65%]">
          {/* About Me */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About Me
            </h3>
            {status === 'loading' ? (
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {settings.about_me || 'No introduction yet.'}
              </p>
            )}
          </div>

          {/* Experience */}
          <ExperienceTimeline />

          {/* Soft Skills */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.softSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full md:w-[35%]">
          <ProfileSidebar />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -15`
Expected: Build succeeds with no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/public/AboutPage.jsx
git commit -m "feat: redesign About page with split layout and CV content"
```

---

### Task 9: Remove Novels from public navigation

**Files:**
- Modify: `src/layouts/PublicLayout.jsx`

**Interfaces:**
- Consumes: `NAV_ITEMS` array
- Produces: Navigation without the Novels link

- [ ] **Step 1: Read the current file**

Read `/Users/laishulap/Documents/GitHub/personal_blog_frontend_deno/src/layouts/PublicLayout.jsx` to find the `NAV_ITEMS` array (around line 7-13).

- [ ] **Step 2: Remove Novels from NAV_ITEMS**

Find:
```jsx
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Projects', path: '/projects' },
  { label: 'Novels', path: '/novels' },
  { label: 'About', path: '/about' },
];
```

Replace with:
```jsx
const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Projects', path: '/projects' },
  { label: 'About', path: '/about' },
];
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/layouts/PublicLayout.jsx
git commit -m "feat: remove Novels from public navigation"
```

---

### Task 10: Comment out novel public routes

**Files:**
- Modify: `src/routes/index.jsx`

- [ ] **Step 1: Read the current file**

Read `/Users/laishulap/Documents/GitHub/personal_blog_frontend_deno/src/routes/index.jsx` to find the novel route lines.

- [ ] **Step 2: Comment out the three novel routes**

Find:
```jsx
          <Route path="novels" element={<SuspenseWrapper><NovelsPage /></SuspenseWrapper>} />
          <Route path="novels/:slug" element={<SuspenseWrapper><NovelDetailPage /></SuspenseWrapper>} />
          <Route path="novels/:novelSlug/chapters/:chapterNumber" element={<SuspenseWrapper><ChapterReadPage /></SuspenseWrapper>} />
```

Replace with:
```jsx
          {/* Novels hidden — see spec 2026-07-21-cv-frontend-improvements-design.md */}
          {/* <Route path="novels" element={<SuspenseWrapper><NovelsPage /></SuspenseWrapper>} /> */}
          {/* <Route path="novels/:slug" element={<SuspenseWrapper><NovelDetailPage /></SuspenseWrapper>} /> */}
          {/* <Route path="novels/:novelSlug/chapters/:chapterNumber" element={<SuspenseWrapper><ChapterReadPage /></SuspenseWrapper>} /> */}
```

- [ ] **Step 3: Verify build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1 | tail -15`
Expected: Build succeeds. Lazy imports for novel pages may trigger tree-shaking warnings — that's expected and harmless.

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.jsx
git commit -m "feat: hide novel routes from public access"
```

---

### Task 11: Final verification build and review

- [ ] **Step 1: Clean production build**

Run: `cd /Users/laishulap/Documents/GitHub/personal_blog_frontend_deno && npx vite build 2>&1`
Expected: `✓ built in X.XXs` with no errors

- [ ] **Step 2: Quick audit of changed files**

Run: `git diff --stat main`
Expected: 6 new files, 4 modified files, 1 spec doc

- [ ] **Step 3: Final commit (if any lint/format changes needed)**

If the build surfaced any warnings that need addressing, fix them and commit. Otherwise this task is the checkpoint.

```bash
git status
```

---

## Self-Review

**1. Spec coverage:**
- Data layer (`profile.js`) → Task 1 ✅
- TechStackBadges → Task 2 ✅
- LanguageBadges → Task 3 ✅
- ExperienceTimeline → Task 4 ✅
- ProfileSidebar → Task 5 ✅
- ProfileHero → Task 6 ✅
- HomePage integration + novel removal → Task 7 ✅
- AboutPage split layout → Task 8 ✅
- Nav novels removal → Task 9 ✅
- Routes novels comment-out → Task 10 ✅
- Final verification → Task 11 ✅

**2. Placeholder scan:** Zero TBD/TODO/fill-in-later. All steps have exact code. ✅

**3. Type consistency:**
- `profile.techStack` keys used consistently across Tasks 1, 2, 6 ✅
- `profile.languages` array shape consistent across Tasks 1, 3 ✅
- `profile.experience` shape consistent across Tasks 1, 4, 8 ✅
- Component imports match exact file paths created in earlier tasks ✅
