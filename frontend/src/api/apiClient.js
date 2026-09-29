import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: typeof rawBaseUrl === 'string' ? rawBaseUrl.trim() : rawBaseUrl,
  timeout: 15000,
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

/**
 * Événement émis quand le serveur refuse le token (401) alors qu'on en avait
 * un. L'intercepteur vit hors de React : il ne peut ni accéder au contexte ni
 * appeler navigate(). Il se contente donc de nettoyer le stockage et de
 * prévenir AuthProvider, qui réinitialise son état et redirige via le router.
 */
export const UNAUTHORIZED_EVENT = 'auth:unauthorized';

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem('token'));
      if (hadToken) {
        localStorage.removeItem('token');
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
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