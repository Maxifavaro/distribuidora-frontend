import React from 'react';
import DynamicModule from '../DynamicModule';
import FormHeading from '../shared/FormHeading';
import api from '../../store/api';

function EmployeeFormHeading({ editing }) {
  return (
    <FormHeading
      eyebrow="DIRECTORIO DE EMPLEADOS"
      title={editing ? 'Editar empleado' : 'Nuevo empleado'}
      description={`Completá los datos para ${editing ? 'actualizar el empleado' : 'agregar un empleado al directorio'}.`}
    />
  );
}

async function loadOptions() {
  const { data: categorias } = await api.get('/catalogs/categorias-empleados');
  if (!Array.isArray(categorias)) throw new Error('El catálogo de categorías tiene un formato inválido');
  return {
    id_categoria: categorias,
    estado: [{ id: 'ACTIVO', nombre: 'Activo' }, { id: 'INACTIVO', nombre: 'Inactivo' }]
  };
}

function includeCategoryOnce(columns, allColumns, storageKey) {
  const categoryColumn = allColumns.find(name => name.toLowerCase() === 'id_categoria');
  const migrationKey = `${storageKey}.categoria-v1`;
  if (categoryColumn && !localStorage.getItem(migrationKey)) {
    if (!columns.includes(categoryColumn)) {
      columns = [...columns, categoryColumn];
      localStorage.setItem(storageKey, JSON.stringify(columns));
    }
    localStorage.setItem(migrationKey, '1');
  }
  return columns;
}

const config = {
  refreshStructure: true,
  adminOnlyActions: true,
  loadOptions,
  prepareColumns: includeCategoryOnce,
  fieldLabels: { cuil: 'CUIL', id_categoria: 'Categoría de empleado', fechaingreso: 'Fecha de alta' },
  dateOnlyFields: ['fechaingreso'],
  formClassName: 'client-entry-panel',
  FormHeading: EmployeeFormHeading,
  submitLabels: { create: 'Guardar empleado', edit: 'Guardar cambios' },
  formProps: {
    groups: [
      { title: 'Datos del empleado', columns: ['Apellido', 'Nombre', 'DNI', 'CUIL'] },
      { title: 'Datos de domicilio', columns: ['Direccion', 'Numero', 'ID_Barrio', 'CodigoPostal', 'ID_Localidad'] },
      { title: 'Datos de contacto', columns: ['Telefono'] },
      { title: 'Otros datos', columns: ['FechaIngreso', 'ID_Categoria', 'UsuCodigo', 'Estado'] }
    ],
    compact: true,
    lockedColumns: ['UsuCodigo'],
    hiddenColumns: ['ID_Empleado'],
    editablePrimaryKeys: true,
    allowTextPunctuation: true,
    strictOptionFields: ['estado', 'id_categoria']
  }
};

export default function Employees() {
  return <DynamicModule sectionKey="empleados" config={config} />;
}
