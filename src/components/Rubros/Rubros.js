import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import Swal from 'sweetalert2';
import { SearchBar } from '../../componentsUI';
import RubroForm from './RubroForm';
import RubroGrid from './RubroGrid';

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
        await updateRubro(editingId, form);
        Swal.fire('Actualizado', `Rubro actualizado`, 'success');
        cancelEdit();
      } else {
        await createRubro(form);
        setForm({ descripcion: '' });
        Swal.fire('Creado', `Rubro creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed', 'error');
    }
  };

  const handleDelete = async (id, descripcion) => {
    const confirmed = await Swal.fire({ 
      title: `Eliminar ${descripcion}?`, 
      showCancelButton: true, 
      confirmButtonText: 'Eliminar', 
      icon: 'warning' 
    });
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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [search]);

  const toggleFormSwitch = (
    permission === 'admin' && !editingId && (
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
    )
  );

  return (
    <div>
      <h4>Rubros</h4>

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por ID o descripción"
        actions={toggleFormSwitch}
      />

      {showForm && (
        <RubroForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          isEditing={!!editingId}
          loading={loading}
        />
      )}

      <hr />

      <RubroGrid
        rubros={currentItems}
        onEdit={startEdit}
        onDelete={handleDelete}
        permission={permission}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
      />
    </div>
  );
}
