import create from 'zustand';
import { authSlice } from './auth.store';
import { usersSlice } from './users.store';
import { statisticsSlice } from './statistics.store';
import { catalogsSlice } from './catalogs.store';
import { systemStructureSlice } from './system-structure.store';

const useStore = create((set, get) => ({
  // Global state
  loading: false,
  error: null,

  // Combine all slices
  ...authSlice(set, get),
  ...systemStructureSlice(set, get),
  ...catalogsSlice(set, get),
  ...usersSlice(set, get),
  ...statisticsSlice(set, get),
}));

export default useStore;
