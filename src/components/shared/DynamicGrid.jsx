import React, { useState, useMemo, useEffect } from 'react';
import { formatDisplayValue, formatLabel, LOOKUP_COLUMNS } from '../../utils/DynamicFieldRenderer';
import useStore from '../../store';
import PaginationFooter from './PaginationFooter';

/**
 * DynamicGrid
 * Renderiza una tabla basada en la estructura de la tabla
 * `visibleColumns` (nombres de columna) controla qué columnas se muestran;
 * si no se provee, se muestran todas las columnas editables
 * `searchTerm` y `pageSize` son controlados por el componente padre
 */
export default function DynamicGrid({ 
  tableStructure, 
  data = [],
  visibleColumns = null,
  searchTerm = '',
  pageSize = 10,
  onEdit,
  onDelete,
  showActions = true,
  isLoading = false,
  searchExcludedColumns = [],
  fieldLabels = {},
  fieldOptions = {},
  dateOnlyFields = []
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const catalogs = useStore();
  const { fetchBarrios, fetchLocalidades } = catalogs;

  useEffect(() => {
    fetchBarrios();
    fetchLocalidades();
  }, [fetchBarrios, fetchLocalidades]);
  const displayValue = (row, col) => {
    if (dateOnlyFields.includes(col.name.toLowerCase()) && typeof row[col.name] === 'string') {
      const date = row[col.name].slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date.split('-').reverse().join('/');
      }
    }
    const options = fieldOptions[col.name.toLowerCase()];
    if (options && row[col.name] !== null && row[col.name] !== undefined) {
      const option = options.find(item => String(item.id) === String(row[col.name]));
      if (option) return option.nombre;
    }
    const catalogKey = LOOKUP_COLUMNS[col.name];
    if (catalogKey && row[col.name] !== null && row[col.name] !== undefined) {
      const item = (catalogs[catalogKey] || []).find(c => String(c.id) === String(row[col.name]));
      if (item) return item.nombre;
    }
    return formatDisplayValue(row[col.name], col.fieldType, col.dataType);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize, data]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.trim().toLowerCase();
    return data.filter(row =>
      Object.entries(row).some(([name, value]) =>
        !searchExcludedColumns.includes(name.toLowerCase()) &&
        value !== null && value !== undefined && String(value).toLowerCase().includes(term))
    );
  }, [data, searchTerm, searchExcludedColumns]);

  if (!tableStructure || !tableStructure.columns) {
    return <div className="alert alert-info">Cargando estructura de tabla...</div>;
  }

  if (isLoading) {
    return <div className="alert alert-info">Cargando datos...</div>;
  }

  const allColumns = tableStructure.columns.filter(col => !col.isComputed);
  const displayColumns = visibleColumns
    ? allColumns.filter(col => visibleColumns.includes(col.name))
    : allColumns;

  const primaryKeyNames = tableStructure.columns.filter(col => col.isPrimaryKey).map(col => col.name);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (!data || data.length === 0) {
    return <div className="alert alert-info">No hay registros para mostrar</div>;
  }

  if (displayColumns.length === 0) {
    return <div className="alert alert-warning">No hay columnas seleccionadas para mostrar</div>;
  }

  if (filteredData.length === 0) {
    return <div className="alert alert-info">No hay registros que coincidan con la búsqueda</div>;
  }

  return (
    <div>
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="table table-sm table-hover align-middle abm-grid-table" style={{ width: 'max-content', minWidth: '100%', fontSize: '13px' }}>
          <thead className="table-light">
            <tr>
              {showActions && <th className="text-center" style={{ whiteSpace: 'nowrap', padding: '0.2rem 0.5rem' }}>Acciones</th>}
              {displayColumns.map(col => (
                <th key={col.name} style={{ whiteSpace: 'nowrap', minWidth: '120px', padding: '0.2rem 0.5rem' }}>
                  {fieldLabels[col.name.toLowerCase()] || formatLabel(col.name)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={primaryKeyNames.length ? JSON.stringify(primaryKeyNames.map(name => row[name])) : idx}>
                {showActions && (
                  <td className="text-center align-middle" style={{ padding: '0.2rem 0.5rem' }}>
                    <div className="btn-group btn-group-sm" role="group">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => onEdit && onEdit(row)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => onDelete && onDelete(row)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
                {displayColumns.map(col => (
                  <td key={`${idx}-${col.name}`} title={String(row[col.name] || '-')} className="align-middle" style={{ whiteSpace: 'nowrap', minWidth: '120px', padding: '0.2rem 0.5rem' }}>
                    {displayValue(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        page={safePage}
        pageSize={pageSize}
        total={filteredData.length}
        filteredFrom={searchTerm.trim() ? data.length : null}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
