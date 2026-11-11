import React from 'react';
import DynamicModule from '../DynamicModule';
import api from '../../store/api';

async function loadOptions() {
  const { data: rubros } = await api.get('/rubros');
  if (!Array.isArray(rubros)) throw new Error('El catálogo de rubros tiene un formato inválido');
  return { rubro_ids: rubros.map(r => ({ id: r.id_rubro, nombre: r.descripcion })) };
}

async function loadRecordExtras(record) {
  const { data } = await api.get(`/providers/${record.ID_Proveedor}/rubros`);
  return { rubro_ids: data.map(r => r.id_rubro) };
}

async function afterSave(formData, saved, editingRecord) {
  const id = editingRecord?.ID_Proveedor ?? saved.ID_Proveedor;
  if (!id) throw new Error('No se pudo determinar el proveedor guardado');
  await api.put(`/providers/${id}/rubros`, { rubro_ids: formData.rubro_ids });
}

const config = {
  loadOptions,
  loadRecordExtras,
  afterSave,
  formProps: { multiSelectFields: [{ name: 'rubro_ids', label: 'Rubros' }] }
};

export default function Providers() {
  return <DynamicModule sectionKey="providers" config={config} />;
}
