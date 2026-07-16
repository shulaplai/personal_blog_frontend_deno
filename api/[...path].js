// ============================================================================
// Vercel Edge Function — Supabase API Adapter
//
// Catches all /api/* requests (via Vercel catch-all route naming) and proxies
// them to Supabase (PostgREST views for reads, Edge Functions for writes/auth).
// Transforms responses into Laravel-compatible { data, meta } format so the
// frontend requires zero changes.
// ============================================================================

const SUPABASE_URL = (() => {
  const url = process.env.SUPABASE_URL || '';
  return url.replace(/\/$/, '');
})();
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// ---------------------------------------------------------------------------
// Route table — mirrors vite-plugin-supabase.js ROUTES
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

  // ── Admin chapters ───────────────────────────────────────────────────
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
// Build Supabase target URL
// ---------------------------------------------------------------------------
function buildTarget(route, parsedUrl, body) {
  const headers = { apikey: SUPABASE_ANON_KEY };
  const q = new URLSearchParams(parsedUrl.search);

  if (route.t.type === 'function') {
    const fnPath = `/functions/v1/${route.t.name}`;
    let fnUrl = `${SUPABASE_URL}${fnPath}`;
    if (route.params.id) {
      fnUrl += `/${route.params.id}`;
    } else if (route.params.nId && route.params.cId) {
      fnUrl += `/${route.params.nId}/chapters/${route.params.cId}`;
    } else if (route.params.nId) {
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
  let pgUrl = `${SUPABASE_URL}/rest/v1/${route.t.resource}`;
  const pgParams = new URLSearchParams();
  pgParams.set('select', '*');

  if (route.t.by) {
    if (typeof route.t.by === 'string') {
      const val = route.params[route.t.by];
      if (val) pgParams.set(route.t.by, `eq.${val}`);
    } else {
      for (const [col, param] of Object.entries(route.t.by)) {
        const val = route.params[param];
        if (val) pgParams.set(col, `eq.${val}`);
      }
    }
  }

  if (route.t.order) {
    pgParams.set('order', route.t.order);
  } else if (route.t.paginated || route.t.list) {
    pgParams.set('order', 'created_at.desc');
  }

  if (route.t.paginated) {
    const page = Math.max(1, parseInt(q.get('page')) || 1);
    const perPage = Math.max(1, Math.min(100, parseInt(q.get('per_page')) || 15));
    const offset = (page - 1) * perPage;
    pgParams.set('limit', String(perPage));
    pgParams.set('offset', String(offset));
    headers['Prefer'] = 'count=exact';
  }

  if (route.t.single) {
    pgParams.set('limit', '1');
  }

  // Passthrough query params for filtering
  for (const [key, val] of q.entries()) {
    if (['page', 'per_page'].includes(key)) continue;
    if (key === 'search') {
      pgParams.set('title', `ilike.*${val}*`);
    } else if (key === 'status') {
      pgParams.set('status', `eq.${val}`);
    } else if (key === 'category') {
      pgParams.set('category_id', `eq.${val}`);
    } else if (key === 'tag') {
      pgParams.set(key, `eq.${val}`);
    }
  }

  pgUrl += `?${pgParams.toString()}`;
  return { url: pgUrl, headers };
}

// ---------------------------------------------------------------------------
// Chapter-by-slug lookup (two-step: resolve novel slug → novel_id, then
// fetch chapter by novel_id + chapter_number)
// ---------------------------------------------------------------------------
async function fetchChapterBySlug(params) {
  const headers = { apikey: SUPABASE_ANON_KEY };

  const novelRes = await fetch(
    `${SUPABASE_URL}/rest/v1/novel_list_view?select=id&slug=eq.${encodeURIComponent(params.nSlug)}&limit=1`,
    { headers },
  );
  if (!novelRes.ok) {
    return { status: novelRes.status, body: JSON.stringify({ message: 'Novel fetch failed' }) };
  }
  const novels = await novelRes.json();
  if (!novels.length) {
    return { status: 404, body: JSON.stringify({ message: 'Novel not found' }) };
  }

  const chapterRes = await fetch(
    `${SUPABASE_URL}/rest/v1/chapter_detail_view?select=*&novel_id=eq.${novels[0].id}&chapter_number=eq.${encodeURIComponent(params.num)}&limit=1`,
    { headers },
  );
  if (!chapterRes.ok) {
    return { status: chapterRes.status, body: JSON.stringify({ message: 'Chapter fetch failed' }) };
  }
  const chapters = await chapterRes.json();
  if (!chapters.length) {
    return { status: 404, body: JSON.stringify({ message: 'Chapter not found' }) };
  }

  return { status: 200, body: JSON.stringify({ data: chapters[0] }) };
}

// ---------------------------------------------------------------------------
// Response transformers
// ---------------------------------------------------------------------------
function transformPaginated(json, contentRange, searchParams) {
  const data = Array.isArray(json) ? json : [];
  const perPage = Math.max(1, Math.min(100, parseInt(searchParams.get('per_page')) || 15));
  const page = Math.max(1, parseInt(searchParams.get('page')) || 1);

  let total = data.length;
  if (contentRange) {
    const m = contentRange.match(/\d+-\d+\/(\d+)/);
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

function transformEdgeFunction(json) {
  return json; // already in { data, message } format
}

// ---------------------------------------------------------------------------
// Main handler — Vercel Edge Function entry point
// ---------------------------------------------------------------------------
export default async function handler(request) {
  const url = new URL(request.url);
  const method = request.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, apikey',
      },
    });
  }

  const route = matchRoute(url.pathname, method);

  if (!route) {
    return new Response(
      JSON.stringify({ message: 'Not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }

  try {
    // Special case: chapter by novel slug + chapter number
    if (route.t.type === 'chapterBySlug') {
      const result = await fetchChapterBySlug(route.params);
      return new Response(result.body, {
        status: result.status,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { url: targetUrl, headers: extraHeaders } = buildTarget(route, url);

    // Build fetch options
    const fetchHeaders = { ...extraHeaders };

    // Passthrough auth header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      fetchHeaders['Authorization'] = authHeader;
    }

    // Passthrough content-type (important for multipart/form-data uploads)
    const contentType = request.headers.get('Content-Type');
    if (contentType) {
      fetchHeaders['Content-Type'] = contentType;
    }

    const fetchInit = {
      method,
      headers: fetchHeaders,
    };

    // Attach body for write methods
    if (!['GET', 'HEAD'].includes(method)) {
      const ct = contentType || '';
      if (ct.includes('multipart/form-data')) {
        fetchInit.body = await request.arrayBuffer();
      } else if (ct.includes('application/json') || ct === '') {
        // Edge Functions: read body as text (handles empty body gracefully)
        const bodyText = await request.text();
        if (bodyText) fetchInit.body = bodyText;
      } else {
        fetchInit.body = await request.arrayBuffer();
      }
    }

    const supabaseRes = await fetch(targetUrl, fetchInit);

    // Build response headers
    const resHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    // 204 No Content
    if (supabaseRes.status === 204) {
      return new Response('', { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    let resBody = await supabaseRes.text();

    // Rewrite internal storage URLs

    const supabaseContentType = supabaseRes.headers.get('Content-Type') || '';
    const isJson = supabaseContentType.includes('application/json');

    // Error passthrough
    if (!supabaseRes.ok) {
      return new Response(isJson ? resBody : JSON.stringify({ message: resBody }), {
        status: supabaseRes.status,
        headers: resHeaders,
      });
    }

    // Non-JSON response — return as-is (unlikely but safe)
    if (!isJson || !resBody) {
      const passthroughHeaders = {
        'Content-Type': supabaseContentType || 'text/plain',
        'Access-Control-Allow-Origin': '*',
      };
      return new Response(resBody || '', { status: supabaseRes.status, headers: passthroughHeaders });
    }

    const json = JSON.parse(resBody);
    const contentRange = supabaseRes.headers.get('Content-Range');

    // Transform response
    let transformed;
    if (route.t.type === 'function') {
      transformed = transformEdgeFunction(json);
    } else if (route.t.single) {
      transformed = transformSingle(json);
    } else if (route.t.paginated) {
      transformed = transformPaginated(json, contentRange, url.searchParams);
    } else if (route.t.list) {
      transformed = transformList(json);
    } else {
      transformed = json;
    }

    return new Response(JSON.stringify(transformed), {
      status: supabaseRes.status,
      headers: resHeaders,
    });
  } catch (error) {
    console.error('[api-adapter]', error.message);
    return new Response(
      JSON.stringify({ message: 'API adapter error', error: error.message }),
      { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
    );
  }
}

// Vercel Edge Function config
export const config = {
  runtime: 'edge',
};
