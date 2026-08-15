import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import Swal from 'sweetalert2';
import { SearchBar } from '../../componentsUI';
import ProviderForm from './ProviderForm';
import ProviderGrid from './ProviderGrid';

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
    const confirmed = await Swal.fire({ 
      title: `Eliminar ${razon_social}?`, 
      showCancelButton: true, 
      confirmButtonText: 'Eliminar', 
      icon: 'warning' 
    });
    if (confirmed.isConfirmed) {
      try {
        await deleteProvider(id);
        Swal.fire('Eliminado', `${razon_social} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const handlePageChange = (newPage) => setCurrentPage(newPage);

  const filtered = Array.isArray(providers) ? providers.filter(p => 
    (p.razon_social || '').toLowerCase().includes(search.toLowerCase()) || 
    String(p.id) === search
  ) : [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProviders = filtered.slice(startIndex, startIndex + itemsPerPage);

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
      <h4>Proveedores</h4>

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por ID o nombre"
        actions={toggleFormSwitch}
      />

      {showForm && (
        <ProviderForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          isEditing={!!editingId}
          loading={loading}
          barrios={barrios}
          localidades={localidades}
          condicionesPago={condicionesPago}
        />
      )}

      <hr />

      <ProviderGrid
        providers={paginatedProviders}
        onEdit={startEdit}
        onDelete={handleDelete}
        permission={permission}
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={filtered.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
