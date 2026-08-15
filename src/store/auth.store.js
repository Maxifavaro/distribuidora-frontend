import api from './api';

export const authSlice = (set, get) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  permission: localStorage.getItem('permission') || null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('permission', data.user.permission);
      set({ token: data.token, user: data.user, permission: data.user.permission, loading: false });
      return data.user;
    } catch (err) { 
      set({ error: err.response?.data?.message || err.message, loading: false }); 
      throw err; 
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permission');
    set({ token: null, user: null, permission: null });
  }
});
