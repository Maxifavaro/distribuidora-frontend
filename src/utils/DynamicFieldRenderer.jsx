import React from 'react';

/**
 * DynamicFieldRenderer
 * Renderiza un campo de formulario basado en el tipo de dato SQL
 */
export default function DynamicFieldRenderer({ 
  column, 
  value, 
  onChange, 
  onBlur 
}) {
  const { name, dataType, fieldType, maxLength, isNullable, readOnly } = column;

  // Skip identity/computed columns
  if (readOnly) {
    return (
      <div className="mb-3">
        <label className="form-label text-muted">{formatLabel(name)}</label>
        <div className="form-control-plaintext">{value || '-'}</div>
      </div>
    );
  }

  const commonProps = {
    className: 'form-control',
    value: value || '',
    onChange: (e) => onChange(name, e.target.value),
    onBlur,
    disabled: readOnly
  };

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {formatLabel(name)}
        {!isNullable && <span className="text-danger">*</span>}
      </label>

      {fieldType === 'text' && (
        <input
          id={name}
          type="text"
          maxLength={maxLength || 255}
          placeholder={`Máximo ${maxLength || '255'} caracteres`}
          {...commonProps}
        />
      )}

      {fieldType === 'number' && (
        <input
          id={name}
          type="number"
          {...commonProps}
        />
      )}

      {fieldType === 'decimal' && (
        <input
          id={name}
          type="number"
          step="0.01"
          {...commonProps}
        />
      )}

      {fieldType === 'datetime' && (
        <input
          id={name}
          type="datetime-local"
          {...commonProps}
        />
      )}

      {fieldType === 'boolean' && (
        <div className="form-check">
          <input
            id={name}
            type="checkbox"
            className="form-check-input"
            checked={value === true || value === 1 || value === '1'}
            onChange={(e) => onChange(name, e.target.checked ? 1 : 0)}
            disabled={readOnly}
          />
          <label className="form-check-label" htmlFor={name}>
            {formatLabel(name)}
          </label>
        </div>
      )}

      <small className="d-block text-muted mt-1">
        Tipo: {dataType}
        {maxLength && ` | Máx. ${maxLength} caracteres`}
      </small>
    </div>
  );
}

/**
 * Convierte nombres de campo (ID_Producto) a etiquetas legibles (Producto)
 */
export function formatLabel(fieldName) {
  return fieldName
    .replace(/^ID_/, '') // Remove ID_ prefix
    .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formatea valores basado en tipo de dato para mostrar
 */
export function formatDisplayValue(value, fieldType, dataType) {
  if (value === null || value === undefined) return '-';

  if (fieldType === 'datetime') {
    const date = new Date(value);
    return date.toLocaleString('es-AR');
  }

  if (fieldType === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (fieldType === 'number' || fieldType === 'decimal') {
    return Number(value).toLocaleString('es-AR');
  }

  if (fieldType === 'text') {
    return String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '');
  }

  return String(value);
}
