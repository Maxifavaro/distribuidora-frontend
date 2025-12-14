import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Providers() {
  const { providers, fetchProviders, createProvider, updateProvider, deleteProvider, loading, permission } = useStore();
  const [form, setForm] = useState({ name: '', contact: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProviders(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (provider) => {
    setEditingId(provider.id);
    setForm({ name: provider.name || '', contact: provider.contact || '', phone: provider.phone || '', email: provider.email || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', contact: '', phone: '', email: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const data = await updateProvider(editingId, form);
        Swal.fire('Actualizado', `${data.name} actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createProvider(form);
        setForm({ name: '', contact: '', phone: '', email: '' });
        Swal.fire('Creado', `${data.name} creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await Swal.fire({ title: `Eliminar ${name}?`, showCancelButton: true, confirmButtonText: 'Eliminar', icon: 'warning' });
    if (confirmed.isConfirmed) {
      try {
        await deleteProvider(id);
        Swal.fire('Eliminado', `${name} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = providers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || String(p.id) === search);

  return (
    <div>
      <h4>Proveedores</h4>

      <div className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Buscar por ID o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input required name="name" value={form.name} onChange={handleChange} placeholder="Name" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="contact" value={form.contact} onChange={handleChange} placeholder="Contact" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="form-control" />
        </div>
        <div className="mb-2">
          {permission === 'admin' && <button className="btn btn-primary me-2" disabled={loading} type="submit">{editingId ? 'Update' : 'Create'}</button>}
          {editingId && <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

      <hr />
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.contact}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>
                  {permission === 'admin' && <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(p)}>Edit</button>}
                  {permission === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.name)}>Delete</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6">No results</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
