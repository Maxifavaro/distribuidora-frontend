import api from './api';

export const repartidoresSlice = (set, get) => ({
  repartidores: [],

  fetchRepartidores: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/repartidores');
      set({ repartidores: Array.isArray(res.data) ? res.data : [], loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, repartidores: [], loading: false }); 
    }
  },

  createRepartidor: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/repartidores', payload);
      await get().fetchRepartidores();
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateRepartidor: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/repartidores/${id}`, payload);
      await get().fetchRepartidores();
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteRepartidor: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/repartidores/${id}`);
      set((state) => ({ repartidores: state.repartidores.filter(r => r.id !== id), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
