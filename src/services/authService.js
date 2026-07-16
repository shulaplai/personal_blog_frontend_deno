import api from './base';

const authService = {
  login(credentials) {
    return api.post('/auth/login', credentials);
  },
  logout() {
    return api.post('/auth/logout');
  },
  me() {
    return api.get('/auth/me');
  },
};

export default authService;
