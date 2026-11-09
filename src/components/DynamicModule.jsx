import React, { useEffect, useState } from 'react';
import useStore from '../store';
import DynamicGrid from './shared/DynamicGrid';
import DynamicForm from './shared/DynamicForm';
import ColumnSelector from './ColumnSelector';
import ModuleSummary from './shared/ModuleSummary';
import api from '../store/api';
import Swal from 'sweetalert2';

const MANUAL_KEY_MODULES = ['categoria', 'listaprecio', 'condiva'];
const EMPTY_CONFIG = {};

function recordKey(record, structure) {
  const keys = structure.primaryKeys || structure.columns.filter(col => col.isPrimaryKey).map(col => col.name);
  if (!keys.length || keys.some(key => record[key] === null || record[key] === undefined)) {
    throw new Error('No se pudo identificar el registro');
  }
  return encodeURIComponent(keys.length === 1 ? String(record[keys[0]]) : JSON.stringify(keys.map(key => record[key])));
}

/**
 * DynamicModule
 * Componente genérico que genera un módulo CRUD completo basado en la estructura de la tabla
 * Funciona para CUALQUIER módulo: Proveedores, Clientes, Productos, etc.
 */
export default function DynamicModule({ sectionKey, config = EMPTY_CONFIG }) {
  const {
    fetchTableStructure,
    getSectionByKey,
    fetchSections,
    permission
  } = useStore();

  const [data, setData] = useState([]);
  const [tableStructure, setTableStructure] = useState(null);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [fieldOptions, setFieldOptions] = useState();

  useEffect(() => {
    loadModule();
  }, [sectionKey]);

  const loadModule = async () => {
    try {
      setLoading(true);
      setError(null);

      let currentSection = getSectionByKey?.(sectionKey);
      
      if (!currentSection) {
        console.log('Section not cached, fetching...', { sectionKey });
        const loadedSections = await fetchSections?.();
        currentSection = loadedSections?.find(s => s.key === sectionKey);
      }
      
      if (!currentSection || !currentSection.table_name) {
        throw new Error(`Módulo '${sectionKey}' no encontrado`);
      }

      console.log('Module loaded:', { tableName: currentSection.table_name });
      setSection(currentSection);

      const structure = await fetchTableStructure?.(currentSection.table_name, { refresh: !!config.refreshStructure });
      if (!structure) {
        throw new Error(`No se pudo obtener estructura: ${currentSection.table_name}`);
      }
      setTableStructure(structure);

      const storageKey = `dynamicGrid.columns.${currentSection.table_name}`;
      const allNames = structure.columns
        .filter(c => !c.isIdentity && !c.isComputed && !(config.gridHiddenColumns || []).includes(c.name.toLowerCase()))
        .map(c => c.name);
      let initialColumns = allNames;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const savedNames = JSON.parse(saved).filter(n => allNames.includes(n));
          if (savedNames.length > 0) initialColumns = savedNames;
        } catch {
          initialColumns = allNames;
        }
      }
      if (config.prepareColumns) initialColumns = config.prepareColumns(initialColumns, allNames, storageKey);
      setSelectedColumns(initialColumns);

      setFieldOptions(config.loadOptions ? await config.loadOptions() : undefined);

      const dynamicEndpoint = `/dynamic/${currentSection.table_name}`;
      await loadData(dynamicEndpoint);
      setLoading(false);
    } catch (err) {
      console.error('DynamicModule Error:', err);
      setError(err.message || 'Error desconocido');
      setLoading(false);
    }
  };

  const loadData = async (endpoint) => {
    try {
      const response = await api.get(endpoint);
      setData(response.data);
    } catch (err) {
      console.error('Error loading data:', err);
      throw err;
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (record) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        const deleteEndpoint = `/dynamic/${section.table_name}/${recordKey(record, tableStructure)}`;
        
        await api.delete(deleteEndpoint);
        
        Swal.fire('Eliminado', 'El registro fue eliminado correctamente', 'success');
        
        // Recargar datos
        await loadData(`/dynamic/${section.table_name}`);
      } catch (err) {
        console.error('Error deleting record:', err);
        Swal.fire('Error', `No se pudo eliminar el registro: ${err.response?.data?.error || err.message}`, 'error');
      }
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      if (editingRecord) {
        // Update
        const updateEndpoint = `/dynamic/${section.table_name}/${recordKey(editingRecord, tableStructure)}`;
        await api.put(updateEndpoint, formData);
        Swal.fire('Éxito', 'Registro actualizado correctamente', 'success');
      } else {
        // Create
        await api.post(`/dynamic/${section.table_name}`, formData);
        Swal.fire('Éxito', 'Registro creado correctamente', 'success');
      }

      setShowForm(false);
      await loadData(`/dynamic/${section.table_name}`);
    } catch (err) {
      console.error('Error submitting form:', err);
      Swal.fire('Error', `No se pudo guardar el registro: ${err.response?.data?.error || err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColumnsChange = (columns) => {
    setSelectedColumns(columns);
    if (section?.table_name) {
      localStorage.setItem(`dynamicGrid.columns.${section.table_name}`, JSON.stringify(columns));
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2">Cargando módulo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5>Error cargando el módulo</h5>
        <p>{error}</p>
        <button className="btn btn-sm btn-outline-danger" onClick={() => loadModule()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!section) {
    return <div className="alert alert-danger">Módulo no encontrado para sectionKey: {sectionKey}</div>;
  }

  if (!tableStructure) {
    return <div className="alert alert-danger">Estructura de tabla no encontrada para: {section.table_name}</div>;
  }

  const gridStructure = config.gridHiddenColumns
    ? { ...tableStructure, columns: tableStructure.columns.filter(col => !config.gridHiddenColumns.includes(col.name.toLowerCase())) }
    : tableStructure;
  const fieldLabels = config.fieldLabels;
  const dateOnlyFields = config.dateOnlyFields;
  const adminOnlyActions = config.adminOnlyActions || MANUAL_KEY_MODULES.includes(sectionKey);
  const formProps = {
    editablePrimaryKeys: MANUAL_KEY_MODULES.includes(sectionKey),
    allowTextPunctuation: MANUAL_KEY_MODULES.includes(sectionKey),
    ...config.formProps
  };
  const FormHeading = config.FormHeading;

  return (
    <div className={`dynamic-module${config.moduleClassName ? ` ${config.moduleClassName}` : ''}`}>
      {!showForm ? (
        <>
          {/* Vista de Grilla */}
          <ModuleSummary moduleKey={sectionKey} sectionName={section.name} count={data.length} />

          <div className="dynamic-module-toolbar client-module-toolbar mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex gap-2 align-items-center client-module-search-group">
              <input
                type="text"
                className="form-control"
                placeholder={config.searchPlaceholder || 'Buscar...'}
                aria-label={config.searchLabel || 'Buscar registros'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {(!adminOnlyActions || permission === 'admin') && <button
                className="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0"
                onClick={handleCreate}
                title={config.createTitle || 'Crear Nuevo'}
              >
                <span aria-hidden="true">+</span><span>{config.createLabel || 'Nuevo registro'}</span>
              </button>}
            </div>
            <div className="d-flex gap-2 align-items-center client-module-options">
              <ColumnSelector
                tableStructure={gridStructure}
                selectedColumns={selectedColumns}
                onChange={handleColumnsChange}
                fieldLabels={fieldLabels}
              />
              <label className="small text-muted mb-0">Mostrar:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="client-module-grid">
            <DynamicGrid
              tableStructure={gridStructure}
              data={data}
              visibleColumns={selectedColumns}
              searchTerm={searchTerm}
              pageSize={pageSize}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
              searchExcludedColumns={config.gridHiddenColumns}
              showActions={!adminOnlyActions || permission === 'admin'}
              fieldLabels={fieldLabels}
              fieldOptions={fieldOptions}
              dateOnlyFields={dateOnlyFields}
            />
          </div>
        </>
      ) : (
        <>
          {/* Vista de Formulario */}
          <div className={`card form-panel client-module-form p-4 mb-3${config.formClassName ? ` ${config.formClassName}` : ''}`}>
            {FormHeading ? (
              <FormHeading editing={!!editingRecord} />
            ) : (
              <h5 className="card-title">
                {editingRecord ? 'Editar Registro' : 'Crear Nuevo Registro'}
              </h5>
            )}

            <DynamicForm
              tableStructure={tableStructure}
              initialData={editingRecord}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              submitLabel={editingRecord ? (config.submitLabels?.edit || 'Actualizar') : (config.submitLabels?.create || 'Crear')}
              isLoading={isSubmitting}
              {...formProps}
              fieldLabels={fieldLabels}
              fieldOptions={fieldOptions}
              dateOnlyFields={dateOnlyFields}
            />
          </div>
        </>
      )}
    </div>
  );
}
