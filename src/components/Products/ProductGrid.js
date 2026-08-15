import React from 'react';
import { Button, Table, Badge } from '../../componentsUI';

/**
 * ProductGrid - Tabla de productos
 */
export default function ProductGrid({
  products = [],
  onEdit,
  onDelete,
  permission = 'read'
}) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nombre' },
    { 
      key: 'sku', 
      label: 'SKU',
      render: (row) => row.sku || 'N/A'
    },
    { 
      key: 'price', 
      label: 'Precio',
      render: (row) => `$${row.price ? parseFloat(row.price).toFixed(2) : '0.00'}`
    },
    { 
      key: 'stock', 
      label: 'Stock',
      render: (row) => row.stock || 0
    },
    { 
      key: 'provider_name', 
      label: 'Proveedor',
      render: (row) => row.provider_name || 'N/A'
    },
    { 
      key: 'rubro_name', 
      label: 'Rubro',
      render: (row) => row.rubro_name || 'N/A'
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row) => (
        <Badge variant={row.Estado === 'Activo' ? 'success' : 'secondary'}>
          {row.Estado || 'Activo'}
        </Badge>
      )
    },
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
                onClick={() => onDelete(row.id, row.name)}
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
    <Table
      columns={columns}
      data={products}
      emptyMessage="No results"
      striped
      hover
      responsive
    />
  );
}
