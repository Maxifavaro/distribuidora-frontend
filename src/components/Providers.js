import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Providers() {
  const store = useStore();
  const { 
    providers, fetchProviders, createProvider, updateProvider, deleteProvider,
    localidades, barrios, condicionesPago,
    fetchLocalidades, fetchBarrios, fetchCondicionesPago,
    loading, permission 
  } = store;
  
  const [form, setForm] = useState({ 
    razon_social: '', direccion: '', numero: '', telefono: '', 
    cuit: '', correo: '', id_condicion: '', id_barrio: '', id_localidad: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => { 
    if (fetchProviders) fetchProviders(); 
    if (fetchLocalidades) fetchLocalidades();
    if (fetchBarrios) fetchBarrios();
    if (fetchCondicionesPago) fetchCondicionesPago();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (provider) => {
    setEditingId(provider.id);
    setForm({ 
      razon_social: provider.razon_social || '', 
      direccion: provider.direccion || '', 
      numero: provider.numero || '', 
      telefono: provider.telefono || '', 
      cuit: provider.cuit || '', 
      correo: provider.correo || '',
      id_condicion: provider.id_condicion || '',
      id_barrio: provider.id_barrio || '',
      id_localidad: provider.id_localidad || ''
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ 
      razon_social: '', direccion: '', numero: '', telefono: '', 
      cuit: '', correo: '', id_condicion: '', id_barrio: '', id_localidad: '' 
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProvider(editingId, form);
        Swal.fire('Actualizado', `Proveedor actualizado`, 'success');
        cancelEdit();
      } else {
        await createProvider(form);
        setForm({ 
          razon_social: '', direccion: '', numero: '', telefono: '', 
          cuit: '', correo: '', id_condicion: '', id_barrio: '', id_localidad: '' 
        });
        Swal.fire('Creado', `Proveedor creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id, razon_social) => {
    const confirmed = await Swal.fire({ title: `Eliminar ${razon_social}?`, showCancelButton: true, confirmButtonText: 'Eliminar', icon: 'warning' });
    if (confirmed.isConfirmed) {
      try {
        await deleteProvider(id);
        Swal.fire('Eliminado', `${razon_social} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = Array.isArray(providers) ? providers.filter(p => 
    (p.razon_social || '').toLowerCase().includes(search.toLowerCase()) || 
    String(p.id) === search
  ) : [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProviders = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <h4>Proveedores</h4>

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
            <h5 className="card-title">{editingId ? 'Modificar Proveedor' : 'Nuevo Proveedor'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Razón Social *</label>
                  <input required name="razon_social" value={form.razon_social} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Dirección</label>
                  <input name="direccion" value={form.direccion} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-2 mb-3">
                  <label className="form-label">Número</label>
                  <input name="numero" value={form.numero} onChange={handleChange} className="form-control" />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input name="telefono" value={form.telefono} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">CUIT</label>
                  <input name="cuit" value={form.cuit} onChange={handleChange} className="form-control" />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Correo</label>
                  <input type="email" name="correo" value={form.correo} onChange={handleChange} className="form-control" />
                </div>
              </div>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Barrio</label>
                  <select name="id_barrio" value={form.id_barrio} onChange={handleChange} className="form-select">
                    <option value="">Seleccionar...</option>
                    {Array.isArray(barrios) && barrios.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                  </select>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Localidad</label>
                  <select name="id_localidad" value={form.id_localidad} onChange={handleChange} className="form-select">
                    <option value="">Seleccionar...</option>
                    {Array.isArray(localidades) && localidades.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
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
                <button className="btn btn-primary" disabled={loading} type="submit">Confirmar</button>
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
              <th>Razón Social</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Localidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProviders.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.razon_social}</td>
                <td>{p.direccion} {p.numero}</td>
                <td>{p.telefono}</td>
                <td>{p.localidad_nombre}</td>
                <td>{p.estado}</td>
                <td>
                  {permission === 'admin' && <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(p)}>Edit</button>}
                  {permission === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id, p.razon_social)}>Delete</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7">No results</td></tr>
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
