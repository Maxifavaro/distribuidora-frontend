import api from './api';

export const providersSlice = (set, get) => ({
  providers: [],

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
      await get().fetchProviders();
      set({ loading: false });
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateProvider: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/providers/${id}`, payload);
      await get().fetchProviders();
      set({ loading: false });
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteProvider: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/providers/${id}`);
      set((state) => ({ providers: state.providers.filter(p => p.id !== id), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
