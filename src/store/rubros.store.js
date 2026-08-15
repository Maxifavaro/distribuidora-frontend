import api from './api';

export const rubrosSlice = (set, get) => ({
  rubros: [],

  fetchRubros: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/rubros');
      set({ rubros: Array.isArray(data) ? data : [], loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, rubros: [], loading: false }); 
    }
  },

  createRubro: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/rubros', payload);
      // Refresh the list to ensure proper formatting
      await get().fetchRubros();
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateRubro: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/rubros/${id}`, payload);
      // Refresh the list to ensure proper formatting
      await get().fetchRubros();
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteRubro: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/rubros/${id}`);
      set((state) => ({ rubros: state.rubros.filter(r => r.id_rubro !== id), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
