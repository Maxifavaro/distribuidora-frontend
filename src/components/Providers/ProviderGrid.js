import React from 'react';
import { Button, Table, Pagination } from '../../componentsUI';

/**
 * ProviderGrid - Tabla de proveedores con paginación
 */
export default function ProviderGrid({
  providers = [],
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
                onClick={() => onDelete(row.id, row.razon_social)}
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
        data={providers}
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
