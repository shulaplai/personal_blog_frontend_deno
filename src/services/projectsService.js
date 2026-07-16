import api from './base';

const projectsService = {
  getAll(params) {
    return api.get('/admin/projects', { params });
  },
  getOne(id) {
    return api.get(`/admin/projects/${id}`);
  },
  create(data) {
    return api.post('/admin/projects', data);
  },
  update(id, data) {
    return api.put(`/admin/projects/${id}`, data);
  },
  remove(id) {
    return api.delete(`/admin/projects/${id}`);
  },
};

export default projectsService;
