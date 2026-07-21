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
      store.dispatch({
        type: fetchProject.fulfilled.type,
        payload: { data: { id: 5, title: 'My Project' } },
      });
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
      store.dispatch({
        type: fetchProjects.fulfilled.type,
        payload: { data: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      });
      store.dispatch({ type: deleteProject.fulfilled.type, payload: 2 });
      expect(store.getState().projects.items).toHaveLength(2);
      expect(store.getState().projects.items.find((p) => p.id === 2)).toBeUndefined();
    });
  });
});
