import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Clients() {
  const store = useStore();
  const { 
    clients, fetchClients, createClient, updateClient, deleteClient, 
    localidades, zonas, barrios, condicionesPago,
    fetchLocalidades, fetchZonas, fetchBarrios, fetchCondicionesPago,
    loading, permission 
  } = store;
  
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', razon_social: '', direccion: '', numero: '', 
    telefono: '', cuit: '', correo: '', id_barrio: '', id_localidad: '', 
    id_zona: '', id_condicion: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => { 
    console.log('Store keys:', Object.keys(store));
    console.log('fetchLocalidades:', typeof fetchLocalidades);
    if (fetchClients) fetchClients(); 
    if (fetchLocalidades) fetchLocalidades();
    if (fetchZonas) fetchZonas();
    if (fetchBarrios) fetchBarrios();
    if (fetchCondicionesPago) fetchCondicionesPago();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (client) => {
    setEditingId(client.id);
    setForm({ 
      nombre: client.nombre || '', 
      apellido: client.apellido || '', 
      razon_social: client.razon_social || '', 
      direccion: client.direccion || '', 
      numero: client.numero || '',
      telefono: client.telefono || '', 
      cuit: client.cuit || '', 
      correo: client.correo || '',
      id_barrio: client.id_barrio || '',
      id_localidad: client.id_localidad || '',
      id_zona: client.id_zona || '',
      id_condicion: client.id_condicion || ''
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ 
      nombre: '', apellido: '', razon_social: '', direccion: '', numero: '', 
      telefono: '', cuit: '', correo: '', id_barrio: '', id_localidad: '', 
      id_zona: '', id_condicion: '' 
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClient(editingId, form);
        Swal.fire('Actualizado', `Cliente actualizado`, 'success');
        cancelEdit();
      } else {
        await createClient(form);
        setForm({ 
          nombre: '', apellido: '', razon_social: '', direccion: '', numero: '', 
          telefono: '', cuit: '', correo: '', id_barrio: '', id_localidad: '', 
          id_zona: '', id_condicion: '' 
        });
        Swal.fire('Creado', `Cliente creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id, nombre) => {
    const confirmed = await Swal.fire({ title: `Eliminar ${nombre}?`, showCancelButton: true, confirmButtonText: 'Eliminar', icon: 'warning' });
    if (confirmed.isConfirmed) {
      try {
        await deleteClient(id);
        Swal.fire('Eliminado', `${nombre} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = Array.isArray(clients) ? clients.filter(c => 
    (c.nombre || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.apellido || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.razon_social || '').toLowerCase().includes(search.toLowerCase()) ||
    String(c.id) === search
  ) : [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <h4>Clientes</h4>

      <div className="mb-3 d-flex align-items-center">
        <input className="form-control me-2" placeholder="Buscar por ID o nombre" value={search} onChange={(e) => setSearch(e.target.value)} />
        {permission === 'admin' && !editingId && (
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="toggleForm" 
              checked={showForm} 
              onChange={(e) => setShowForm(e.target.checked)}
              style={{ width: '48px', height: '24px', cursor: 'pointer' }}
            />
          </div>
        )}
      </div>

      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{editingId ? 'Modificar Cliente' : 'Nuevo Cliente'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Nombre *</label>
                  <input required name="nombre" value={form.nombre} onChange={handleChange} className="form-control" placeholder="Campo obligatorio" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Apellido</label>
                  <input name="apellido" value={form.apellido} onChange={handleChange} className="form-control" placeholder="Opcional" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Razón Social</label>
                  <input name="razon_social" value={form.razon_social} onChange={handleChange} className="form-control" placeholder="Opcional" />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Número</label>
                  <input name="numero" value={form.numero} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} className="form-control" />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">CUIT</label>
                  <input name="cuit" value={form.cuit} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Correo</label>
                  <input type="email" name="correo" value={form.correo} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Barrio</label>
                  <select name="id_barrio" value={form.id_barrio} onChange={handleChange} className="form-select">
                    <option value="">Seleccionar...</option>
                    {Array.isArray(barrios) && barrios.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Localidad</label>
                  <select name="id_localidad" value={form.id_localidad} onChange={handleChange} className="form-select">
                    <option value="">Seleccionar...</option>
                    {Array.isArray(localidades) && localidades.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Zona</label>
                  <select name="id_zona" value={form.id_zona} onChange={handleChange} className="form-select">
                    <option value="">Seleccionar...</option>
                    {Array.isArray(zonas) && zonas.map(z => <option key={z.id} value={z.id}>{z.descripcion}</option>)}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Condición de Pago</label>
                  <select name="id_condicion" value={form.id_condicion} onChange={handleChange} className="form-select">
                    <option value="">Seleccionar...</option>
                    {Array.isArray(condicionesPago) && condicionesPago.map(c => <option key={c.id} value={c.id}>{c.descripcion}</option>)}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={loading}>Confirmar</button>
                <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <hr />
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Razón Social</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Localidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClients.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.nombre}</td>
                <td>{c.apellido}</td>
                <td>{c.razon_social}</td>
                <td>{c.direccion} {c.numero}</td>
                <td>{c.telefono}</td>
                <td>{c.localidad_nombre}</td>
                <td>{c.estado}</td>
                <td>
                  {permission === 'admin' && <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(c)}>Edit</button>}
                  {permission === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id, c.nombre)}>Delete</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="9">No results</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-3">
          <button className="btn btn-sm btn-secondary me-2" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Anterior</button>
          <span>Página {currentPage} de {totalPages} ({filtered.length} registros)</span>
          <button className="btn btn-sm btn-secondary ms-2" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Siguiente</button>
        </div>
      )}
    </div>
  );
}
