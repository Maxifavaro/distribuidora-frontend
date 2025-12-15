import create from 'zustand';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || '';
// When empty, requests are relative and CRA's proxy will forward them to the backend

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useStore = create((set, get) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  permission: localStorage.getItem('permission') || null,
  providers: [],
  clients: [],
  products: [],
  orders: [],
  users: [],
  loading: false,
  error: null,

  fetchProviders: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/providers');
      set({ providers: data, loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
    }
  },

  createProvider: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/providers', payload);
      set((state) => ({ providers: [...state.providers, data], loading: false }));
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/clients`, { headers });
      const data = await res.json();
      set({ clients: data, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  createClient: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/clients`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      set((state) => ({ clients: [...state.clients, data], loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/products`, { headers });
      const data = await res.json();
      set({ products: data, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  createProduct: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/products`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      set((state) => ({ products: [...state.products, data], loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  // Update and delete actions for providers, clients and products
  updateProvider: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/providers/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      set((state) => ({ providers: state.providers.map(p => p.id === data.id ? data : p), loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  deleteProvider: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/providers/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        set((state) => ({ providers: state.providers.filter(p => p.id !== id), loading: false }));
        return true;
      }
      throw new Error('Failed to delete');
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  updateClient: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      set((state) => ({ clients: state.clients.map(c => c.id === data.id ? data : c), loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/clients/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        set((state) => ({ clients: state.clients.filter(c => c.id !== id), loading: false }));
        return true;
      }
      throw new Error('Failed to delete');
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  updateProduct: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      set((state) => ({ products: state.products.map(p => p.id === data.id ? data : p), loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        set((state) => ({ products: state.products.filter(p => p.id !== id), loading: false }));
        return true;
      }
      throw new Error('Failed to delete');
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  // Orders
  // Auth actions
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('permission', data.user.permission);
      set({ token: data.token, user: data.user, permission: data.user.permission, loading: false });
      return data.user;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permission');
    set({ token: null, user: null, permission: null });
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/orders`, { headers });
      const data = await res.json();
      set({ orders: data, loading: false });
    } catch (err) { set({ error: err.message, loading: false }); }
  },

  fetchOrderDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/orders/${id}`, { headers });
      const data = await res.json();
      set({ loading: false });
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  createOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/orders`, { method: 'POST', headers, body: JSON.stringify(payload) });
      const data = await res.json();
      set((state) => ({ orders: [data, ...state.orders], loading: false }));
      // refresh products to reflect stock changes
      const prodRes = await fetch(`${API_BASE}/products`, { headers });
      const prodData = await prodRes.json();
      set({ products: prodData });
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  // Users
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/users`, { headers });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch users');
      }
      const data = await res.json();
      set({ users: Array.isArray(data) ? data : [], loading: false });
    } catch (err) { set({ error: err.message, users: [], loading: false }); }
  },

  createUser: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/users`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create user');
      }
      const data = await res.json();
      set((state) => ({ users: [...state.users, data], loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  updateUser: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update user');
      }
      const data = await res.json();
      set((state) => ({ users: state.users.map(u => u.id === parseInt(id) ? { ...u, ...payload } : u), loading: false }));
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE', headers });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete user');
      }
      set((state) => ({ users: state.users.filter(u => u.id !== parseInt(id)), loading: false }));
      return true;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  // Statistics
  fetchTopProducts: async () => {
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/statistics/top-products`, { headers });
      if (!res.ok) throw new Error('Failed to fetch top products');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching top products:', err);
      return [];
    }
  },

  fetchTopProviders: async () => {
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/statistics/top-providers`, { headers });
      if (!res.ok) throw new Error('Failed to fetch top providers');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching top providers:', err);
      return [];
    }
  },

  fetchTopClients: async () => {
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/statistics/top-clients`, { headers });
      if (!res.ok) throw new Error('Failed to fetch top clients');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching top clients:', err);
      return [];
    }
  },

  fetchClientProducts: async (clientId) => {
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/statistics/client-products/${clientId}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch client products');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Error fetching client products:', err);
      return [];
    }
  },

  // Rubros
  rubros: [],

  fetchRubros: async () => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/rubros`, { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch rubros');
      }
      const data = await res.json();
      set({ rubros: Array.isArray(data) ? data : [], loading: false });
    } catch (err) { 
      set({ error: err.message, rubros: [], loading: false }); 
    }
  },

  createRubro: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/rubros`, { method: 'POST', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to create' }));
        throw new Error(errData.error || errData.message || 'Failed to create rubro');
      }
      const data = await res.json();
      // Refresh the list to ensure proper formatting
      await get().fetchRubros();
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  updateRubro: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers = { 'Content-Type': 'application/json', ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/rubros/${id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to update' }));
        throw new Error(errData.error || errData.message || 'Failed to update rubro');
      }
      const data = await res.json();
      // Refresh the list to ensure proper formatting
      await get().fetchRubros();
      return data;
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  },

  deleteRubro: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers = { ...(get().token ? { Authorization: `Bearer ${get().token}` } : {}) };
      const res = await fetch(`${API_BASE}/rubros/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
        set((state) => ({ rubros: state.rubros.filter(r => r.id_rubro !== id), loading: false }));
        return true;
      }
      throw new Error('Failed to delete');
    } catch (err) { set({ error: err.message, loading: false }); throw err; }
  }
}));

export default useStore;
