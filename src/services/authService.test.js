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
