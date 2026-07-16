import api from './base';

const publicSettingsService = {
  get() {
    return api.get('/site-settings');
  },
};

export default publicSettingsService;
