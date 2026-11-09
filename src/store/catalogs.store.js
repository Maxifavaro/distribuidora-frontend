import api from './api';

export const catalogsSlice = (set, get) => ({
  localidades: [],
  barrios: [],

  fetchLocalidades: async () => {
    try {
      const { data } = await api.get('/catalogs/localidades');
      set({ localidades: data });
    } catch (err) { 
      console.error('Error fetching localidades:', err); 
    }
  },

  fetchBarrios: async () => {
    try {
      const { data } = await api.get('/catalogs/barrios');
      set({ barrios: data });
    } catch (err) { 
      console.error('Error fetching barrios:', err); 
    }
  }
});
