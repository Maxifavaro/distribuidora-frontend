import api from './api';

export const usersSlice = (set, get) => ({
  users: [],

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/users');
      set({ users: Array.isArray(data) ? data : [], loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, users: [], loading: false }); 
    }
  },

  createUser: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/users', payload);
      set((state) => ({ users: [...state.users, data], loading: false }));
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateUser: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/users/${id}`, payload);
      set((state) => ({ users: state.users.map(u => u.id === parseInt(id) ? { ...u, ...payload } : u), loading: false }));
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({ users: state.users.filter(u => u.id !== parseInt(id)), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
