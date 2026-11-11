import React, { useEffect, useMemo, useState } from 'react';
import api from '../../store/api';
import FormHeading from '../shared/FormHeading';
import ProviderSearch from './ProviderSearch';
import { derivePrices, percentLabel } from './productCalc';

const fullRow = { gridColumn: '1 / -1' };

export default function ProductForm({ form, onChange, editing, rubros, alicuotas, saving, error, onSubmit, onCancel }) {
  const [marcas, setMarcas] = useState([]);
  const [rubrosProveedor, setRubrosProveedor] = useState([]);
  const set = (changes) => onChange({ ...form, ...changes });
  const proveedorId = form.proveedor?.id;

  useEffect(() => {
    if (!proveedorId) {
      setRubrosProveedor([]);
      return undefined;
    }
    let active = true;
    api.get(`/providers/${proveedorId}/rubros`)
      .then(({ data }) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        const current = rubros.find(r => String(r.id_rubro) === String(form.rubroId));
        // Un producto existente conserva su rubro aunque el proveedor ya no lo tenga asignado
        setRubrosProveedor(current && !list.some(r => r.id_rubro === current.id_rubro)
          ? [...list, { id_rubro: current.id_rubro, descripcion: current.descripcion }] : list);
      })
      .catch(() => { if (active) setRubrosProveedor([]); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedorId]);

  useEffect(() => {
    if (!form.rubroId) {
      setMarcas([]);
      return undefined;
    }
    let active = true;
    api.get('/marcas', { params: { rubro_id: form.rubroId } })
      .then(({ data }) => { if (active) setMarcas(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setMarcas([]); });
    return () => { active = false; };
  }, [form.rubroId]);

  const alicuota = alicuotas.find(item => String(item.id) === String(form.alicuotaId))?.alicuota ?? null;
  const derived = useMemo(() => derivePrices({ ...form, alicuota }), [form, alicuota]);
  const priceValue = (field) => (form.modo === field ? form.valor : derived[field]);
  const setPrice = (field) => (event) => set({ modo: field, valor: event.target.value });

  const changeRubro = (rubroId) => set({ rubroId, marcaId: '' });
  const changeCompra = (compraPack) => set({
    compraPack,
    ventaMinima: 'unidad',
    unidadesPack: compraPack ? form.unidadesPack : '',
    ...(!compraPack && form.modo.endsWith('Pack') ? { modo: 'margen', valor: '' } : {})
  });

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      nombre: form.nombre,
      proveedorId: form.proveedor?.id,
      rubroId: form.rubroId,
      marcaId: form.marcaId,
      alicuotaId: form.alicuotaId,
      compraPack: form.compraPack,
      unidadesPack: form.unidadesPack,
      ventaMinima: form.ventaMinima,
      costo: form.costo,
      modoPrecio: form.modo,
      valorPrecio: form.valor,
      pmr: form.pmr,
      estado: form.estado,
      enviado: form.enviado,
      ocultarApp: form.ocultarApp,
      sinStockApp: form.sinStockApp
    });
  };

  const readOnly = { readOnly: true, tabIndex: -1 };

  return (
    <form onSubmit={submit} className="card form-panel client-module-form client-entry-panel p-4 mb-3">
      <FormHeading
        eyebrow="CATÁLOGO DE PRODUCTOS"
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        description={`Completá los datos para ${editing ? 'actualizar el producto' : 'agregar un producto al catálogo'}.`}
      />
      {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
      <div className="client-entry-form">
        <fieldset className="border rounded" style={fullRow}>
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Proveedor</legend>
          <div className="mb-3">
            <label className="form-label">Proveedor <span className="text-danger">*</span></label>
            <ProviderSearch value={form.proveedor} onSelect={proveedor => set(
              String(proveedor?.id ?? '') === String(form.proveedor?.id ?? '') ? { proveedor } : { proveedor, rubroId: '', marcaId: '' }
            )} />
          </div>
        </fieldset>

        <fieldset className="border rounded" style={fullRow}>
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Información del producto</legend>
          {editing && form.id && (
            <div className="mb-3">
              <label className="form-label" htmlFor="prod-id">Código</label>
              <input id="prod-id" className="form-control" value={form.id} readOnly tabIndex={-1} />
            </div>
          )}
          <div className="row">
            <div>
              <div className="mb-3">
                <label className="form-label" htmlFor="prod-rubro">Rubro <span className="text-danger">*</span></label>
                <select id="prod-rubro" className="form-select" required disabled={!form.proveedor} value={form.rubroId} onChange={e => changeRubro(e.target.value)}>
                  <option value="">{form.proveedor ? (rubrosProveedor.length ? 'Seleccioná un rubro' : 'El proveedor no tiene rubros') : 'Elegí primero un proveedor'}</option>
                  {rubrosProveedor.map(rubro => <option key={rubro.id_rubro} value={rubro.id_rubro}>{rubro.descripcion}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div className="mb-3">
                <label className="form-label" htmlFor="prod-marca">Marca <span className="text-danger">*</span></label>
                <select id="prod-marca" className="form-select" required disabled={!form.rubroId} value={form.marcaId} onChange={e => set({ marcaId: e.target.value })}>
                  <option value="">{form.rubroId ? 'Seleccioná una marca' : 'Elegí primero un rubro'}</option>
                  {marcas.map(marca => <option key={marca.id_marca} value={marca.id_marca}>{marca.descripcion}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="prod-nombre">Nombre del producto <span className="text-danger">*</span></label>
            <input id="prod-nombre" className="form-control text-uppercase" required maxLength={999} value={form.nombre} onChange={e => set({ nombre: e.target.value })} />
          </div>
        </fieldset>

        <fieldset className="border rounded">
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Unidades de compra</legend>
          <div className="form-check mb-2">
            <input id="compra-unidad" type="radio" className="form-check-input" checked={!form.compraPack} onChange={() => changeCompra(false)} />
            <label className="form-check-label" htmlFor="compra-unidad">Compra por unidad</label>
          </div>
          <div className="form-check mb-2">
            <input id="compra-pack" type="radio" className="form-check-input" checked={form.compraPack} onChange={() => changeCompra(true)} />
            <label className="form-check-label" htmlFor="compra-pack">Compra por pack</label>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="prod-unipack">Unidades por pack</label>
            <input id="prod-unipack" className="form-control" type="number" min="2" step="1" disabled={!form.compraPack} required={form.compraPack} value={form.unidadesPack} onChange={e => set({ unidadesPack: e.target.value })} />
          </div>
        </fieldset>

        <fieldset className="border rounded">
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Unidad mínima de venta</legend>
          {[['unidad', 'Venta por unidad', false], ['pack', 'Venta por pack', true], ['medio', 'Venta 1/2 pack', true]].map(([value, label, needsPack]) => (
            <div className="form-check mb-2" key={value}>
              <input id={`venta-${value}`} type="radio" className="form-check-input" disabled={needsPack && !form.compraPack} checked={form.ventaMinima === value} onChange={() => set({ ventaMinima: value })} />
              <label className="form-check-label" htmlFor={`venta-${value}`}>{label}</label>
            </div>
          ))}
        </fieldset>

        <fieldset className="border rounded" style={fullRow}>
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Costos</legend>
          <div className="row">
            <div>
              <div className="mb-3">
                <label className="form-label" htmlFor="prod-costo">Costo{form.compraPack ? ' (pack)' : ''} <span className="text-danger">*</span></label>
                <input id="prod-costo" className="form-control" inputMode="decimal" required value={form.costo} onChange={e => set({ costo: e.target.value })} />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <label className="form-label" htmlFor="prod-costo-unit">Costo unit.</label>
                <input id="prod-costo-unit" className="form-control" {...readOnly} value={derived.costoUnit} />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <label className="form-label" htmlFor="prod-iva">Alic. IVA <span className="text-danger">*</span></label>
                <select id="prod-iva" className="form-select" required value={form.alicuotaId} onChange={e => set({ alicuotaId: e.target.value })}>
                  <option value="">Seleccioná</option>
                  {alicuotas.map(item => <option key={item.id} value={item.id}>{percentLabel(item.alicuota)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="border rounded" style={fullRow}>
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Precio de venta</legend>
          <div className="row">
            {[
              ['margen', 'Margen (%)', false],
              ['neto', 'Precio neto', false],
              ['final', 'Precio final', false],
              ['netoPack', 'Pr. neto (pack)', true],
              ['finalPack', 'Pr. final (pack)', true]
            ].map(([field, label, needsPack]) => (
              <div key={field}>
                <div className="mb-3">
                  <label className="form-label" htmlFor={`prod-${field}`}>{label}{field === 'margen' || field === 'final' ? ' *' : ''}</label>
                  <input id={`prod-${field}`} className="form-control" inputMode="decimal" disabled={needsPack && !form.compraPack} value={priceValue(field)} onChange={setPrice(field)} />
                </div>
              </div>
            ))}
            <div>
              <div className="mb-3">
                <label className="form-label" htmlFor="prod-pmr">Stock mínimo</label>
                <input id="prod-pmr" className="form-control" type="number" min="0" step="1" value={form.pmr} onChange={e => set({ pmr: e.target.value })} />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="border rounded" style={fullRow}>
          <legend className="float-none w-auto px-2 fs-6 fw-semibold mb-0">Otros datos</legend>
          <div className="row">
            <div className="mb-3">
              <label className="form-label" htmlFor="prod-estado">Estado <span className="text-danger">*</span></label>
              <select id="prod-estado" className="form-select" required value={form.estado} onChange={e => set({ estado: e.target.value })}>
                <option value="">Seleccionar...</option>
                {form.estado && !['Activo', 'Inactivo'].includes(form.estado) && (
                  <option value={form.estado} disabled>Valor actual no disponible: {form.estado}</option>
                )}
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-4 mb-3">
            {[['enviado', 'Enviado'], ['ocultarApp', 'Ocultar en APP'], ['sinStockApp', 'Mostrar SIN STOCK en APP']].map(([field, label]) => (
              <div className="form-check" key={field}>
                <input id={`prod-${field}`} type="checkbox" className="form-check-input" checked={form[field]} onChange={e => set({ [field]: e.target.checked })} />
                <label className="form-check-label" htmlFor={`prod-${field}`}>{label}</label>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="d-flex gap-2 client-entry-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || !form.proveedor}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Guardar producto'}</button>
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </form>
  );
}
