import axios from 'axios';

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
    const token = localStorage.getItem('token');
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
      const hadToken = Boolean(localStorage.getItem('token'));
      if (hadToken && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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