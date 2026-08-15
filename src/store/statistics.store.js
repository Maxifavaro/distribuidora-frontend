import api from './api';

export const statisticsSlice = (set, get) => ({
  fetchTopProducts: async () => {
    try {
      const { data } = await api.get('/statistics/top-products');
      return data;
    } catch (err) {
      console.error('Error fetching top products:', err);
      return [];
    }
  },

  fetchTopProviders: async () => {
    try {
      const { data } = await api.get('/statistics/top-providers');
      return data;
    } catch (err) {
      console.error('Error fetching top providers:', err);
      return [];
    }
  },

  fetchTopClients: async () => {
    try {
      const { data } = await api.get('/statistics/top-clients');
      return data;
    } catch (err) {
      console.error('Error fetching top clients:', err);
      return [];
    }
  },

  fetchClientProducts: async (clientId) => {
    try {
      const { data } = await api.get(`/statistics/client-products/${clientId}`);
      return data;
    } catch (err) {
      console.error('Error fetching client products:', err);
      return [];
    }
  }
});
