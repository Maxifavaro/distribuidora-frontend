import React, { useState, useEffect, useRef } from 'react';
import { formatLabel } from '../utils/DynamicFieldRenderer';

/**
 * ColumnSelector
 * Dropdown de selección múltiple para elegir qué columnas mostrar en DynamicGrid
 * Persiste la selección en localStorage por tabla
 */
export default function ColumnSelector({ tableStructure, selectedColumns, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!tableStructure?.columns) return null;

  const allColumns = tableStructure.columns.filter(col => !col.isIdentity && !col.isComputed);

  const toggleColumn = (name) => {
    const next = selectedColumns.includes(name)
      ? selectedColumns.filter(n => n !== name)
      : [...selectedColumns, name];
    onChange(next);
  };

  return (
    <div className="dropdown d-inline-block" ref={ref}>
      <button
        type="button"
        className="btn btn-outline-secondary btn-sm dropdown-toggle"
        onClick={() => setOpen(prev => !prev)}
        aria-expanded={open}
      >
        Columnas ({selectedColumns.length}/{allColumns.length})
      </button>
      <div
        className={`dropdown-menu p-2 ${open ? 'show' : ''}`}
        style={{ maxHeight: '320px', overflowY: 'auto', minWidth: '240px' }}
      >
        <div className="d-flex gap-2 mb-2 px-1">
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => onChange(allColumns.map(c => c.name))}>
            Seleccionar todas
          </button>
          <span className="text-muted">|</span>
          <button type="button" className="btn btn-link btn-sm p-0" onClick={() => onChange([])}>
            Quitar todas
          </button>
        </div>
        <hr className="dropdown-divider my-1" />
        {allColumns.map(col => (
          <div key={col.name} className="form-check ms-2">
            <input
              type="checkbox"
              className="form-check-input"
              id={`col-check-${col.name}`}
              checked={selectedColumns.includes(col.name)}
              onChange={() => toggleColumn(col.name)}
            />
            <label className="form-check-label" htmlFor={`col-check-${col.name}`}>
              {formatLabel(col.name)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
