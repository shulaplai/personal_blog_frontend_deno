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
      store.dispatch({
        type: fetchPost.fulfilled.type,
        payload: { data: { id: 1, title: 'Test' } },
      });
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
        data: [
          { id: 1, title: 'Post 1' },
          { id: 2, title: 'Post 2' },
        ],
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
      store.dispatch({
        type: fetchPost.fulfilled.type,
        payload: { data: { id: 1, title: 'Single Post' } },
      });
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
      store.dispatch({
        type: fetchPosts.fulfilled.type,
        payload: { data: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      });
      store.dispatch({ type: deletePost.fulfilled.type, payload: 2 });
      const { items } = store.getState().posts;
      expect(items).toHaveLength(2);
      expect(items.find((p) => p.id === 2)).toBeUndefined();
      expect(items.find((p) => p.id === 1)).toBeDefined();
    });
  });
});
