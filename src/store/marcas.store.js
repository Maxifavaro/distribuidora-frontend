import api from './api';

export const marcasSlice = (set, get) => ({
  marcas: [],

  fetchMarcas: async (rubroId = null) => {
    try {
      const params = rubroId ? { rubro_id: rubroId } : {};
      const { data } = await api.get('/marcas', { params });
      set({ marcas: Array.isArray(data) ? data : [] });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, marcas: [] }); 
      throw err;
    }
  },

  createMarca: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/marcas', payload);
      await get().fetchMarcas();
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateMarca: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/marcas/${id}`, payload);
      await get().fetchMarcas();
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteMarca: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/marcas/${id}`);
      set((state) => ({ marcas: state.marcas.filter(m => m.id_marca !== id), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
