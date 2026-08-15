import React from 'react';
import { Button, Table, Pagination } from '../../componentsUI';

/**
 * ClientGrid - Tabla de clientes con paginación
 * @param {Object} props
 * @param {Array} props.clients - Lista de clientes a mostrar
 * @param {Function} props.onEdit - Handler para editar cliente
 * @param {Function} props.onDelete - Handler para eliminar cliente
 * @param {string} props.permission - Permiso del usuario (admin/read)
 * @param {number} props.currentPage - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {number} props.totalRecords - Total de registros
 * @param {Function} props.onPageChange - Handler para cambio de página
 */
export default function ClientGrid({
  clients = [],
  onEdit,
  onDelete,
  permission = 'read',
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange
}) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'razon_social', label: 'Razón Social' },
    { 
      key: 'direccion', 
      label: 'Dirección',
      render: (row) => `${row.direccion || ''} ${row.numero || ''}`.trim()
    },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'localidad_nombre', label: 'Localidad' },
    { key: 'estado', label: 'Estado' },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div>
          {permission === 'admin' && (
            <>
              <Button 
                variant="info" 
                size="sm" 
                className="me-2" 
                onClick={() => onEdit(row)}
              >
                Edit
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => onDelete(row.id, row.nombre)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        data={clients}
        emptyMessage="No results"
        striped
        hover
        responsive
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRecords={totalRecords}
        onPageChange={onPageChange}
      />
    </>
  );
}
