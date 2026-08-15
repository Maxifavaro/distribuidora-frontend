import api from './api';

export const systemStructureSlice = (set, get) => ({
  sections: [],
  tableStructures: {}, // Cache de estructuras de tablas: { tableName: {...structure} }
  loading: false,
  error: null,

  // Fetch all sections (menu items) from database
  fetchSections: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/system-structure');
      set({ sections: data, loading: false });
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  // Fetch table structure (columns, types, lengths) for dynamic rendering
  fetchTableStructure: async (tableName) => {
    try {
      // Check if already cached
      const cached = get().tableStructures[tableName];
      if (cached) return cached;

      const { data } = await api.get(`/system-structure/table-structure/${tableName}`);
      
      // Cache the structure
      set(state => ({
        tableStructures: {
          ...state.tableStructures,
          [tableName]: data
        }
      }));
      
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      set({ error: errorMsg });
      throw err;
    }
  },

  // Get cached section by key
  getSectionByKey: (key) => {
    const sections = get().sections;
    return sections.find(s => s.key === key);
  },

  // Get cached table structure
  getTableStructure: (tableName) => {
    return get().tableStructures[tableName] || null;
  }
});
