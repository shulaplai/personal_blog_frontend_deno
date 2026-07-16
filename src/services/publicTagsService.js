import api from './base';

const publicTagsService = {
  getAll() {
    return api.get('/tags');
  },
};

export default publicTagsService;
