import React, { useState, useEffect } from 'react';
import DynamicFieldRenderer, { formatLabel } from '../utils/DynamicFieldRenderer';

/**
 * DynamicForm
 * Genera un formulario completo basado en la estructura de la tabla
 * Soporta:
 * - Validación por tipo de dato y longitud
 * - Campos requeridos
 * - Submit/Cancel
 */
export default function DynamicForm({ 
  tableStructure, 
  initialData = {}, 
  onSubmit, 
  onCancel,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  isLoading = false
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize form data from initialData or empty values
    if (tableStructure && tableStructure.columns) {
      const safeInitialData = initialData || {};
      const initialized = {};
      tableStructure.columns.forEach(col => {
        initialized[col.name] = safeInitialData[col.name] || 
          (col.fieldType === 'boolean' ? 0 : '');
      });
      setFormData(initialized);
    }
  }, [tableStructure, initialData]);

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!tableStructure || !tableStructure.columns) {
      return newErrors;
    }

    tableStructure.columns.forEach(col => {
      const value = formData[col.name];

      // Skip identity/computed columns
      if (col.readOnly) return;

      // Check required fields
      if (!col.isNullable && (value === '' || value === null || value === undefined)) {
        newErrors[col.name] = `${formatLabel(col.name)} es requerido`;
        return;
      }

      // Check length for text fields
      const textMaxLength = col.maxLength > 0 ? col.maxLength : 255;
      if (col.fieldType === 'text' && value && value.length > textMaxLength) {
        newErrors[col.name] = `No puede exceder ${textMaxLength} caracteres`;
        return;
      }

      // Check number fields
      if ((col.fieldType === 'number' || col.fieldType === 'decimal') && value) {
        if (isNaN(value)) {
          newErrors[col.name] = `Debe ser un número válido`;
          return;
        }
      }
    });

    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Prepare data: convert empty strings to null for nullable fields
    const submitData = {};
    if (tableStructure && tableStructure.columns) {
      tableStructure.columns.forEach(col => {
        let value = formData[col.name];
        
        // Convert empty strings to null for nullable fields
        if (col.isNullable && value === '') {
          value = null;
        }
        
        submitData[col.name] = value;
      });
    }

    onSubmit(submitData);
  };

  if (!tableStructure || !tableStructure.columns) {
    return <div className="alert alert-info">Cargando estructura de tabla...</div>;
  }

  // Filter out primary key column (should be handled separately or not editable)
  const editableColumns = tableStructure.columns.filter(col => !col.isPrimaryKey);

  return (
    <form onSubmit={handleSubmit} className="dynamic-form">
      <div className="row">
        {editableColumns.map((column, index) => (
          <div key={column.name} className={column.fieldType === 'boolean' ? 'col-12' : 'col-md-6'}>
            <DynamicFieldRenderer
              column={column}
              value={formData[column.name]}
              onChange={handleFieldChange}
              error={errors[column.name]}
            />
            {errors[column.name] && (
              <div className="text-danger small mt-1">
                {errors[column.name]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mt-4">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : submitLabel}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
