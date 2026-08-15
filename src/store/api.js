import axios from 'axios';

// Use import.meta.env instead of process.env for Vite
// In development, Vite proxy (configured in vite.config.js) handles requests to /api
// In production, set VITE_API_BASE to your backend URL
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3002';

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
