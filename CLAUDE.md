# Personal Blog CMS

React frontend for the personal blog system — two layers in one repo:

- **Public Website** (`/*`): Display-only — blog posts, projects/portfolio, novels
- **CMS Admin** (`/admin/*`): Content management behind Sanctum token auth

**Backend**: `personal_blog_backend` (Laravel 13 REST API) at `../personal_blog_backend`

## Tech Stack

- React 18 + Vite 5
- Tailwind CSS 4 (public site styling)
- MUI 6 (Material UI — admin section)
- Redux Toolkit (createSlice + createAsyncThunk)
- React Router 6 (lazy-loaded routes)
- Tiptap (rich text editor)
- Axios (HTTP client)
- notistack (snackbar notifications)
- dayjs (date formatting)
- html-react-parser (safe HTML rendering)

## Project Structure

```
src/
├── index.css                  # Tailwind import + design tokens + global styles
├── main.jsx                   # Entry: Provider, Theme, Router
├── App.jsx                    # Auth init, theme toggle, dark mode sync
├── theme.js                   # MUI theme (light/dark — admin only)
├── routes/                    # Route tree, auth guards, public wrapper
├── layouts/                   # AdminLayout (MUI sidebar+topbar), PublicLayout (Tailwind header+footer)
├── store/                     # Redux store + 14 domain slices
├── services/                  # Axios API wrappers (base.js has token interceptor + 401 redirect)
├── components/
│   ├── common/                # LoadingSpinner, PageHeader, EmptyState, ConfirmDialog (MUI)
│   ├── admin/                 # RichTextEditor, StatusBadge, CategorySelect, TagSelector, etc. (MUI)
│   └── public/                # BlogCard, ProjectCard, NovelCard, TagChip, filters, ChapterNav (Tailwind)
├── pages/
│   ├── public/                # HomePage, BlogList/Detail, Projects, Novels, ChapterRead, About (Tailwind)
│   └── admin/                 # LoginPage, Dashboard, posts/, projects/, novels/, media/, settings/ (MUI)
├── utils/                     # storage.js, formatters.js, validators.js
└── locales/                   # zh-HK.json, en.json
deployment/
├── dev/                       # Dockerfile, docker-compose.yaml, nginx.conf, .env, cert.pem, key.pem
├── uat/demo/                  # Dockerfile, docker-compose.yaml, nginx.conf, .env, cert.pem, key.pem
└── prod/lsl/                  # Dockerfile, docker-compose.yaml, nginx.conf, .env, cert.pem, key.pem
```

## Conventions

- Path alias `@/` → `src/`
- Public site styled with **Tailwind CSS** (joyehuang.me-inspired design)
- Admin section uses **MUI** components (DataGrid, forms, etc.)
- All API calls via `services/base.js` — token interceptor, 401 → `/admin/login`
- Token in localStorage (`auth_token`), managed by `utils/storage.js`
- Redux slices: `items`, `currentItem`, `pagination`, `status`, `error`
- Admin tables use MUI DataGrid with server-side pagination
- Controlled MUI forms (no Formik)
- Lazy-loaded routes via `React.lazy()`

## Running

```bash
npm run dev       # Vite dev server on :5173, proxies /api → localhost
npm run build     # Production build → dist/
```

Backend must be running at `http://localhost`.

## Docker Deployment

Multi-stage Docker builds (Node build → Nginx serve). SSL via self-signed certs (replace with real certs for prod).

```bash
# Dev
cd deployment/dev
docker compose up --build -d

# UAT
cd deployment/uat/demo
docker compose up --build -d

# Prod
cd deployment/prod/lsl
docker compose up --build -d
```

Each environment has its own `.env` (API URL, etc.) and nginx config. Add new tenant deployments by copying an existing folder and customizing.
