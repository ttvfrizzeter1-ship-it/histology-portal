import axios from 'axios';

function resolveBaseURL() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl) return envUrl.replace(/\/$/, '');

  // Render static frontend fallback (when FE/BE are separate services).
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    if (window.location.hostname === 'histology-portal-frontend.onrender.com') {
      return 'https://histology-portal-backend.onrender.com/api';
    }
  }

  // Works for local dev proxy and single-service production deployment.
  return '/api';
}

const baseURL = resolveBaseURL();
const api = axios.create({ baseURL });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
