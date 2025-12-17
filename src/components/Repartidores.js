import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Repartidores() {
  const store = useStore();
  const { repartidores = [], fetchRepartidores, createRepartidor, updateRepartidor, deleteRepartidor, loading, permission } = store;
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    dni: '', 
    telefono: '', 
    direccion: '', 
    email: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    estado: 'Activo',
    observaciones: '',
    licencia_conducir: '',
    vencimiento_licencia: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { 
    if (fetchRepartidores) fetchRepartidores(); 
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (repartidor) => {
    setEditingId(repartidor.id);
    setForm({ 
      nombre: repartidor.nombre || '', 
      apellido: repartidor.apellido || '', 
      dni: repartidor.dni || '', 
      telefono: repartidor.telefono || '', 
      direccion: repartidor.direccion || '',
      email: repartidor.email || '',
      fecha_ingreso: repartidor.fecha_ingreso ? new Date(repartidor.fecha_ingreso).toISOString().split('T')[0] : '',
      estado: repartidor.estado || 'Activo',
      observaciones: repartidor.observaciones || '',
      licencia_conducir: repartidor.licencia_conducir || '',
      vencimiento_licencia: repartidor.vencimiento_licencia ? new Date(repartidor.vencimiento_licencia).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ 
      nombre: '', 
      apellido: '', 
      dni: '', 
      telefono: '', 
      direccion: '', 
      email: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      estado: 'Activo',
      observaciones: '',
      licencia_conducir: '',
      vencimiento_licencia: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        email: form.email || null,
        fecha_ingreso: form.fecha_ingreso || null,
        estado: form.estado,
        observaciones: form.observaciones || null,
        licencia_conducir: form.licencia_conducir || null,
        vencimiento_licencia: form.vencimiento_licencia || null
      };
      
      if (editingId) {
        const data = await updateRepartidor(editingId, payload);
        Swal.fire('Actualizado', `${data.nombre} ${data.apellido} actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createRepartidor(payload);
        Swal.fire('Creado', `Repartidor creado exitosamente`, 'success');
        cancelEdit();
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id, nombre, apellido) => {
    const confirmed = await Swal.fire({ 
      title: `¿Eliminar a ${nombre} ${apellido}?`, 
      text: 'Esta acción no se puede deshacer',
      showCancelButton: true, 
      confirmButtonText: 'Eliminar', 
      cancelButtonText: 'Cancelar',
      icon: 'warning' 
    });
    if (confirmed.isConfirmed) {
      try {
        await deleteRepartidor(id);
        Swal.fire('Eliminado', `${nombre} ${apellido} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'No se pudo eliminar', 'error');
      }
    }
  };

  const filtered = Array.isArray(repartidores) 
    ? repartidores.filter(r => 
        r.nombre?.toLowerCase().includes(search.toLowerCase()) || 
        r.apellido?.toLowerCase().includes(search.toLowerCase()) ||
        r.dni?.toLowerCase().includes(search.toLowerCase()) ||
        String(r.id) === search
      ) 
    : [];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Repartidores</h3>
        {permission === 'admin' && (
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Ocultar Formulario' : '+ Nuevo Repartidor'}
          </button>
        )}
      </div>

      {showForm && permission === 'admin' && (
        <form onSubmit={handleSubmit} className="card p-3 mb-4 shadow-sm">
          <h5 className="mb-3">{editingId ? 'Editar Repartidor' : 'Nuevo Repartidor'}</h5>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Nombre *</label>
              <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Apellido *</label>
              <input className="form-control" name="apellido" value={form.apellido} onChange={handleChange} required />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">DNI</label>
              <input className="form-control" name="dni" value={form.dni} onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Teléfono</label>
              <input className="form-control" name="telefono" value={form.telefono} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Estado</label>
              <select className="form-select" name="estado" value={form.estado} onChange={handleChange}>
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="Suspendido">Suspendido</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Dirección</label>
              <input className="form-control" name="direccion" value={form.direccion} onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Licencia de Conducir</label>
              <input className="form-control" name="licencia_conducir" value={form.licencia_conducir} onChange={handleChange} placeholder="Ej: B123456" />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Vencimiento Licencia</label>
              <input type="date" className="form-control" name="vencimiento_licencia" value={form.vencimiento_licencia} onChange={handleChange} />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Fecha de Ingreso</label>
              <input type="date" className="form-control" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleChange} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 mb-3">
              <label className="form-label">Observaciones</label>
              <textarea className="form-control" name="observaciones" value={form.observaciones} onChange={handleChange} rows="2"></textarea>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mb-3">
        <input 
          className="form-control" 
          placeholder="Buscar por nombre, apellido, DNI o ID..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Licencia</th>
              <th>Estado</th>
              <th>Fecha Ingreso</th>
              {permission === 'admin' && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.nombre}</td>
                <td>{r.apellido}</td>
                <td>{r.dni || '-'}</td>
                <td>{r.telefono || '-'}</td>
                <td>{r.email || '-'}</td>
                <td>
                  {r.licencia_conducir || '-'}
                  {r.vencimiento_licencia && (
                    <div className="small text-muted">
                      Venc: {new Date(r.vencimiento_licencia).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${r.estado === 'Activo' ? 'bg-success' : r.estado === 'Inactivo' ? 'bg-secondary' : 'bg-warning'}`}>
                    {r.estado}
                  </span>
                </td>
                <td>
                  {r.fecha_ingreso ? new Date(r.fecha_ingreso).toLocaleDateString() : '-'}
                </td>
                {permission === 'admin' && (
                  <td>
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(r)}>
                      ✏️ Editar
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id, r.nombre, r.apellido)}>
                      🗑️ Eliminar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={permission === 'admin' ? '10' : '9'} className="text-center text-muted">
                  No hay repartidores para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
