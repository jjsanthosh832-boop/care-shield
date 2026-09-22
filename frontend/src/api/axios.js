import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const user = localStorage.getItem('care_shield_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.id) {
        config.headers['X-User-ID'] = parsed.id;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('care_shield_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;