import axios from 'axios';
import { getToken, clearToken } from './authStorage';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: typeof rawBaseUrl === 'string' ? rawBaseUrl.trim() : rawBaseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(getToken());
      if (hadToken && !window.location.pathname.includes('/login')) {
        clearToken();
        // Redirige vers login pour éviter l'état désynchronisé
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallback) => {
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message || error.message || fallback;
};

export const normalizeUser = (user) => {
  if (!user) return user;

  let rawRole = user.role || '';
  if (typeof rawRole === 'string' && rawRole.startsWith('ROLE_')) {
    rawRole = rawRole.replace('ROLE_', '');
  }

  let role = `ROLE_${rawRole}`;
  if (rawRole === 'ADMINISTRATEUR' || rawRole === 'ADMIN') {
    role = 'ROLE_ADMIN';
  }

  return { ...user, role };
};

export const unwrap = (promise) => promise.then((res) => res.data);

export default apiClient;