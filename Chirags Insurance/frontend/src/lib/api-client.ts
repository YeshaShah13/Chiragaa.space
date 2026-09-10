import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    const loginTimeStr = localStorage.getItem('auth_login_time');

    // Strict 24-hour session period check (24h = 86,400,000 ms)
    if (token && loginTimeStr) {
      const loginTime = parseInt(loginTimeStr, 10);
      const isExpired = Date.now() - loginTime > 24 * 60 * 60 * 1000;

      if (isExpired) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_login_time');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Session expired (24 hours). Please log in again.'));
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_login_time');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
