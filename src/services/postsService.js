import api from './base';

const postsService = {
  getAll(params) {
    return api.get('/admin/posts', { params });
  },
  getOne(id) {
    return api.get(`/admin/posts/${id}`);
  },
  create(data) {
    return api.post('/admin/posts', data);
  },
  update(id, data) {
    return api.put(`/admin/posts/${id}`, data);
  },
  remove(id) {
    return api.delete(`/admin/posts/${id}`);
  },
};

export default postsService;
