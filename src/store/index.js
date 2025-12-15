import create from 'zustand';
import { authSlice } from './auth.store';
import { providersSlice } from './providers.store';
import { clientsSlice } from './clients.store';
import { productsSlice } from './products.store';
import { ordersSlice } from './orders.store';
import { usersSlice } from './users.store';
import { rubrosSlice } from './rubros.store';
import { statisticsSlice } from './statistics.store';
import { catalogsSlice } from './catalogs.store';

const useStore = create((set, get) => ({
  // Global state
  loading: false,
  error: null,

  // Combine all slices
  ...authSlice(set, get),
  ...catalogsSlice(set, get),
  ...providersSlice(set, get),
  ...clientsSlice(set, get),
  ...productsSlice(set, get),
  ...ordersSlice(set, get),
  ...usersSlice(set, get),
  ...rubrosSlice(set, get),
  ...statisticsSlice(set, get)
}));

export default useStore;
