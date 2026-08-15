import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import Swal from 'sweetalert2';
import ClientForm from './ClientForm';
import ClientGrid from './ClientGrid';
import ClientSearch from './ClientSearch';

/**
 * Clients - Componente contenedor principal para gestión de clientes
 */
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

  // Cargar datos iniciales
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
    const confirmed = await Swal.fire({ 
      title: `Eliminar ${nombre}?`, 
      showCancelButton: true, 
      confirmButtonText: 'Eliminar', 
      icon: 'warning' 
    });
    if (confirmed.isConfirmed) {
      try {
        await deleteClient(id);
        Swal.fire('Eliminado', `${nombre} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Filtrado de clientes
  const filtered = Array.isArray(clients) ? clients.filter(c => 
    (c.nombre || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.apellido || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.razon_social || '').toLowerCase().includes(search.toLowerCase()) ||
    String(c.id) === search
  ) : [];

  // Paginación
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClients = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <h4>Clientes</h4>

      {/* Barra de búsqueda y toggle de formulario */}
      <ClientSearch
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        showFormToggle={true}
        formVisible={showForm}
        onToggleForm={(e) => setShowForm(e.target.checked)}
        isEditing={!!editingId}
        permission={permission}
      />

      {/* Formulario de creación/edición */}
      {showForm && (
        <ClientForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          isEditing={!!editingId}
          loading={loading}
          barrios={barrios}
          localidades={localidades}
          zonas={zonas}
          condicionesPago={condicionesPago}
        />
      )}

      <hr />

      {/* Grilla de clientes */}
      <ClientGrid
        clients={paginatedClients}
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
