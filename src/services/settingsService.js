import api from './base';

const settingsService = {
  getAll() {
    return api.get('/admin/settings');
  },
  update(data) {
    return api.put('/admin/settings', data);
  },
};

export default settingsService;
