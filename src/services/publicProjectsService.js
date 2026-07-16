import api from './base';

const publicProjectsService = {
  getAll(params) {
    return api.get('/projects', { params });
  },
  getBySlug(slug) {
    return api.get(`/projects/${slug}`);
  },
};

export default publicProjectsService;
