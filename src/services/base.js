import axios from 'axios';
import { storage } from '@/utils/storage';
import { navigateTo } from '@/utils/navigation';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => {
    // Edge case fallback: if a raw PostgREST array arrives (edge function
    // should have transformed it, but be safe), wrap it in { data } format.
    if (Array.isArray(response.data)) {
      return { ...response, data: { data: response.data } };
    }
    return response;
  },
  (error) => {
    // Only handle real 401 (not network errors, not CORS, not 500s)
    if (error.response?.status === 401) {
      // Only clear token and redirect on admin pages
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
        storage.removeToken();
        navigateTo('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
