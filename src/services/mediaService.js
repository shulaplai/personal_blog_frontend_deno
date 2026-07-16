import api from './base';

const mediaService = {
  getAll(params) {
    return api.get('/admin/media', { params });
  },
  upload(file) {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        // progress handled in slice
      },
    });
  },
  remove(id) {
    return api.delete(`/admin/media/${id}`);
  },
};

export default mediaService;
