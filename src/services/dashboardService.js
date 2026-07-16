import api from './base';

const dashboardService = {
  getStats() {
    return api.get('/admin/dashboard');
  },
};

export default dashboardService;
