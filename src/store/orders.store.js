import api from './api';

export const ordersSlice = (set, get) => ({
  orders: [],

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/orders');
      set({ orders: data, loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
    }
  },

  fetchOrderDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get(`/orders/${id}`);
      set({ loading: false });
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  createOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/orders', payload);
      set((state) => ({ orders: [data, ...state.orders], loading: false }));
      // Refresh products to reflect stock changes
      const { data: prodData } = await api.get('/products');
      set({ products: prodData });
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
