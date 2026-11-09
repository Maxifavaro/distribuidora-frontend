import React, { useState, useEffect } from 'react';
import DynamicFieldRenderer, { formatLabel, LOOKUP_COLUMNS } from '../../utils/DynamicFieldRenderer';
import useStore from '../../store';

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
  isLoading = false,
  groups = null,
  otherGroupTitle = 'Varios',
  compact = false,
  lockedColumns = [],
  hiddenColumns = [],
  checkboxColumns = [],
  editablePrimaryKeys = false,
  allowTextPunctuation = false,
  fieldLabels = {},
  fieldOptions = {},
  strictOptionFields = [],
  dateOnlyFields = []
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const catalogs = useStore();
  const { fetchBarrios, fetchLocalidades } = catalogs;
  const isLocked = (column) =>
    lockedColumns.some(name => name.toLowerCase() === column.name.toLowerCase());
  const isHidden = (column) =>
    hiddenColumns.some(name => name.toLowerCase() === column.name.toLowerCase());
  const isCheckbox = (column) =>
    checkboxColumns.some(name => name.toLowerCase() === column.name.toLowerCase());

  useEffect(() => {
    fetchBarrios();
    fetchLocalidades();
  }, [fetchBarrios, fetchLocalidades]);

  useEffect(() => {
    // Initialize form data from initialData or empty values
    if (tableStructure && tableStructure.columns) {
      const safeInitialData = initialData || {};
      const initialized = {};
      tableStructure.columns.forEach(col => {
        const value = safeInitialData[col.name] ??
          (col.fieldType === 'boolean' || isCheckbox(col) ? 0 : '');
        initialized[col.name] = col.fieldType === 'datetime' && typeof value === 'string'
          ? value.slice(0, dateOnlyFields.includes(col.name.toLowerCase()) ? 10 : 16)
          : value;
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
      if (col.readOnly || isLocked(col) || isHidden(col)) return;

      // Check required fields
      if (!col.isNullable && (value === '' || value === null || value === undefined)) {
        newErrors[col.name] = `${fieldLabels[col.name.toLowerCase()] || formatLabel(col.name)} es requerido`;
        return;
      }

      const optionKey = col.name.toLowerCase();
      if (strictOptionFields.includes(optionKey) && value !== '' && value !== null && value !== undefined &&
          !fieldOptions[optionKey]?.some(option => String(option.id) === String(value))) {
        newErrors[col.name] = 'Seleccioná una opción válida.';
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
        if (isLocked(col) || isHidden(col)) return;
        let value = formData[col.name];

        if (dateOnlyFields.includes(col.name.toLowerCase()) && initialData &&
            typeof initialData[col.name] === 'string' && value === initialData[col.name].slice(0, 10)) {
          value = initialData[col.name];
        }

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
  const editableColumns = tableStructure.columns.filter(col =>
    (!col.isPrimaryKey || (editablePrimaryKeys && !col.readOnly)) && !isHidden(col));

  const renderField = (column) => (
    <div key={column.name} className={column.fieldType === 'boolean' ? 'col-12' : 'col-md-6'}>
      <DynamicFieldRenderer
        column={isCheckbox(column) ? { ...column, fieldType: 'boolean' } : column}
        value={formData[column.name]}
        onChange={handleFieldChange}
        options={fieldOptions[column.name.toLowerCase()] ?? (LOOKUP_COLUMNS[column.name] ? catalogs[LOOKUP_COLUMNS[column.name]] : undefined)}
        label={fieldLabels[column.name.toLowerCase()]}
        dateOnly={dateOnlyFields.includes(column.name.toLowerCase())}
        error={errors[column.name]}
        allowTextPunctuation={allowTextPunctuation}
        locked={isLocked(column)}
      />
      {errors[column.name] && (
        <div id={`${column.name}-error`} className="text-danger small mt-1">
          {errors[column.name]}
        </div>
      )}
    </div>
  );

  // Sin grupos: lista plana. Con grupos: un frame por grupo y "Varios" con el resto.
  let sections = null;
  if (groups && groups.length > 0) {
    const byName = new Map(editableColumns.map(c => [c.name.toLowerCase(), c]));
    const used = new Set();
    sections = groups.map(group => {
      const cols = group.columns
        .map(name => byName.get(name.toLowerCase()))
        .filter(Boolean);
      cols.forEach(c => used.add(c.name));
      return { title: group.title, cols };
    });
    sections.push({
      title: otherGroupTitle,
      cols: editableColumns.filter(c => !used.has(c.name))
    });
    sections = sections.filter(s => s.cols.length > 0);
  }

  return (
    <form onSubmit={handleSubmit} className={`dynamic-form${compact ? ' client-entry-form' : ''}`}>
      {sections ? (
        sections.map(section => (
          <fieldset key={section.title} className="border rounded p-3 mb-3">
            <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">{section.title}</legend>
            <div className="row">{section.cols.map(renderField)}</div>
          </fieldset>
        ))
      ) : (
        <div className="row">{editableColumns.map(renderField)}</div>
      )}

      <div className={`d-flex gap-2 mt-4${compact ? ' client-entry-actions' : ''}`}>
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
