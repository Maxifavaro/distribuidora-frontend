import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import Swal from 'sweetalert2';
import ModuleSummary from '../shared/ModuleSummary';
import UserForm from './UserForm';
import UserList from './UserList';

export default function Users() {
  const { users, employeesForUsers, userPermissions, fetchUsers, createUser, updateUser, deleteUser, permission } = useStore();
  const [search, setSearch] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try { await fetchUsers(); setError(''); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (permission === 'admin') refresh();
  }, [permission, fetchUsers]);

  const startCreate = () => {
    setEmployeeSearch('');
    setForm({ employeeId: '', username: '', password: '', permissionId: '' });
    setError('');
  };
  const startEdit = (user) => {
    setForm({ employeeId: user.id, username: user.username, password: '', permissionId: String(user.permissionId), employee: `${user.apellido}, ${user.nombre}` });
    setError('');
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const { employeeId, username, password, permissionId, employee } = form;
      const payload = { username, permissionId, ...(password ? { password } : {}) };
      if (employee) await updateUser(employeeId, payload);
      else await createUser({ ...payload, employeeId });
      setForm(null);
      await refresh();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  const remove = async (user) => {
    const result = await Swal.fire({
      title: 'Eliminar acceso',
      text: `Se eliminará el acceso de ${user.username}, pero se conservará el empleado.`,
      icon: 'warning', showCancelButton: true, confirmButtonText: 'Eliminar acceso', cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try { await deleteUser(user.id); await refresh(); }
    catch (err) { setError(err.message); }
  };

  if (permission !== 'admin') return <div className="alert alert-danger">No tenés permisos para acceder a esta sección.</div>;
  return (
    <div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!form && !loading && !error && <ModuleSummary moduleKey="users" count={users.length} />}
      {form ? (
        <UserForm
          form={form}
          onChange={setForm}
          employeeSearch={employeeSearch}
          onEmployeeSearch={setEmployeeSearch}
          employees={employeesForUsers}
          permissions={userPermissions}
          saving={saving}
          onSubmit={save}
          onCancel={() => setForm(null)}
        />
      ) : null}
      <UserList users={users} search={search} onSearch={setSearch} loading={loading} onEdit={startEdit} onRemove={remove} onCreate={form ? null : startCreate} />
    </div>
  );
}
