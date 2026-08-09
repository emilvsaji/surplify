import axios from 'axios';

const formatApiUrl = (rawUrl) => {

  let url = (rawUrl || '').trim();
  if (!url) {
    return 'http://localhost:5000/api';
  }
  // Ensure protocol is present if not a relative proxy path
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Ensure /api suffix is present
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_URL = formatApiUrl(import.meta.env.VITE_API_URL);

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
