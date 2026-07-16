/**
 * Vite plugin — Supabase API Adapter
 *
 * Intercepts all /api/* requests in dev mode, rewrites them to Supabase
 * (PostgREST views for reads, Edge Functions for writes/auth), and
 * transforms responses into Laravel-compatible { data, meta } format so
 * the frontend requires zero changes.
 */
export function supabaseAdapter({ target, anonKey }) {
  const SUPABASE_URL = target.replace(/\/$/, '');

  return {
    name: 'supabase-api-adapter',
    configureServer(server) {
      // Mount at / so we see the full req.url — we check /api/ prefix manually
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        try {
          const result = await proxyToSupabase(req, SUPABASE_URL, anonKey);
          res.statusCode = result.status;
          for (const [k, v] of Object.entries(result.headers)) {
            res.setHeader(k, v);
          }
          res.end(result.body);
        } catch (err) {
          console.error('[supabase-adapter]', err.message);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: 'API adapter error', error: err.message }));
        }
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Route table
// ---------------------------------------------------------------------------
const ROUTES = [
  // ── Auth ──────────────────────────────────────────────────────────────
  { p: '/api/auth/login',     m: ['POST'],                               t: fn('auth') },
  { p: '/api/auth/logout',    m: ['POST'],                               t: fn('auth') },
  { p: '/api/auth/me',        m: ['GET'],                                t: fn('auth') },

  // ── Public reads ─────────────────────────────────────────────────────
  { p: '/api/posts',          m: ['GET'],  t: view('post_list_view',    { paginated: true }) },
  { p: '/api/posts/:slug',    m: ['GET'],  t: view('post_detail_view',  { single: true, by: 'slug' }) },
  { p: '/api/projects',       m: ['GET'],  t: view('project_list_view', { paginated: true }) },
  { p: '/api/projects/:slug', m: ['GET'],  t: view('project_detail_view',{ single: true, by: 'slug' }) },
  { p: '/api/novels',         m: ['GET'],  t: view('novel_list_view',   { paginated: true }) },
  { p: '/api/novels/:slug',   m: ['GET'],  t: view('novel_detail_view', { single: true, by: 'slug' }) },
  { p: '/api/novels/:nSlug/chapters/:num', m: ['GET'], t: { type: 'chapterBySlug' } },
  { p: '/api/categories',     m: ['GET'],  t: view('category_view',     { list: true, order: 'sort_order.asc' }) },
  { p: '/api/tags',           m: ['GET'],  t: view('tag_view',          { list: true, order: 'name.asc' }) },
  { p: '/api/site-settings',  m: ['GET'],  t: table('site_settings',    { list: true }) },

  // ── Admin posts ──────────────────────────────────────────────────────
  { p: '/api/admin/posts',        m: ['GET'],    t: view('post_list_view',   { paginated: true, admin: true }) },
  { p: '/api/admin/posts/:id',    m: ['GET'],    t: view('post_detail_view', { single: true, by: 'id' }) },
  { p: '/api/admin/posts',        m: ['POST'],   t: fn('admin-posts') },
  { p: '/api/admin/posts/:id',    m: ['PUT'],    t: fn('admin-posts') },
  { p: '/api/admin/posts/:id',    m: ['DELETE'], t: fn('admin-posts') },

  // ── Admin projects ───────────────────────────────────────────────────
  { p: '/api/admin/projects',     m: ['GET'],    t: view('project_list_view',{ paginated: true, admin: true }) },
  { p: '/api/admin/projects/:id', m: ['GET'],    t: view('project_detail_view',{ single: true, by: 'id' }) },
  { p: '/api/admin/projects',     m: ['POST'],   t: fn('admin-projects') },
  { p: '/api/admin/projects/:id', m: ['PUT'],    t: fn('admin-projects') },
  { p: '/api/admin/projects/:id', m: ['DELETE'], t: fn('admin-projects') },

  // ── Admin novels ─────────────────────────────────────────────────────
  { p: '/api/admin/novels',             m: ['GET'],    t: view('novel_list_view',   { paginated: true, admin: true }) },
  { p: '/api/admin/novels/:id',         m: ['GET'],    t: view('novel_detail_view', { single: true, by: 'id' }) },
  { p: '/api/admin/novels',             m: ['POST'],   t: fn('admin-novels-chapters') },
  { p: '/api/admin/novels/:id',         m: ['PUT'],    t: fn('admin-novels-chapters') },
  { p: '/api/admin/novels/:id',         m: ['DELETE'], t: fn('admin-novels-chapters') },

  // ── Admin chapters (sub-resource of novels) ──────────────────────────
  { p: '/api/admin/novels/:nId/chapters',           m: ['GET'],
    t: view('chapter_list_view', { list: true, by: { novel_id: 'nId' }, order: 'chapter_number.asc' }) },
  { p: '/api/admin/novels/:nId/chapters/:cId',      m: ['GET'],
    t: view('chapter_detail_view', { single: true, by: 'id' }) },
  { p: '/api/admin/novels/:nId/chapters',           m: ['POST'],   t: fn('admin-novels-chapters') },
  { p: '/api/admin/novels/:nId/chapters/:cId',      m: ['PUT'],    t: fn('admin-novels-chapters') },
  { p: '/api/admin/novels/:nId/chapters/:cId',      m: ['DELETE'], t: fn('admin-novels-chapters') },

  // ── Admin media ──────────────────────────────────────────────────────
  { p: '/api/admin/media',        m: ['GET'],    t: view('media_view',        { paginated: true }) },
  { p: '/api/admin/media/upload', m: ['POST'],   t: fn('admin-media') },
  { p: '/api/admin/media/:id',    m: ['DELETE'], t: fn('admin-media') },

  // ── Admin settings ───────────────────────────────────────────────────
  { p: '/api/admin/settings',     m: ['GET'],    t: table('site_settings',    { list: true }) },
  { p: '/api/admin/settings',     m: ['PUT'],    t: fn('admin-settings') },

  // ── Admin dashboard ──────────────────────────────────────────────────
  { p: '/api/admin/dashboard',    m: ['GET'],    t: view('dashboard_stats_view',{ single: true }) },
];

// ---------------------------------------------------------------------------
// Helpers: route target descriptors
// ---------------------------------------------------------------------------
function fn(name)     { return { type: 'function', name }; }
function view(name, o) { return { type: 'rest', resource: name, ...o }; }
function table(name, o){ return { type: 'rest', resource: name, ...o }; }

// ---------------------------------------------------------------------------
// Route matching
// ---------------------------------------------------------------------------
function matchRoute(path, method) {
  for (const route of ROUTES) {
    if (!route.m.includes(method)) continue;
    const params = matchPattern(route.p, path);
    if (params !== null) return { ...route, params };
  }
  return null;
}

function matchPattern(pattern, path) {
  const segsP = pattern.split('/');
  const segsA = path.split('/');
  if (segsP.length !== segsA.length) return null;
  const params = {};
  for (let i = 0; i < segsP.length; i++) {
    if (segsP[i].startsWith(':')) {
      params[segsP[i].slice(1)] = decodeURIComponent(segsA[i]);
    } else if (segsP[i] !== segsA[i]) {
      return null;
    }
  }
  return params;
}

// ---------------------------------------------------------------------------
// Main proxy logic
// ---------------------------------------------------------------------------
async function proxyToSupabase(req, supabaseUrl, anonKey) {
  const u = new URL(req.url, 'http://localhost');
  const route = matchRoute(u.pathname, req.method);

  if (!route) {
    return {
      status: 404,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: 'Not found' }),
    };
  }

  const body = await readBody(req);

  // Special case: public chapter lookup by novel slug + chapter number.
  // chapter_detail_view has novel_id, not novel_slug, so resolve in two steps.
  if (route.t.type === 'chapterBySlug') {
    return await fetchChapterBySlug(route.params, supabaseUrl, anonKey, req);
  }

  const { url: targetUrl, headers: extraHeaders } = buildTarget(
    route, u, body, supabaseUrl, anonKey, req,
  );

  // Forward request to Supabase
  const fetchInit = {
    method: req.method,
    headers: {
      ...extraHeaders,
      ...passthroughHeaders(req),
    },
  };

  if (body && !['GET', 'HEAD'].includes(req.method)) {
    fetchInit.body = body;
  }

  const supabaseRes = await fetch(targetUrl, fetchInit);

  // Transform response
  let resBody = await supabaseRes.text();

  // Storage URLs are generated inside Docker as http://kong:8000 — rewrite
  // them to the host-reachable Supabase URL so <img src> works in the browser.
  resBody = resBody.replaceAll('http://kong:8000', supabaseUrl);
  const resHeaders = { 'content-type': 'application/json' };

  // Passthrough CORS headers so the browser is happy
  resHeaders['access-control-allow-origin'] = '*';

  const contentType = supabaseRes.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!supabaseRes.ok) {
    // Pass through Supabase errors
    return {
      status: supabaseRes.status,
      headers: resHeaders,
      body: isJson ? resBody : JSON.stringify({ message: resBody }),
    };
  }

  // 204 No Content / empty body — nothing to transform
  if (supabaseRes.status === 204 || !resBody) {
    return { status: supabaseRes.status, headers: resHeaders, body: '' };
  }

  if (!isJson) {
    return { status: supabaseRes.status, headers: resHeaders, body: resBody };
  }

  const json = JSON.parse(resBody);
  const contentRange = supabaseRes.headers.get('content-range');

  // Apply transformation
  let transformed;
  if (route.t.type === 'function') {
    transformed = transformEdgeFunction(json, route, u);
  } else if (route.t.single) {
    transformed = transformSingle(json);
  } else if (route.t.paginated) {
    transformed = transformPaginated(json, contentRange, u.searchParams);
  } else if (route.t.list) {
    transformed = transformList(json);
  } else {
    transformed = json;
  }

  return {
    status: supabaseRes.status,
    headers: resHeaders,
    body: JSON.stringify(transformed),
  };
}

// ---------------------------------------------------------------------------
// Build Supabase target URL
// ---------------------------------------------------------------------------
function buildTarget(route, parsedUrl, body, supabaseUrl, anonKey, req) {
  const headers = { apikey: anonKey };
  const q = new URLSearchParams(parsedUrl.search);

  if (route.t.type === 'function') {
    // Edge Function — passthrough path as-is (the function parses segments)
    const fnPath = `/functions/v1/${route.t.name}`;
    // For functions with an ID, append it
    // The Edge Function extracts the ID from the last path segment
    let fnUrl = `${supabaseUrl}${fnPath}`;
    if (route.params.id) {
      fnUrl += `/${route.params.id}`;
    } else if (route.params.nId && route.params.cId) {
      // chapters: /functions/v1/admin-novels-chapters/{novelId}/chapters/{chapterId}
      fnUrl += `/${route.params.nId}/chapters/${route.params.cId}`;
    } else if (route.params.nId) {
      // chapter create: /functions/v1/admin-novels-chapters/{novelId}/chapters
      fnUrl += `/${route.params.nId}/chapters`;
    } else if (route.p === '/api/admin/media/upload') {
      fnUrl += '/upload';
    } else if (route.p === '/api/auth/login') {
      fnUrl += '/login';
    } else if (route.p === '/api/auth/logout') {
      fnUrl += '/logout';
    } else if (route.p === '/api/auth/me') {
      fnUrl += '/me';
    }
    return { url: fnUrl, headers };
  }

  // PostgREST
  let pgUrl = `${supabaseUrl}/rest/v1/${route.t.resource}`;

  // Build query string
  const pgParams = new URLSearchParams();

  // Always select all columns
  pgParams.set('select', '*');

  // Filtering via query params
  if (route.t.by) {
    if (typeof route.t.by === 'string') {
      // Single column filter, e.g. by: 'slug' → slug=eq.<value>
      const val = route.params[route.t.by];
      if (val) pgParams.set(route.t.by, `eq.${val}`);
    } else {
      // Multiple column filter, e.g. by: { novel_slug: 'nSlug', chapter_number: 'num' }
      for (const [col, param] of Object.entries(route.t.by)) {
        const val = route.params[param];
        if (val) pgParams.set(col, `eq.${val}`);
      }
    }
  }

  // Default ordering
  if (route.t.order) {
    pgParams.set('order', route.t.order);
  } else if (route.t.paginated || route.t.list) {
    // Default: order by created_at desc for list endpoints
    pgParams.set('order', 'created_at.desc');
  }

  // Pagination: convert Laravel page/per_page to PostgREST limit/offset
  if (route.t.paginated) {
    const page = parseInt(q.get('page')) || 1;
    const perPage = parseInt(q.get('per_page')) || 15;
    const offset = (page - 1) * perPage;
    pgParams.set('limit', String(perPage));
    pgParams.set('offset', String(offset));
    headers['Prefer'] = 'count=exact';
  }

  // For single items: limit to 1
  if (route.t.single) {
    pgParams.set('limit', '1');
  }

  // Admin reads: no status filter (admin sees all including drafts)
  // RLS handles it — admin role can see all, anon only published

  // Passthrough other query params (search, status, etc.) for filtering
  // These work with PostgREST's column-based filtering
  for (const [key, val] of q.entries()) {
    if (['page', 'per_page'].includes(key)) continue; // already handled
    if (key === 'search') {
      // Use PostgREST full-text search or ilike
      pgParams.set('title', `ilike.*${val}*`);
    } else if (key === 'status') {
      pgParams.set('status', `eq.${val}`);
    } else if (key === 'category') {
      pgParams.set('category_id', `eq.${val}`);
    } else if (key === 'tag') {
      // tag filtering is handled by the filter_posts_by_tag RPC or client-side
      // For simplicity, passthrough — won't work directly on PostgREST
      pgParams.set(key, `eq.${val}`);
    }
  }

  pgUrl += `?${pgParams.toString()}`;
  return { url: pgUrl, headers };
}

// ---------------------------------------------------------------------------
// Public chapter lookup: /api/novels/:nSlug/chapters/:num
// chapter_detail_view keys on novel_id, so resolve the novel slug first.
// ---------------------------------------------------------------------------
async function fetchChapterBySlug(params, supabaseUrl, anonKey, req) {
  const headers = { apikey: anonKey, ...passthroughHeaders(req) };
  const jsonHeaders = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };

  const novelRes = await fetch(
    `${supabaseUrl}/rest/v1/novel_list_view?select=id&slug=eq.${encodeURIComponent(params.nSlug)}&limit=1`,
    { headers },
  );
  const novels = novelRes.ok ? await novelRes.json() : [];
  if (!novels.length) {
    return { status: 404, headers: jsonHeaders, body: JSON.stringify({ message: 'Novel not found' }) };
  }

  const chapterRes = await fetch(
    `${supabaseUrl}/rest/v1/chapter_detail_view?select=*&novel_id=eq.${novels[0].id}&chapter_number=eq.${encodeURIComponent(params.num)}&limit=1`,
    { headers },
  );
  const chapters = chapterRes.ok ? await chapterRes.json() : [];
  if (!chapters.length) {
    return { status: 404, headers: jsonHeaders, body: JSON.stringify({ message: 'Chapter not found' }) };
  }

  return { status: 200, headers: jsonHeaders, body: JSON.stringify({ data: chapters[0] }) };
}

// ---------------------------------------------------------------------------
// Response transformers
// ---------------------------------------------------------------------------
function transformPaginated(json, contentRange, searchParams) {
  const data = Array.isArray(json) ? json : [];
  const perPage = parseInt(searchParams.get('per_page')) || 15;
  const page = parseInt(searchParams.get('page')) || 1;

  let total = data.length;
  if (contentRange) {
    const m = contentRange.match(/\d+\-\d+\/(\d+)/);
    if (m) total = parseInt(m[1]);
  }

  return {
    data,
    meta: {
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / perPage)),
      per_page: perPage,
      total,
    },
  };
}

function transformSingle(json) {
  const item = Array.isArray(json) ? json[0] : json;
  return { data: item || null };
}

function transformList(json) {
  return { data: Array.isArray(json) ? json : [] };
}

/**
 * Edge Function responses are already in { data, message } shape.
 * The frontend expects the full response body as `response.data`,
 * so we pass through as-is. Auth login returns { data: { user, token } }
 * which matches what authSlice.loginUser expects (response.data.data).
 */
function transformEdgeFunction(json) {
  return json;
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------
function passthroughHeaders(req) {
  const h = {};
  // Passthrough auth
  if (req.headers.authorization) {
    h.authorization = req.headers.authorization;
  }
  // Passthrough content-type (important for multipart/form-data uploads)
  if (req.headers['content-type']) {
    h['content-type'] = req.headers['content-type'];
  }
  return h;
}

function readBody(req) {
  return new Promise((resolve) => {
    // Don't buffer if GET/HEAD
    if (['GET', 'HEAD'].includes(req.method)) return resolve(null);

    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (chunks.length === 0) return resolve(null);
      resolve(Buffer.concat(chunks));
    });
  });
}
