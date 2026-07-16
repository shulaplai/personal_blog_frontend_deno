import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { clearError, logoutUser } from './authSlice';

function createMockStore() {
  return configureStore({
    reducer: { auth: authReducer },
  });
}

describe('authSlice', () => {
  let store;

  beforeEach(() => {
    store = createMockStore();
    localStorage.clear();
  });

  describe('initial state', () => {
    it('has correct default values', () => {
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.status).toBe('loading'); // auth starts loading until initializeAuth resolves
      expect(state.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      // Set up an error first via a rejected action
      store.dispatch({
        type: 'auth/login/rejected',
        payload: '登入失敗',
      });
      expect(store.getState().auth.error).toBe('登入失敗');

      store.dispatch(clearError());
      expect(store.getState().auth.error).toBeNull();
    });
  });

  describe('logoutUser.fulfilled', () => {
    it('clears user, token, and sets status to idle', () => {
      // Set up authenticated state
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: { token: 'test-token', user: { id: 1, name: 'Test' } },
      });
      expect(store.getState().auth.user).toEqual({ id: 1, name: 'Test' });
      expect(store.getState().auth.token).toBe('test-token');

      store.dispatch({
        type: 'auth/logout/fulfilled',
      });
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.status).toBe('idle');
    });
  });

  describe('loginUser.rejected', () => {
    it('sets status to failed and records error', () => {
      store.dispatch({
        type: 'auth/login/rejected',
        payload: '認證失敗',
      });
      const state = store.getState().auth;
      expect(state.status).toBe('failed');
      expect(state.error).toBe('認證失敗');
    });
  });

  describe('fetchCurrentUser.rejected with 401', () => {
    it('clears user and token on 401', () => {
      // Set up authenticated state first
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: { token: 'test-token', user: { id: 1, name: 'Test' } },
      });

      store.dispatch({
        type: 'auth/me/rejected',
        payload: { message: 'Token expired', status: 401 },
      });
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('fetchCurrentUser.rejected with network error', () => {
    it('does not clear token on non-401 errors', () => {
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: { token: 'test-token', user: { id: 1 } },
      });

      store.dispatch({
        type: 'auth/me/rejected',
        payload: { message: 'Network error', status: 500 },
      });
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      // Token should persist during network/server errors — don't log user out
      expect(state.token).toBe('test-token');
    });
  });
});
