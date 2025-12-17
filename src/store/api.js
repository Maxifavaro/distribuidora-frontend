import axios from 'axios';

// Use empty string to let the proxy handle requests in development
// In production, set REACT_APP_API_BASE to your backend URL
const API_BASE = process.env.REACT_APP_API_BASE || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
