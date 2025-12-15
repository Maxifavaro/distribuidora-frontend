import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Rubros() {
  const store = useStore();
  const { rubros = [], fetchRubros, createRubro, updateRubro, deleteRubro, loading, permission } = store;
  const [form, setForm] = useState({ descripcion: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => { if (fetchRubros) fetchRubros(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (rubro) => {
    setEditingId(rubro.id_rubro);
    setForm({ descripcion: rubro.descripcion || '' });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ descripcion: '' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const data = await updateRubro(editingId, form);
        Swal.fire('Actualizado', `Rubro actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createRubro(form);
        setForm({ descripcion: '' });
        Swal.fire('Creado', `Rubro creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id, descripcion) => {
    const confirmed = await Swal.fire({ title: `Eliminar ${descripcion}?`, showCancelButton: true, confirmButtonText: 'Eliminar', icon: 'warning' });
    if (confirmed.isConfirmed) {
      try {
        await deleteRubro(id);
        Swal.fire('Eliminado', `${descripcion} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = Array.isArray(rubros) ? rubros.filter(r => 
    (r.descripcion || '').toLowerCase().includes(search.toLowerCase()) || 
    String(r.id_rubro) === search
  ) : [];

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filtered.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div>
      <h4>Rubros</h4>

      <div className="mb-3 d-flex align-items-center">
        <input className="form-control me-2" placeholder="Buscar por ID o descripción" value={search} onChange={(e) => setSearch(e.target.value)} />
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
            <h5 className="card-title">{editingId ? 'Modificar Rubro' : 'Nuevo Rubro'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <input required name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción del Rubro" className="form-control" />
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
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map(rubro => (
              <tr key={rubro.id_rubro}>
                <td>{rubro.id_rubro}</td>
                <td>{rubro.descripcion}</td>
                <td>
                  {permission === 'admin' && <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(rubro)}>Editar</button>}
                  {permission === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(rubro.id_rubro, rubro.descripcion)}>Eliminar</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="3">No hay resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => goToPage(currentPage - 1)}>Anterior</button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => goToPage(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => goToPage(currentPage + 1)}>Siguiente</button>
            </li>
          </ul>
          <div className="text-center text-muted">
            Mostrando {startIndex + 1} - {Math.min(endIndex, filtered.length)} de {filtered.length} rubros
          </div>
        </nav>
      )}
    </div>
  );
}
