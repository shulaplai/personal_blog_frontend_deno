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
      const result = interceptor.fulfilled({
        data: { data: [{ id: 1 }], meta: { total: 1 } },
        status: 200,
      });
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
      const interceptor = api.interceptors.response.handlers[0];
      const error = { response: { status: 401 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).toHaveBeenCalledOnce();
      expect(navigateTo).toHaveBeenCalledWith('/admin/login');
    });

    it('does NOT redirect on 401 from /admin/login page', async () => {
      window.location.pathname = '/admin/login';
      const interceptor = api.interceptors.response.handlers[0];
      const error = { response: { status: 401 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });

    it('does NOT redirect on 401 from public pages', async () => {
      window.location.pathname = '/blog';
      const interceptor = api.interceptors.response.handlers[0];
      const error = { response: { status: 401 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });

    it('does NOT redirect on non-401 errors (500, network)', async () => {
      window.location.pathname = '/admin/posts';
      const interceptor = api.interceptors.response.handlers[0];
      const error = { response: { status: 500 } };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });

    it('handles network errors (no response object) gracefully', async () => {
      window.location.pathname = '/admin/posts';
      const interceptor = api.interceptors.response.handlers[0];
      const error = { message: 'Network Error' };
      await expect(interceptor.rejected(error)).rejects.toEqual(error);
      expect(storage.removeToken).not.toHaveBeenCalled();
    });
  });
});
