import api from './api';

export const clientsSlice = (set, get) => ({
  clients: [],

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/clients');
      set({ clients: data, loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
    }
  },

  createClient: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/clients', payload);
      await get().fetchClients();
      set({ loading: false });
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateClient: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/clients/${id}`, payload);
      await get().fetchClients();
      set({ loading: false });
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteClient: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/clients/${id}`);
      set((state) => ({ clients: state.clients.filter(c => c.id !== id), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
