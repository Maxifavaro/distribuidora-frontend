import React from 'react';

/**
 * Pie de paginación común a todos los ABM.
 * `page` es 1-based; `filteredFrom` es el total sin filtrar (opcional).
 */
export default function PaginationFooter({ page, pageSize, total, onPageChange, filteredFrom = null }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  if (total === 0) return null;

  return (
    <>
      <div className="text-muted small text-center mt-2">
        Mostrando {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, total)} de {total} registros
        {filteredFrom !== null && filteredFrom !== total && ` (filtrados de ${filteredFrom} totales)`}
      </div>
      <div className="d-flex justify-content-center mt-2">
        <nav>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => onPageChange(safePage - 1)} disabled={safePage === 1}>
                Anterior
              </button>
            </li>
            <li className="page-item disabled">
              <span className="page-link">Página {safePage} de {totalPages}</span>
            </li>
            <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => onPageChange(safePage + 1)} disabled={safePage === totalPages}>
                Siguiente
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
}
