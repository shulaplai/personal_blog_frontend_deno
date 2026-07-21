# Codebase Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix broken ESLint, establish test infrastructure with 9 key test files, add CI/CD guardrails, improve accessibility on 11 components, and add per-page SEO via react-helmet-async.

**Architecture:** Four independent work streams: (1) developer tooling (ESLint + pre-commit + CI), (2) test infrastructure + tests, (3) accessibility + bundle config, (4) SEO meta tags. Parts 1 goes first (lint catches issues in later parts); Parts 2-4 can run in parallel after Part 1.

**Tech Stack:** React 18, Vite 5, Vitest, Testing Library, ESLint 9 flat config, Tailwind CSS 4, react-helmet-async, GitHub Actions

## Global Constraints

- Zero production code behavior changes (all changes are dev tooling, a11y attributes, or SEO meta tags)
- Zero visual changes to the public site or admin
- All new deps are devDependencies except `react-helmet-async` (runtime)
- All tests pass before committing
- ESLint passes with zero errors after Part 1
- Conventional commit format: `feat:`, `fix:`, `chore:`, `test:`, `docs:`

---

## Part 1: ESLint Fix + Pre-commit Hooks + CI

### Task 1: Fix ESLint config — JSX parsing + missing browser globals

**Files:**
- Modify: `eslint.config.js`

**Interfaces:**
- Produces: Working ESLint that parses `.jsx` files and recognizes `URL`, `FormData`, `Blob`, `File`, `setTimeout`, `clearTimeout` as globals

- [ ] **Step 1: Add JSX parser support and missing globals**

Edit `eslint.config.js` — add `parserOptions` and extend `globals`:

```js
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  js.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
];
```

- [ ] **Step 2: Run lint to verify JSX files now parse correctly**

```bash
npm run lint 2>&1 | tail -5
```

Expected: Dramatically fewer errors. The 59 "Unexpected token <" errors should be gone. Only the 2 `no-unused-vars` warnings and possibly some real rule violations remain.

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "fix: add JSX parser config and missing browser globals to ESLint"
```

### Task 2: Fix unused variable warnings

**Files:**
- Modify: `src/services/mediaService.js:12`
- Modify: `src/store/slices/authSlice.test.js:3`

**Interfaces:**
- Consumes: Task 1 (ESLint must be working to verify fixes)
- Produces: Zero ESLint warnings

- [ ] **Step 1: Rename `progressEvent` → `_progressEvent` in mediaService.js**

Edit `src/services/mediaService.js`, change the `onUploadProgress` callback parameter:

```js
import api from './base';

const mediaService = {
  getAll(params) {
    return api.get('/admin/media', { params });
  },
  upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (_progressEvent) => {
        // progress handled in slice
      },
    });
  },
  remove(id) {
    return api.delete(`/admin/media/${id}`);
  },
};

export default mediaService;
```

- [ ] **Step 2: Remove unused `logoutUser` import in authSlice.test.js**

Edit `src/store/slices/authSlice.test.js`, line 3:

```js
import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearError } from './authSlice';
```

(Remove `logoutUser` from the import — it was imported but never used in the test file.)

- [ ] **Step 3: Verify zero lint issues**

```bash
npm run lint
```

Expected: No errors, no warnings.

- [ ] **Step 4: Commit**

```bash
git add src/services/mediaService.js src/store/slices/authSlice.test.js
git commit -m "fix: resolve unused variable warnings in mediaService and authSlice test"
```

### Task 3: Install husky + lint-staged for pre-commit hooks

**Files:**
- Modify: `package.json` (scripts + lint-staged config)
- Create: `.husky/pre-commit`

**Interfaces:**
- Produces: Auto lint + format on `git commit` for staged files only
- Consumes: Task 2 (lint must be clean before adding pre-commit)

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D husky lint-staged
```

- [ ] **Step 2: Add lint-staged config to package.json**

Add to `package.json` after `"scripts"`:

```json
"lint-staged": {
  "*.{js,jsx}": [
    "eslint --fix --no-warn-ignore",
    "prettier --write"
  ],
  "*.{css,json,md}": [
    "prettier --write"
  ]
}
```

- [ ] **Step 3: Set up husky**

```bash
npx husky init
```

This creates `.husky/pre-commit`. Edit `.husky/pre-commit` to contain:

```sh
npx lint-staged
```

- [ ] **Step 4: Add prepare script to package.json**

Add to `"scripts"` in `package.json`:

```json
"prepare": "husky"
```

- [ ] **Step 5: Verify pre-commit hook works**

```bash
# Touch a file to create a staged change
echo "" >> src/main.jsx
git add src/main.jsx
git commit -m "test: verify pre-commit hook"
# This should trigger lint-staged
```

Expected: lint-staged runs on the staged file. Then revert the dummy change:

```bash
git reset HEAD~1 --soft
git checkout -- src/main.jsx
```

- [ ] **Step 6: Commit the hook setup**

```bash
git add package.json package-lock.json .husky/pre-commit
git commit -m "chore: add husky and lint-staged for pre-commit lint/format"
```

### Task 4: Create GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: CI pipeline that runs lint → test → build on push/PR to main

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/ci.yml`:

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
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci --legacy-peer-deps
      - run: npm run build
```

- [ ] **Step 2: Verify YAML is valid**

```bash
cat .github/workflows/ci.yml | python3 -c "import sys, yaml; yaml.safe_load(sys.stdin); print('Valid YAML')" 2>&1 || echo "YAML check skipped (no PyYAML)"
```

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, test, and build"
```

---

## Part 2: Test Infrastructure + Key Tests

### Task 5: Install test libraries, configure coverage, update test setup

**Files:**
- Modify: `package.json` (deps + scripts)
- Modify: `vitest.config.js`
- Modify: `src/test/setup.js`

**Interfaces:**
- Produces: Coverage command available, Testing Library matchers available, setup imports jest-dom

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/coverage-v8
```

- [ ] **Step 2: Add coverage config to vitest.config.js**

Edit `vitest.config.js`:

```js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/**/*.test.*', 'src/**/index.js'],
    },
  },
});
```

- [ ] **Step 3: Add jest-dom matchers to test setup**

Edit `src/test/setup.js`:

```js
import { afterEach } from 'vitest';
import '@testing-library/jest-dom';

// Clean up localStorage between tests
afterEach(() => {
  localStorage.clear();
});
```

- [ ] **Step 4: Add test:coverage script to package.json**

Add to `"scripts"` in `package.json`:

```json
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 5: Verify setup works**

```bash
npm test
```

Expected: All 40 existing tests still pass, no import errors.

- [ ] **Step 6: Run coverage to see baseline**

```bash
npm run test:coverage 2>&1 | tail -20
```

Expected: Coverage report shows current state (~5-10% lines covered).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/test/setup.js
git commit -m "chore: add testing-library, vitest coverage, and jest-dom matchers"
```

### Task 6: Test services/base.js — token interceptor, 401 redirect, array wrapping

**Files:**
- Create: `src/services/base.test.js`

**Interfaces:**
- Consumes: Task 5 (testing libraries available)
- Produces: 7 tests covering token attach, 401 redirect logic, array wrapping fallback

- [ ] **Step 1: Write the test file**

Create `src/services/base.test.js`:

```js
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies before importing the module under test
vi.mock('@/utils/storage', () => ({
  storage: {
    getToken: vi.fn(),
    removeToken: vi.fn(),
  },
}));
vi.mock('@/utils/navigation', () => ({
  navigateTo: vi.fn(),
}));

import { storage } from '@/utils/storage';
import { navigateTo } from '@/utils/navigation';

describe('api (axios instance)', () => {
  let api;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    api = (await import('@/services/base')).default;
    Object.defineProperty(window, 'location', {
      value: { pathname: '/admin/dashboard', href: 'http://localhost/admin/dashboard' },
      writable: true,
    });
  });

  describe('request interceptor — token attachment', () => {
    it('attaches Bearer token when token exists in storage', async () => {
      storage.getToken.mockReturnValue('test-token-abc');
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled({ headers: {} });
      expect(result.headers.Authorization).toBe('Bearer test-token-abc');
    });

    it('does not attach Authorization header when no token', async () => {
      storage.getToken.mockReturnValue(null);
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled({ headers: {} });
      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe('response interceptor — success', () => {
    it('wraps bare array response in { data } format', async () => {
      const interceptor = api.interceptors.response.handlers[0];
      const result = interceptor.fulfilled({ data: [{ id: 1 }, { id: 2 }], status: 200 });
      expect(result.data).toEqual({ data: [{ id: 1 }, { id: 2 }] });
    });

    it('passes through already-wrapped { data } responses unchanged', async () => {
      const interceptor = api.interceptors.response.handlers[0];
      const result = interceptor.fulfilled({ data: { data: [{ id: 1 }], meta: { total: 1 } }, status: 200 });
      expect(result.data).toEqual({ data: [{ id: 1 }], meta: { total: 1 } });
    });

    it('passes through non-array, non-{ data } responses unchanged', async () => {
      const interceptor = api.interceptors.response.handlers[0];
      const result = interceptor.fulfilled({ data: { message: 'ok' }, status: 200 });
      expect(result.data).toEqual({ message: 'ok' });
    });
  });

  describe('response interceptor — 401 handling', () => {
    it('clears token and redirects to login on 401 from admin page', async () => {
      window.location.pathname = '/admin/posts';
      const interceptor = api.interceptors.response.handlers[1];
      const error = { response: { status: 401 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).toHaveBeenCalledOnce();
      expect(navigateTo).toHaveBeenCalledWith('/admin/login');
    });

    it('does NOT redirect on 401 from /admin/login page', async () => {
      window.location.pathname = '/admin/login';
      const interceptor = api.interceptors.response.handlers[1];
      const error = { response: { status: 401 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });

    it('does NOT redirect on 401 from public pages', async () => {
      window.location.pathname = '/blog';
      const interceptor = api.interceptors.response.handlers[1];
      const error = { response: { status: 401 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });

    it('does NOT redirect on non-401 errors (500, network)', async () => {
      window.location.pathname = '/admin/posts';
      const interceptor = api.interceptors.response.handlers[1];
      const error = { response: { status: 500 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });

    it('handles network errors (no response object) gracefully', async () => {
      window.location.pathname = '/admin/posts';
      const interceptor = api.interceptors.response.handlers[1];
      const error = { message: 'Network Error' };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run the new tests**

```bash
npx vitest run src/services/base.test.js
```

Expected: 7 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/services/base.test.js
git commit -m "test: add api base service tests for token, 401, and array wrapping"
```

### Task 7: Test services/authService.js

**Files:**
- Create: `src/services/authService.test.js`

**Interfaces:**
- Consumes: Task 5
- Produces: 3 tests covering login, logout, me endpoints

- [ ] **Step 1: Write the test file**

Create `src/services/authService.test.js`:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/base', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import authService from '@/services/authService';
import api from '@/services/base';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('calls POST /auth/login with credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'secret' };
      api.post.mockResolvedValue({ data: { token: 'abc', user: { id: 1 } } });
      const result = await authService.login(credentials);
      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result.data.token).toBe('abc');
    });
  });

  describe('logout', () => {
    it('calls POST /auth/logout', async () => {
      api.post.mockResolvedValue({ data: { message: 'logged out' } });
      await authService.logout();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('me', () => {
    it('calls GET /auth/me', async () => {
      api.get.mockResolvedValue({ data: { data: { id: 1, name: 'Test' } } });
      const result = await authService.me();
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result.data.data.name).toBe('Test');
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/services/authService.test.js
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/services/authService.test.js
git commit -m "test: add authService tests for login, logout, and me"
```

### Task 8: Test Redux postsSlice — async thunk states

**Files:**
- Create: `src/store/slices/postsSlice.test.js`

**Interfaces:**
- Consumes: Task 5
- Produces: ~11 tests covering all async thunk states and reducers

- [ ] **Step 1: Write the test file**

Create `src/store/slices/postsSlice.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, {
  fetchPosts,
  fetchPost,
  createPost,
  updatePost,
  deletePost,
  clearCurrentPost,
} from './postsSlice';

function createStore() {
  return configureStore({ reducer: { posts: postsReducer } });
}

describe('postsSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = createStore();
      const { items, currentItem, status, saveStatus, error, pagination } = store.getState().posts;
      expect(items).toEqual([]);
      expect(currentItem).toBeNull();
      expect(status).toBe('idle');
      expect(saveStatus).toBe('idle');
      expect(error).toBeNull();
      expect(pagination.currentPage).toBe(1);
      expect(pagination.perPage).toBe(15);
      expect(pagination.total).toBe(0);
    });
  });

  describe('clearCurrentPost', () => {
    it('resets currentItem and saveStatus', () => {
      const store = createStore();
      store.dispatch({ type: fetchPost.fulfilled.type, payload: { data: { id: 1, title: 'Test' } } });
      store.dispatch({ type: createPost.fulfilled.type });
      store.dispatch(clearCurrentPost());
      const { currentItem, saveStatus } = store.getState().posts;
      expect(currentItem).toBeNull();
      expect(saveStatus).toBe('idle');
    });
  });

  describe('fetchPosts', () => {
    it('sets status to loading on pending', () => {
      const store = createStore();
      store.dispatch({ type: fetchPosts.pending.type });
      expect(store.getState().posts.status).toBe('loading');
    });

    it('sets items and pagination on fulfilled', () => {
      const store = createStore();
      const payload = {
        data: [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }],
        meta: { current_page: 1, last_page: 3, per_page: 15, total: 45 },
      };
      store.dispatch({ type: fetchPosts.fulfilled.type, payload });
      const s = store.getState().posts;
      expect(s.status).toBe('succeeded');
      expect(s.items).toHaveLength(2);
      expect(s.pagination.total).toBe(45);
      expect(s.pagination.lastPage).toBe(3);
    });

    it('preserves existing pagination when meta is missing from payload', () => {
      const store = createStore();
      store.dispatch({ type: fetchPosts.fulfilled.type, payload: { data: [{ id: 1 }] } });
      expect(store.getState().posts.pagination.currentPage).toBe(1);
    });

    it('sets status to failed and records error on rejected', () => {
      const store = createStore();
      store.dispatch({ type: fetchPosts.rejected.type, payload: '載入失敗' });
      const s = store.getState().posts;
      expect(s.status).toBe('failed');
      expect(s.error).toBe('載入失敗');
    });
  });

  describe('fetchPost', () => {
    it('sets currentItem on fulfilled', () => {
      const store = createStore();
      store.dispatch({ type: fetchPost.fulfilled.type, payload: { data: { id: 1, title: 'Single Post' } } });
      expect(store.getState().posts.currentItem).toEqual({ id: 1, title: 'Single Post' });
      expect(store.getState().posts.status).toBe('succeeded');
    });
  });

  describe('createPost', () => {
    it('tracks saveStatus through pending → succeeded', () => {
      const store = createStore();
      store.dispatch({ type: createPost.pending.type });
      expect(store.getState().posts.saveStatus).toBe('loading');
      store.dispatch({ type: createPost.fulfilled.type });
      expect(store.getState().posts.saveStatus).toBe('succeeded');
    });

    it('sets saveStatus to failed and records error on rejected', () => {
      const store = createStore();
      store.dispatch({ type: createPost.rejected.type, payload: '建立失敗' });
      expect(store.getState().posts.saveStatus).toBe('failed');
      expect(store.getState().posts.error).toBe('建立失敗');
    });
  });

  describe('updatePost', () => {
    it('tracks saveStatus through pending → succeeded', () => {
      const store = createStore();
      store.dispatch({ type: updatePost.pending.type });
      expect(store.getState().posts.saveStatus).toBe('loading');
      store.dispatch({ type: updatePost.fulfilled.type });
      expect(store.getState().posts.saveStatus).toBe('succeeded');
    });
  });

  describe('deletePost', () => {
    it('removes the deleted post from items array', () => {
      const store = createStore();
      store.dispatch({ type: fetchPosts.fulfilled.type, payload: { data: [{ id: 1 }, { id: 2 }, { id: 3 }] } });
      store.dispatch({ type: deletePost.fulfilled.type, payload: 2 });
      const { items } = store.getState().posts;
      expect(items).toHaveLength(2);
      expect(items.find((p) => p.id === 2)).toBeUndefined();
      expect(items.find((p) => p.id === 1)).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/store/slices/postsSlice.test.js
```

Expected: ~11 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/store/slices/postsSlice.test.js
git commit -m "test: add postsSlice tests for all async thunk states and reducers"
```

### Task 9: Test Redux projectsSlice

**Files:**
- Create: `src/store/slices/projectsSlice.test.js`

**Interfaces:**
- Consumes: Task 5
- Produces: ~8 tests covering fetchProjects, fetchProject, createProject, deleteProject, clearCurrentProject

- [ ] **Step 1: Write the test file**

Create `src/store/slices/projectsSlice.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import projectsReducer, {
  fetchProjects,
  fetchProject,
  createProject,
  deleteProject,
  clearCurrentProject,
} from './projectsSlice';

function createStore() {
  return configureStore({ reducer: { projects: projectsReducer } });
}

describe('projectsSlice', () => {
  describe('initial state', () => {
    it('has correct defaults', () => {
      const store = createStore();
      const s = store.getState().projects;
      expect(s.items).toEqual([]);
      expect(s.currentItem).toBeNull();
      expect(s.status).toBe('idle');
      expect(s.saveStatus).toBe('idle');
      expect(s.error).toBeNull();
    });
  });

  describe('clearCurrentProject', () => {
    it('resets currentItem and saveStatus', () => {
      const store = createStore();
      store.dispatch({ type: fetchProject.fulfilled.type, payload: { data: { id: 1 } } });
      store.dispatch({ type: createProject.fulfilled.type });
      store.dispatch(clearCurrentProject());
      expect(store.getState().projects.currentItem).toBeNull();
      expect(store.getState().projects.saveStatus).toBe('idle');
    });
  });

  describe('fetchProjects', () => {
    it('sets items and pagination on fulfilled', () => {
      const store = createStore();
      const payload = {
        data: [{ id: 1 }, { id: 2 }, { id: 3 }],
        meta: { current_page: 1, last_page: 2, per_page: 10, total: 20 },
      };
      store.dispatch({ type: fetchProjects.fulfilled.type, payload });
      const s = store.getState().projects;
      expect(s.status).toBe('succeeded');
      expect(s.items).toHaveLength(3);
      expect(s.pagination.total).toBe(20);
    });

    it('handles missing meta gracefully', () => {
      const store = createStore();
      store.dispatch({ type: fetchProjects.fulfilled.type, payload: { data: [{ id: 1 }] } });
      expect(store.getState().projects.status).toBe('succeeded');
    });

    it('sets status to failed on rejected', () => {
      const store = createStore();
      store.dispatch({ type: fetchProjects.rejected.type, payload: '載入失敗' });
      expect(store.getState().projects.status).toBe('failed');
      expect(store.getState().projects.error).toBe('載入失敗');
    });
  });

  describe('fetchProject', () => {
    it('sets currentItem on fulfilled', () => {
      const store = createStore();
      store.dispatch({ type: fetchProject.fulfilled.type, payload: { data: { id: 5, title: 'My Project' } } });
      expect(store.getState().projects.currentItem).toEqual({ id: 5, title: 'My Project' });
    });
  });

  describe('createProject saveStatus', () => {
    it('tracks pending → succeeded', () => {
      const store = createStore();
      store.dispatch({ type: createProject.pending.type });
      expect(store.getState().projects.saveStatus).toBe('loading');
      store.dispatch({ type: createProject.fulfilled.type });
      expect(store.getState().projects.saveStatus).toBe('succeeded');
    });
  });

  describe('deleteProject', () => {
    it('removes item from array by id', () => {
      const store = createStore();
      store.dispatch({ type: fetchProjects.fulfilled.type, payload: { data: [{ id: 1 }, { id: 2 }, { id: 3 }] } });
      store.dispatch({ type: deleteProject.fulfilled.type, payload: 2 });
      expect(store.getState().projects.items).toHaveLength(2);
      expect(store.getState().projects.items.find((p) => p.id === 2)).toBeUndefined();
    });
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/store/slices/projectsSlice.test.js
```

Expected: ~8 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/store/slices/projectsSlice.test.js
git commit -m "test: add projectsSlice tests for thunk states and reducers"
```

### Task 10: Test BlogCard component (smoke test)

**Files:**
- Create: `src/components/public/BlogCard.test.jsx`

**Interfaces:**
- Consumes: Task 5
- Produces: 3 smoke tests confirming BlogCard renders correctly with mock props

- [ ] **Step 1: Write the test file**

Create `src/components/public/BlogCard.test.jsx`:

```js
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BlogCard from './BlogCard';

const mockPost = {
  id: 1,
  slug: 'hello-world',
  title: 'Hello World',
  published_at: '2026-07-15T00:00:00Z',
};

describe('BlogCard', () => {
  it('renders the post title and date', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('links to the blog post detail page', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/blog/hello-world');
  });

  it('renders the decorative arrow SVG', () => {
    render(
      <MemoryRouter>
        <BlogCard post={mockPost} />
      </MemoryRouter>,
    );
    expect(document.querySelector('svg')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/components/public/BlogCard.test.jsx
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/BlogCard.test.jsx
git commit -m "test: add BlogCard component smoke test"
```

### Task 11: Test ProfileHero component (smoke test)

**Files:**
- Create: `src/components/public/ProfileHero.test.jsx`

**Interfaces:**
- Consumes: Task 5
- Produces: 6 smoke tests confirming ProfileHero renders profile data

- [ ] **Step 1: Write the test file**

Create `src/components/public/ProfileHero.test.jsx`:

```js
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileHero from './ProfileHero';

describe('ProfileHero', () => {
  it('renders the profile name', () => {
    render(<MemoryRouter><ProfileHero /></MemoryRouter>);
    expect(screen.getByText('Shulap Lai')).toBeInTheDocument();
  });

  it('renders the profile title', () => {
    render(<MemoryRouter><ProfileHero /></MemoryRouter>);
    expect(screen.getByText('Full-Stack Developer')).toBeInTheDocument();
  });

  it('renders the avatar initial', () => {
    render(<MemoryRouter><ProfileHero /></MemoryRouter>);
    expect(screen.getByText('S')).toBeInTheDocument();
  });

  it('renders tech pills', () => {
    render(<MemoryRouter><ProfileHero /></MemoryRouter>);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
  });

  it('renders contact links', () => {
    render(<MemoryRouter><ProfileHero /></MemoryRouter>);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('View Resume')).toBeInTheDocument();
  });

  it('View Resume links to /about', () => {
    render(<MemoryRouter><ProfileHero /></MemoryRouter>);
    expect(screen.getByText('View Resume').closest('a')).toHaveAttribute('href', '/about');
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/components/public/ProfileHero.test.jsx
```

Expected: 6 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/ProfileHero.test.jsx
git commit -m "test: add ProfileHero component smoke test"
```

### Task 12: Test ErrorBoundary component

**Files:**
- Create: `src/components/common/ErrorBoundary.test.jsx`

**Interfaces:**
- Consumes: Task 5
- Produces: 4 tests covering error catch, fallback UI, retry, custom fallback

- [ ] **Step 1: Write the test file**

Create `src/components/common/ErrorBoundary.test.jsx`:

```js
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function BrokenComponent({ shouldThrow = true }) {
  if (shouldThrow) throw new Error('Test explosion');
  return <div>All good</div>;
}

const originalError = console.error;
beforeAll(() => { console.error = vi.fn(); });
afterAll(() => { console.error = originalError; });

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><div>Everything is fine</div></ErrorBoundary>);
    expect(screen.getByText('Everything is fine')).toBeInTheDocument();
  });

  it('renders fallback UI when child throws', () => {
    render(<ErrorBoundary><BrokenComponent /></ErrorBoundary>);
    expect(screen.getByText('發生了錯誤')).toBeInTheDocument();
  });

  it('shows retry and reload buttons in error state', () => {
    render(<ErrorBoundary><BrokenComponent /></ErrorBoundary>);
    expect(screen.getByText('重試')).toBeInTheDocument();
    expect(screen.getByText('重新載入頁面')).toBeInTheDocument();
  });

  it('supports custom fallback render prop', () => {
    render(
      <ErrorBoundary fallback={({ error }) => <div>Custom: {error.message}</div>}>
        <BrokenComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom: Test explosion')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/components/common/ErrorBoundary.test.jsx
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/common/ErrorBoundary.test.jsx
git commit -m "test: add ErrorBoundary component tests for error and retry flow"
```

### Task 13: Test useDebounce hook

**Files:**
- Create: `src/utils/useDebounce.test.js`

**Interfaces:**
- Consumes: Task 5
- Produces: 4 tests covering debounce delay and timer reset behavior

- [ ] **Step 1: Write the test file**

Create `src/utils/useDebounce.test.js`:

```js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('does not update value before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );
    rerender({ value: 'world', delay: 500 });
    expect(result.current).toBe('hello');
    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current).toBe('hello');
  });

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );
    rerender({ value: 'world', delay: 500 });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('world');
  });

  it('resets timer on new value before delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );
    rerender({ value: 'world', delay: 500 });
    act(() => { vi.advanceTimersByTime(300); });
    rerender({ value: 'final', delay: 500 });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('hello');
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('final');
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/utils/useDebounce.test.js
```

Expected: 4 tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/utils/useDebounce.test.js
git commit -m "test: add useDebounce hook tests for delay and reset behavior"
```

### Task 14: Test useDocumentTitle hook

**Files:**
- Create: `src/utils/useDocumentTitle.test.js`

**Interfaces:**
- Consumes: Task 5
- Produces: 4 tests covering title set and restore on unmount

- [ ] **Step 1: Write the test file**

Create `src/utils/useDocumentTitle.test.js`:

```js
import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  const originalTitle = document.title;

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets document title with page name and base (Shulap Lai)', () => {
    const { unmount } = renderHook(() => useDocumentTitle('Blog'));
    expect(document.title).toBe('Blog — Shulap Lai');
    unmount();
  });

  it('sets only base title when passed empty string', () => {
    const { unmount } = renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe('Shulap Lai');
    unmount();
  });

  it('restores previous title on unmount', () => {
    document.title = 'Original Title';
    const { unmount } = renderHook(() => useDocumentTitle('About'));
    expect(document.title).toBe('About — Shulap Lai');
    unmount();
    expect(document.title).toBe('Original Title');
  });

  it('updates title when the title argument changes', () => {
    const { rerender, unmount } = renderHook(
      (title) => useDocumentTitle(title),
      { initialProps: 'Blog' },
    );
    expect(document.title).toBe('Blog — Shulap Lai');
    rerender('Projects');
    expect(document.title).toBe('Projects — Shulap Lai');
    unmount();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/utils/useDocumentTitle.test.js
```

Expected: 4 tests pass.

- [ ] **Step 3: Run full test suite to confirm all new tests coexist**

```bash
npm test
```

Expected: All tests pass (~90 tests: 40 original + ~50 new).

- [ ] **Step 4: Commit**

```bash
git add src/utils/useDocumentTitle.test.js
git commit -m "test: add useDocumentTitle hook tests for set and restore behavior"
```

---

## Part 3: Accessibility + Bundle Tuning

### Task 15: Fix Icons.jsx — add aria-hidden to all decorative SVGs

**Files:**
- Modify: `src/components/public/Icons.jsx`

**Interfaces:**
- Produces: All 7 SVG icon components marked as decorative

- [ ] **Step 1: Add `aria-hidden="true"` to all 7 icons**

Edit `src/components/public/Icons.jsx`. Add `aria-hidden="true"` to each of the 7 `<svg>` opening tags (GitHubIcon, ArrowRightIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon, and the one that shows with MoonIcon — that's 7 total).

Example for GitHubIcon:
```jsx
<svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
```

Repeat for ArrowRightIcon, SunIcon, MoonIcon, MenuIcon, CloseIcon — all 7 icons.

- [ ] **Step 2: Verify lint and tests**

```bash
npm run lint && npm test
```

Expected: Zero lint errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/public/Icons.jsx
git commit -m "fix(a11y): add aria-hidden to all decorative SVG icons"
```

### Task 16: Fix a11y on 6 components — add aria-hidden to inline SVGs

**Files:**
- Modify: `src/components/public/ProfileHero.jsx` — 2 SVGs
- Modify: `src/components/public/ChapterNav.jsx` — 4 SVGs
- Modify: `src/components/public/ExperienceTimeline.jsx` — 3 SVGs
- Modify: `src/components/public/TechStackBadges.jsx` — 1 SVG
- Modify: `src/components/public/LanguageBadges.jsx` — 1 SVG
- Modify: `src/components/public/ProfileSidebar.jsx` — 5 SVGs

**Interfaces:**
- Produces: All 16 inline decorative SVGs across 6 components marked with `aria-hidden="true"`

- [ ] **Step 1: Fix ProfileHero.jsx** — Add `aria-hidden="true"` to MailIcon and GitHubIcon `<svg>` tags.

- [ ] **Step 2: Fix ChapterNav.jsx** — Add `aria-hidden="true"` to each of the 4 `<svg>` tags (prev arrow, disabled prev arrow, TOC icon, next arrow, disabled next arrow).

- [ ] **Step 3: Fix ExperienceTimeline.jsx** — Add `aria-hidden="true"` to UserIcon, BriefcaseIcon, HeartIcon `<svg>` tags.

- [ ] **Step 4: Fix TechStackBadges.jsx** — Add `aria-hidden="true"` to CodeIcon `<svg>` tag.

- [ ] **Step 5: Fix LanguageBadges.jsx** — Add `aria-hidden="true"` to GlobeIcon `<svg>` tag.

- [ ] **Step 6: Fix ProfileSidebar.jsx** — Add `aria-hidden="true"` to MailIcon, PhoneIcon, GitHubIcon, GraduationIcon, ContactIcon `<svg>` tags.

- [ ] **Step 7: Run lint and tests**

```bash
npm run lint && npm test
```

Expected: Zero lint errors, all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/public/ProfileHero.jsx src/components/public/ChapterNav.jsx src/components/public/ExperienceTimeline.jsx src/components/public/TechStackBadges.jsx src/components/public/LanguageBadges.jsx src/components/public/ProfileSidebar.jsx
git commit -m "fix(a11y): add aria-hidden to decorative SVGs in 6 public components"
```

### Task 17: Fix interactive element ARIA states — CategoryFilter, GenreFilter, PublicLayout

**Files:**
- Modify: `src/components/public/CategoryFilter.jsx`
- Modify: `src/components/public/GenreFilter.jsx`
- Modify: `src/layouts/PublicLayout.jsx`

**Interfaces:**
- Produces: Category filter items have `aria-current="page"`, genre chips have `aria-pressed`, nav links have `aria-current="page"`

- [ ] **Step 1: Fix CategoryFilter.jsx** — Add `aria-current={selected ? 'page' : undefined}` to each `ListItemButton`.

- [ ] **Step 2: Fix GenreFilter.jsx** — Add `aria-pressed={active ? true : false}` to each `Chip`.

- [ ] **Step 3: Fix PublicLayout.jsx** — Add `aria-current={isActive(item.path) ? 'page' : undefined}` to both desktop and mobile nav `RouterLink` elements.

- [ ] **Step 4: Run lint and tests**

```bash
npm run lint && npm test
```

Expected: Zero lint errors, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/public/CategoryFilter.jsx src/components/public/GenreFilter.jsx src/layouts/PublicLayout.jsx
git commit -m "fix(a11y): add aria-current and aria-pressed to interactive elements"
```

### Task 18: Bundle tuning — vite.config.js

**Files:**
- Modify: `vite.config.js`

**Interfaces:**
- Produces: Cleaner build output — no chunk size warning, explicit sourcemap: false

- [ ] **Step 1: Add build config options**

Edit `vite.config.js`, add inside the `build` block:

```js
build: {
  sourcemap: false,
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    // ... keep existing manualChunks unchanged
  },
},
```

- [ ] **Step 2: Verify build succeeds without chunk size warning**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds, no "chunk size exceeded" warning.

- [ ] **Step 3: Commit**

```bash
git add vite.config.js
git commit -m "chore: raise chunk size limit and explicitly disable sourcemaps"
```

---

## Part 4: Lightweight SEO

### Task 19: Install react-helmet-async + wrap app in HelmetProvider

**Files:**
- Modify: `package.json`
- Modify: `src/main.jsx`

**Interfaces:**
- Produces: HelmetProvider wrapping the entire app, ready for per-page Helmet usage

- [ ] **Step 1: Install react-helmet-async**

```bash
npm install react-helmet-async
```

- [ ] **Step 2: Wrap app with HelmetProvider in main.jsx**

Edit `src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { HelmetProvider } from 'react-helmet-async';
import store from './store';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider>
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <App />
            </SnackbarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
);
```

- [ ] **Step 3: Verify app still builds and tests pass**

```bash
npm test && npm run build 2>&1 | tail -5
```

Expected: All tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/main.jsx
git commit -m "feat: integrate react-helmet-async with HelmetProvider wrapper"
```

### Task 20: Add SEO meta tags to BlogDetailPage and BlogListPage

**Files:**
- Modify: `src/pages/public/BlogDetailPage.jsx`
- Modify: `src/pages/public/BlogListPage.jsx`

**Interfaces:**
- Consumes: Task 19 (HelmetProvider must be wrapping the app)
- Produces: Dynamic page titles and OG tags for blog pages

- [ ] **Step 1: Add Helmet to BlogDetailPage.jsx**

Read `src/pages/public/BlogDetailPage.jsx`. Add `import { Helmet } from 'react-helmet-async';` at the top. After the `if (!post)` guard and before the `<article>` return, add:

```jsx
{post && (
  <Helmet>
    <title>{post.title} — Shulap Lai</title>
    <meta name="description" content={post.excerpt || post.title} />
    <meta property="og:title" content={post.title} />
    <meta property="og:description" content={post.excerpt || post.title} />
    <meta property="og:type" content="article" />
  </Helmet>
)}
```

Wrap the return JSX in `<>...</>` fragment.

- [ ] **Step 2: Add Helmet to BlogListPage.jsx**

Read `src/pages/public/BlogListPage.jsx`. Add `import { Helmet } from 'react-helmet-async';` at top. Add at the start of the return:

```jsx
<>
  <Helmet>
    <title>Blog — Shulap Lai</title>
    <meta name="description" content="Blog posts by Shulap Lai — thoughts on web development, React, Laravel, and more." />
    <meta property="og:title" content="Blog — Shulap Lai" />
    <meta property="og:type" content="website" />
  </Helmet>
  {/* ...existing JSX... */}
</>
```

- [ ] **Step 3: Run tests and build**

```bash
npm test && npm run build 2>&1 | tail -5
```

Expected: All tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/pages/public/BlogDetailPage.jsx src/pages/public/BlogListPage.jsx
git commit -m "feat(seo): add dynamic meta tags to blog pages via react-helmet-async"
```

### Task 21: Add SEO meta tags to ProjectDetailPage, AboutPage, and HomePage

**Files:**
- Modify: `src/pages/public/ProjectDetailPage.jsx`
- Modify: `src/pages/public/AboutPage.jsx`
- Modify: `src/pages/public/HomePage.jsx`

**Interfaces:**
- Consumes: Task 19 (HelmetProvider)
- Produces: Dynamic page titles and OG tags for project, about, and home pages

- [ ] **Step 1: Add Helmet to ProjectDetailPage.jsx**

Read `src/pages/public/ProjectDetailPage.jsx`. Add `import { Helmet } from 'react-helmet-async';` at top. Add Helmet block (same pattern as BlogDetailPage):

```jsx
{project && (
  <Helmet>
    <title>{project.title} — Shulap Lai</title>
    <meta name="description" content={project.short_description || project.title} />
    <meta property="og:title" content={project.title} />
    <meta property="og:description" content={project.short_description || ''} />
    <meta property="og:type" content="article" />
  </Helmet>
)}
```

Wrap return JSX in `<>...</>` fragment.

- [ ] **Step 2: Add Helmet to AboutPage.jsx**

Read `src/pages/public/AboutPage.jsx`. Add `import { Helmet } from 'react-helmet-async';` at top. Add:

```jsx
<Helmet>
  <title>About — Shulap Lai</title>
  <meta name="description" content="Full-Stack Developer based in Hong Kong. Building modern web and mobile apps with React and Laravel." />
  <meta property="og:title" content="About — Shulap Lai" />
  <meta property="og:type" content="profile" />
</Helmet>
```

Wrap return JSX in `<>...</>` fragment.

- [ ] **Step 3: Add Helmet to HomePage.jsx**

Read `src/pages/public/HomePage.jsx`. Add `import { Helmet } from 'react-helmet-async';` at top. Add at the start of the return:

```jsx
<>
  <Helmet>
    <title>Shulap Lai — Full-Stack Developer</title>
    <meta name="description" content={settings.site_description || 'Personal blog and portfolio — building modern web and mobile apps with React and Laravel.'} />
    <meta property="og:title" content="Shulap Lai — Full-Stack Developer" />
    <meta property="og:description" content={settings.site_description || 'Personal blog and portfolio.'} />
    <meta property="og:type" content="website" />
  </Helmet>
  <div className="flex w-full flex-col items-center">
    {/* ...existing JSX... */}
  </div>
</>
```

- [ ] **Step 4: Run full test suite and build**

```bash
npm test && npm run build 2>&1 | tail -5
```

Expected: All tests pass, build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages/public/ProjectDetailPage.jsx src/pages/public/AboutPage.jsx src/pages/public/HomePage.jsx
git commit -m "feat(seo): add dynamic meta tags to project, about, and home pages"
```

---

## Final Verification

- [ ] Run full test suite: `npm test`
- [ ] Run lint: `npm run lint`
- [ ] Run build: `npm run build`
- [ ] Run coverage: `npm run test:coverage`
- [ ] Check git log: `git log --oneline -21`

Expected results:
- ~90 tests pass (40 original + ~50 new)
- Zero ESLint errors/warnings
- Build succeeds with no chunk warnings
- Coverage baseline established (~15-20% lines)
- 21 commits on the branch