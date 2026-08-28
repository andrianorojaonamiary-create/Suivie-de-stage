import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiErrorMessage = (error, fallback) => {
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message || error.message || fallback;
};

export const normalizeUser = (user) => {
  if (!user) return user;

  const role = user.role?.startsWith('ROLE_')
    ? user.role
    : `ROLE_${user.role}`;

  return { ...user, role };
};

export default apiClient;