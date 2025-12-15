import api from './api';

export const productsSlice = (set, get) => ({
  products: [],

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/products');
      set({ products: data, loading: false });
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
    }
  },

  createProduct: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/products', payload);
      set((state) => ({ products: [...state.products, data], loading: false }));
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  updateProduct: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.put(`/products/${id}`, payload);
      set((state) => ({ products: state.products.map(p => p.id === data.id ? data : p), loading: false }));
      return data;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/products/${id}`);
      set((state) => ({ products: state.products.filter(p => p.id !== id), loading: false }));
      return true;
    } catch (err) { 
      set({ error: err.response?.data?.error || err.message, loading: false }); 
      throw err; 
    }
  }
});
