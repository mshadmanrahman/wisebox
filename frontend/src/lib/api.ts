import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Removed withCredentials - we're using tokens, not cookies
});

// Request interceptor: attach Bearer token from localStorage
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('wisebox_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // If unauthorized, clear ALL auth state (localStorage + cookie) and redirect
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('wisebox_token');
      localStorage.removeItem('wisebox-auth');
      document.cookie = 'wisebox_token=; path=/; max-age=0';
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
