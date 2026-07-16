import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('token', () => {
    it('returns null when no token is set', () => {
      expect(storage.getToken()).toBeNull();
    });

    it('sets and retrieves token', () => {
      storage.setToken('test-token-123');
      expect(storage.getToken()).toBe('test-token-123');
    });

    it('removes token', () => {
      storage.setToken('test-token-123');
      storage.removeToken();
      expect(storage.getToken()).toBeNull();
    });
  });

  describe('dark mode', () => {
    it('returns null when no preference is set', () => {
      expect(storage.getDarkMode()).toBeNull();
    });

    it('returns true when dark mode is enabled', () => {
      storage.setDarkMode(true);
      expect(storage.getDarkMode()).toBe(true);
    });

    it('returns false when dark mode is explicitly disabled', () => {
      storage.setDarkMode(false);
      expect(storage.getDarkMode()).toBe(false);
    });

    it('removes dark mode preference', () => {
      storage.setDarkMode(true);
      storage.removeDarkMode();
      expect(storage.getDarkMode()).toBeNull();
    });
  });
});
