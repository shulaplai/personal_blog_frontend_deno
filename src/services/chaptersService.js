import api from './base';

const chaptersService = {
  getAll(novelId) {
    return api.get(`/admin/novels/${novelId}/chapters`);
  },
  getOne(novelId, chapterId) {
    return api.get(`/admin/novels/${novelId}/chapters/${chapterId}`);
  },
  create(novelId, data) {
    return api.post(`/admin/novels/${novelId}/chapters`, data);
  },
  update(novelId, chapterId, data) {
    return api.put(`/admin/novels/${novelId}/chapters/${chapterId}`, data);
  },
  remove(novelId, chapterId) {
    return api.delete(`/admin/novels/${novelId}/chapters/${chapterId}`);
  },
};

export default chaptersService;
