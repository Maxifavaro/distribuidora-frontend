import React from 'react';
import { Button, Table, Badge } from '../../componentsUI';

/**
 * RepartidorGrid - Tabla de repartidores
 */
export default function RepartidorGrid({
  repartidores = [],
  onEdit,
  onDelete,
  permission = 'read'
}) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { 
      key: 'dni', 
      label: 'DNI',
      render: (row) => row.dni || '-'
    },
    { 
      key: 'telefono', 
      label: 'Teléfono',
      render: (row) => row.telefono || '-'
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (row) => row.email || '-'
    },
    {
      key: 'licencia',
      label: 'Licencia',
      render: (row) => (
        <div>
          {row.licencia_conducir || '-'}
          {row.vencimiento_licencia && (
            <div className="small text-muted">
              Venc: {new Date(row.vencimiento_licencia).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge 
          variant={
            row.estado === 'Activo' ? 'success' : 
            row.estado === 'Inactivo' ? 'secondary' : 
            'warning'
          }
        >
          {row.estado}
        </Badge>
      )
    },
    {
      key: 'fecha_ingreso',
      label: 'Fecha Ingreso',
      render: (row) => row.fecha_ingreso ? new Date(row.fecha_ingreso).toLocaleDateString() : '-'
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div>
          {permission === 'admin' && (
            <>
              <Button 
                variant="warning" 
                size="sm" 
                className="me-2" 
                onClick={() => onEdit(row)}
              >
                ✏️ Editar
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => onDelete(row.id, row.nombre, row.apellido)}
              >
                🗑️ Eliminar
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={repartidores}
      emptyMessage="No hay repartidores para mostrar"
      striped
      hover
      responsive
    />
  );
}
