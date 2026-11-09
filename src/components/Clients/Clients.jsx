import React from 'react';
import DynamicModule from '../DynamicModule';
import FormHeading from '../shared/FormHeading';
import api from '../../store/api';

const hiddenColumns = ['userweb', 'passwordweb', 'id_zona'];
const states = [{ id: 'Activo', nombre: 'Activo' }, { id: 'Inactivo', nombre: 'Inactivo' }];

async function loadOptions() {
  const [vendedores, condicionesIva, listasPrecios] = await Promise.all([
    api.get('/catalogs/vendedores'),
    api.get('/catalogs/condiciones-iva'),
    api.get('/catalogs/listas-precios')
  ]);
  if (![vendedores.data, condicionesIva.data, listasPrecios.data].every(Array.isArray)) {
    throw new Error('Los catálogos de clientes tienen un formato inválido');
  }
  return { id_empleado: vendedores.data, id_condicion: condicionesIva.data, idlista: listasPrecios.data, estado: states };
}

function ClientFormHeading({ editing }) {
  return (
    <FormHeading
      eyebrow="DIRECTORIO DE CLIENTES"
      title={editing ? 'Editar cliente' : 'Nuevo cliente'}
      description={`Completá los datos para ${editing ? 'actualizar el cliente' : 'agregar un cliente al directorio'}.`}
    />
  );
}

const config = {
  loadOptions,
  gridHiddenColumns: hiddenColumns,
  fieldLabels: { id_empleado: 'Vendedor', id_condicion: 'Condición de IVA', idlista: 'Lista de precios' },
  dateOnlyFields: ['fechaalta'],
  moduleClassName: 'client-dynamic-module',
  searchPlaceholder: 'Buscar por nombre, razón social o ID...',
  searchLabel: 'Buscar clientes',
  createTitle: 'Crear cliente',
  createLabel: 'Nuevo cliente',
  formClassName: 'client-entry-panel',
  FormHeading: ClientFormHeading,
  submitLabels: { create: 'Guardar cliente', edit: 'Guardar cambios' },
  formProps: {
    groups: [
      { title: 'Datos del cliente', columns: ['Nombre', 'Apellido', 'RazonSocial', 'Estado'] },
      { title: 'Contacto', columns: ['Telefono', 'correo', 'sitioweb'] },
      { title: 'Dirección', columns: ['Direccion', 'Numero', 'ID_Barrio', 'ID_Localidad', 'CodigoPostal'] },
      { title: 'Datos impositivos', columns: ['CUIT', 'IngresosBrutos', 'id_condicion', 'direccionFacturacion', 'numerofacturacion'] }
    ],
    compact: true,
    otherGroupTitle: 'Otros datos',
    lockedColumns: ['CueCodigo', 'PerCodigo'],
    hiddenColumns,
    checkboxColumns: ['ActivoWeb'],
    allowTextPunctuation: true,
    strictOptionFields: ['estado']
  }
};

export default function Clients() {
  return <DynamicModule sectionKey="clients" config={config} />;
}
