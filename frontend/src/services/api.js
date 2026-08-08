import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

const PUBLIC_ENDPOINTS = ['/foods', '/foods/'];

const isPublicRequest = (url = '') =>
  PUBLIC_ENDPOINTS.some((endpoint) => url === endpoint || url.startsWith(`${endpoint}?`));

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const method = (config.method || 'get').toLowerCase();
    const requestUrl = config.url || '';
    const isPublic = isPublicRequest(requestUrl);
    const token = localStorage.getItem('token');

    if (method !== 'get' && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (token && !isPublic) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAuthAction = url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthAction) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
