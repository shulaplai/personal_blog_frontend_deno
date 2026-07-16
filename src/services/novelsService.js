import api from './base';

const novelsService = {
  getAll(params) {
    return api.get('/admin/novels', { params });
  },
  getOne(id) {
    return api.get(`/admin/novels/${id}`);
  },
  create(data) {
    return api.post('/admin/novels', data);
  },
  update(id, data) {
    return api.put(`/admin/novels/${id}`, data);
  },
  remove(id) {
    return api.delete(`/admin/novels/${id}`);
  },
};

export default novelsService;
