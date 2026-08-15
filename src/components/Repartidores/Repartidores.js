import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import Swal from 'sweetalert2';
import { SearchBar, Button } from '../../componentsUI';
import RepartidorForm from './RepartidorForm';
import RepartidorGrid from './RepartidorGrid';

export default function Repartidores() {
  const store = useStore();
  const { repartidores = [], fetchRepartidores, createRepartidor, updateRepartidor, deleteRepartidor, loading, permission } = store;
  
  const [form, setForm] = useState({ 
    nombre: '', apellido: '', dni: '', telefono: '', direccion: '', email: '',
    fecha_ingreso: new Date().toISOString().split('T')[0],
    estado: 'Activo', observaciones: '', licencia_conducir: '', vencimiento_licencia: ''
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
      nombre: '', apellido: '', dni: '', telefono: '', direccion: '', email: '',
      fecha_ingreso: new Date().toISOString().split('T')[0],
      estado: 'Activo', observaciones: '', licencia_conducir: '', vencimiento_licencia: ''
    });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        nombre: form.nombre, apellido: form.apellido,
        dni: form.dni || null, telefono: form.telefono || null,
        direccion: form.direccion || null, email: form.email || null,
        fecha_ingreso: form.fecha_ingreso || null, estado: form.estado,
        observaciones: form.observaciones || null,
        licencia_conducir: form.licencia_conducir || null,
        vencimiento_licencia: form.vencimiento_licencia || null
      };
      
      if (editingId) {
        await updateRepartidor(editingId, payload);
        Swal.fire('Actualizado', 'Repartidor actualizado', 'success');
        cancelEdit();
      } else {
        await createRepartidor(payload);
        Swal.fire('Creado', 'Repartidor creado exitosamente', 'success');
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
          <Button 
            variant="primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Ocultar Formulario' : '+ Nuevo Repartidor'}
          </Button>
        )}
      </div>

      {showForm && permission === 'admin' && (
        <RepartidorForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          isEditing={!!editingId}
          loading={loading}
        />
      )}

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre, apellido, DNI o ID..."
      />

      <RepartidorGrid
        repartidores={filtered}
        onEdit={startEdit}
        onDelete={handleDelete}
        permission={permission}
      />
    </div>
  );
}
