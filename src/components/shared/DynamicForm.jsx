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
  multiSelectFields = [],
  strictOptionFields = [],
  dateOnlyFields = []
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const catalogs = useStore();
  const { fetchBarrios, fetchLocalidades } = catalogs;
  const hasKeyValue = (column) => column.isPrimaryKey && initialData && initialData[column.name] !== undefined && initialData[column.name] !== null;
  const keyIsEditable = (column) => editablePrimaryKeys && !column.readOnly;
  const isLocked = (column) =>
    lockedColumns.some(name => name.toLowerCase() === column.name.toLowerCase()) ||
    (column.isPrimaryKey && (!keyIsEditable(column) || hasKeyValue(column)));
  const isHidden = (column) =>
    !hasKeyValue(column) && hiddenColumns.some(name => name.toLowerCase() === column.name.toLowerCase());
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
      setFormData({
        ...initialized,
        ...Object.fromEntries(multiSelectFields.map(f => [f.name, Array.isArray(safeInitialData[f.name]) ? safeInitialData[f.name] : []]))
      });
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

    multiSelectFields.forEach(f => { submitData[f.name] = formData[f.name] || []; });

    onSubmit(submitData);
  };

  if (!tableStructure || !tableStructure.columns) {
    return <div className="alert alert-info">Cargando estructura de tabla...</div>;
  }

  // Filter out primary key column (should be handled separately or not editable)
  // La clave (ID) se muestra de solo lectura al editar un registro
  const editableColumns = tableStructure.columns.filter(col =>
    (!col.isPrimaryKey || keyIsEditable(col) || hasKeyValue(col)) && !isHidden(col));

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
    const keyColumns = editableColumns.filter(c => c.isPrimaryKey && !used.has(c.name));
    keyColumns.forEach(c => used.add(c.name));
    if (keyColumns.length && sections.length) sections[0] = { ...sections[0], cols: [...keyColumns, ...sections[0].cols] };
    else if (keyColumns.length) sections.push({ title: otherGroupTitle, cols: keyColumns });
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

      {multiSelectFields.map(field => (
        <fieldset key={field.name} className="border rounded p-3 mt-3">
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">{field.label}</legend>
          <div className="row">
            {(field.options || fieldOptions[field.name] || []).map(option => {
              const selected = (formData[field.name] || []).map(String).includes(String(option.id));
              return (
                <div key={option.id} className="col-md-4 col-sm-6">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`${field.name}-${option.id}`}
                      checked={selected}
                      onChange={() => handleFieldChange(field.name, selected
                        ? formData[field.name].filter(id => String(id) !== String(option.id))
                        : [...(formData[field.name] || []), option.id])}
                    />
                    <label className="form-check-label" htmlFor={`${field.name}-${option.id}`}>{option.nombre}</label>
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className={`d-flex gap-2 mt-4 justify-content-end${compact ? ' client-entry-actions' : ''}`}>
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
