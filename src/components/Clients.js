import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Clients() {
  const { clients, fetchClients, createClient, updateClient, deleteClient, loading, permission } = useStore();
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchClients(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (client) => {
    setEditingId(client.id);
    setForm({ name: client.name || '', address: client.address || '', phone: client.phone || '', email: client.email || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', address: '', phone: '', email: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const data = await updateClient(editingId, form);
        Swal.fire('Actualizado', `${data.name} actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createClient(form);
        setForm({ name: '', address: '', phone: '', email: '' });
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
        await deleteClient(id);
        Swal.fire('Eliminado', `${name} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || String(c.id) === search);

  return (
    <div>
      <h4>Clientes</h4>

      <div className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Buscar por ID o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input required name="name" value={form.name} onChange={handleChange} placeholder="Name" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="form-control" />
        </div>
        <div className="mb-2">
          {permission === 'admin' && <button className="btn btn-primary me-2" type="submit" disabled={loading}>{editingId ? 'Update' : 'Create'}</button>}
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
              <th>Direccion</th>
              <th>Telefono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.address}</td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>
                  {permission === 'admin' && <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(c)}>Edit</button>}
                  {permission === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id, c.name)}>Delete</button>}
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
