import api from './api';

export const usersSlice = (set) => ({
  users: [],
  employeesForUsers: [],
  userPermissions: [],

  fetchUsers: async () => {
    try {
      const [users, employees, permissions] = await Promise.all([
        api.get('/users'), api.get('/users/employees'), api.get('/users/permissions')
      ]);
      set({ users: users.data, employeesForUsers: employees.data, userPermissions: permissions.data });
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message);
    }
  },
  createUser: async (payload) => {
    try { await api.post('/users', payload); }
    catch (err) { throw new Error(err.response?.data?.error || err.message); }
  },
  updateUser: async (id, payload) => {
    try { await api.put(`/users/${id}`, payload); }
    catch (err) { throw new Error(err.response?.data?.error || err.message); }
  },
  deleteUser: async (id) => {
    try { await api.delete(`/users/${id}`); }
    catch (err) { throw new Error(err.response?.data?.error || err.message); }
  }
});
