import api from './api';

export const catalogsSlice = (set, get) => ({
  localidades: [],
  zonas: [],
  barrios: [],
  condicionesPago: [],

  fetchLocalidades: async () => {
    try {
      const { data } = await api.get('/catalogs/localidades');
      set({ localidades: data });
    } catch (err) { 
      console.error('Error fetching localidades:', err); 
    }
  },

  fetchZonas: async () => {
    try {
      const { data } = await api.get('/catalogs/zonas');
      set({ zonas: data });
    } catch (err) { 
      console.error('Error fetching zonas:', err); 
    }
  },

  fetchBarrios: async () => {
    try {
      const { data } = await api.get('/catalogs/barrios');
      set({ barrios: data });
    } catch (err) { 
      console.error('Error fetching barrios:', err); 
    }
  },

  fetchCondicionesPago: async () => {
    try {
      const { data } = await api.get('/catalogs/condiciones-pago');
      set({ condicionesPago: data });
    } catch (err) { 
      console.error('Error fetching condiciones pago:', err); 
    }
  }
});
