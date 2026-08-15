import React from 'react';
import { Button, Table } from '../../componentsUI';

/**
 * MarcaGrid - Tabla de marcas con paginación personalizada
 */
export default function MarcaGrid({
  marcas = [],
  onEdit,
  onDelete,
  permission = 'read',
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  itemsPerPage = 10,
  onPageChange
}) {
  const columns = [
    { key: 'id_marca', label: 'ID' },
    { key: 'descripcion', label: 'Descripción' },
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
                Editar
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => onDelete(row.id_marca, row.descripcion)}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);

  return (
    <>
      <Table
        columns={columns}
        data={marcas}
        emptyMessage="No hay resultados"
        striped
        hover
        responsive
      />

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
                Anterior
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => onPageChange(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
                Siguiente
              </button>
            </li>
          </ul>
          <div className="text-center text-muted">
            Mostrando {startIndex + 1} - {endIndex} de {totalRecords} marcas
          </div>
        </nav>
      )}
    </>
  );
}
