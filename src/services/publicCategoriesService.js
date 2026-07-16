import api from './base';

const publicCategoriesService = {
  getAll() {
    return api.get('/categories');
  },
};

export default publicCategoriesService;
