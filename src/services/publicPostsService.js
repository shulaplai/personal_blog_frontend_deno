import api from './base';

/**
 * Public-facing API service for posts.
 * Uses bare endpoints (no /admin prefix, no auth required).
 */
const publicPostsService = {
  getAll(params) {
    return api.get('/posts', { params });
  },
  getBySlug(slug) {
    return api.get(`/posts/${slug}`);
  },
};

export default publicPostsService;
