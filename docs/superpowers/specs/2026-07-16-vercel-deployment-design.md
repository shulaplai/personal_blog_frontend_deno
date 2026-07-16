# Vercel Deployment Design

**Date**: 2026-07-16
**Context**: Backend migrated from Laravel to Supabase (Edge Functions + PostgREST). Frontend
currently Docker/Nginx-deployed — adapting to Vercel static hosting.

## Architecture

```
Browser (Vercel CDN)
  │
  ├─ /* (any path)      → static files (React SPA)
  ├─ /admin/*           → static files (React SPA)
  │
  └─ /api/*             → Vercel rewrites → single Edge Function (/api-adapter)
       │
       ├─ GET /api/posts, /api/projects, etc.
       │    → PostgREST /rest/v1/*_view  (public reads)
       │    → Edge function wraps array → { data, meta }
       │
       ├─ POST|PUT|DELETE /api/admin/*
       │    → Edge Functions /functions/v1/*  (writes, auth)
       │    → Already returns { data, message } — pass through
       │
       └─ /api/auth/*
            → Edge Functions /functions/v1/auth/*
            → Returns { data: { user, token } }
```

Key difference from current Docker/Nginx setup: **no Nginx, no dev-only vite-plugin-supabase**.
Vercel's `rewrites` config replaces the proxy layer. The rewrite target is a single Vercel Edge
Function (`/api-adapter`) that combines routing + response transformation from the existing
`vite-plugin-supabase.js` adapter.

## Files

### `vercel.json` — NEW

Single catch-all rewrite. All `/api/*` requests → Vercel Edge Function at `/api-adapter`.
Standard Vite SPA config (build command, output dir, client-side routing fallback).

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api-adapter" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### `api-adapter.js` — NEW (Vercel Edge Function)

Extracted from `vite-plugin-supabase.js` — the route-matching, URL-building, and response
transformation logic moved into a standalone Vercel Edge Function. Responsibilities:

- Match incoming `/api/*` paths to Supabase targets (PostgREST view or Edge Function)
- Build Supabase URL with query params (pagination, filtering, ordering)
- Forward the request with auth headers (apikey, user JWT)
- Transform PostgREST responses → Laravel-compatible `{ data, meta }` format
- Pass through Edge Function responses (already in correct format)
- Add CORS headers
- Handle 204, non-JSON, and error responses

Preserves all existing route mappings (public reads, admin CRUD, auth, media upload, settings,
dashboard, chapter-by-slug lookup).

### `src/services/base.js` — SMALL EDIT (~5 lines)

Add a response interceptor as a belt-and-suspenders fallback: if a raw PostgREST array arrives
(edge case where the edge function didn't transform it), wrap it in `{ data: [...] }` so the
frontend doesn't break.

```js
api.interceptors.response.use(
  (response) => {
    if (Array.isArray(response.data)) {
      return { ...response, data: { data: response.data } };
    }
    return response;
  },
  // ... existing 401 handler unchanged
);
```

### `vite.config.js` — NO CHANGE

The `supabaseAdapter` plugin only registers `configureServer` — it only runs in Vite dev mode.
Vercel `vite build` ignores it. No guard needed.

### Vercel Environment Variables (set in dashboard)

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://<project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Production anon key from Supabase dashboard |

### No Changes To

- Redux slices (posts, projects, novels, auth, media, settings, etc.)
- Service files
- Page components (public + admin)
- Tiptap editor, MUI DataGrid, notistack
- Route tree, auth guards
- Tailwind / MUI theme
- `index.html`, `main.jsx`, `App.jsx`

## Error Handling

- **Unknown route**: 404 JSON `{ message: "Not found" }`
- **Supabase errors**: Pass through status + body from Supabase
- **Adapter errors**: 502 JSON `{ message: "API adapter error", error: "..." }`
- **401 responses**: Existing interceptor in `base.js` handles admin redirect to login
- **Network failures**: Existing per-slice `rejectWithValue` handles error messages

## Deployment Steps

1. Add `vercel.json` and `api-adapter.js` to the repo
2. Add response interceptor to `src/services/base.js`
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel dashboard
4. Deploy via `vercel --prod` or Vercel Git integration
5. Verify: public blog loads, admin login works, CRUD operations function
