import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import useStore from '../../store';
import api from '../../store/api';
import ModuleSummary from '../shared/ModuleSummary';
import ColumnSelector from '../ColumnSelector';
import PaginationFooter from '../shared/PaginationFooter';
import ProductForm from './ProductForm';

const COLUMNS_KEY = 'dynamicGrid.columns.Productos';
const PAGE_SIZES = [10, 30, 100];
const money = (value) => (value === null || value === undefined ? '' : Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const COLUMNS = [
  { name: 'id', label: 'Código' },
  { name: 'name', label: 'Producto' },
  { name: 'provider_name', label: 'Proveedor' },
  { name: 'rubro_name', label: 'Rubro' },
  { name: 'marca_name', label: 'Marca' },
  { name: 'alicuota_desc', label: 'Alícuota IVA', render: p => (p.alicuota_desc == null ? '' : `${Number((p.alicuota_desc * 100).toFixed(2))} %`), end: true },
  { name: 'Costo', label: 'Costo', render: p => money(p.Costo), end: true },
  { name: 'CostoUnit', label: 'Costo unit.', render: p => money(p.CostoUnit), end: true },
  { name: 'margen', label: 'Margen (%)', render: p => money(p.margen), end: true },
  { name: 'PrecioNetoUni', label: 'Precio neto', render: p => money(p.PrecioNetoUni), end: true },
  { name: 'price', label: 'Precio final', render: p => money(p.price), end: true },
  { name: 'PrecioFinalPack', label: 'Precio final pack', render: p => money(p.PrecioFinalPack), end: true },
  { name: 'Pr_Pack', label: 'Compra por pack', render: p => (p.Pr_Pack === 'Si' ? 'Sí' : 'No') },
  { name: 'Pr_UniXPack', label: 'Unidades por pack', end: true },
  { name: 'PMR', label: 'Stock mínimo', end: true },
  { name: 'Estado', label: 'Estado' }
];
const DEFAULT_COLUMNS = ['id', 'name', 'provider_name', 'rubro_name', 'marca_name', 'CostoUnit', 'price'];
const COLUMN_STRUCTURE = { columns: COLUMNS.map(({ name }) => ({ name })) };
const COLUMN_LABELS = Object.fromEntries(COLUMNS.map(({ name, label }) => [name.toLowerCase(), label]));

function loadColumns() {
  try {
    const saved = JSON.parse(localStorage.getItem(COLUMNS_KEY));
    const valid = Array.isArray(saved) ? saved.filter(name => COLUMNS.some(col => col.name === name)) : [];
    return valid.length ? valid : DEFAULT_COLUMNS;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

const EMPTY_FORM = {
  id: null, proveedor: null, rubroId: '', marcaId: '', nombre: '', compraPack: false, unidadesPack: '',
  ventaMinima: 'unidad', costo: '', alicuotaId: '', modo: 'margen', valor: '', pmr: '0',
  estado: 'Activo', enviado: false, ocultarApp: false, sinStockApp: false
};

const errorMessage = (err) => err.response?.data?.message || err.response?.data?.error || err.message;

function formFromRecord(record) {
  const compraPack = record.Pr_Pack === 'Si';
  const uniXPack = Number(record.Pr_UniXPack);
  const minSale = Number(record.Pr_UnidMinVenta);
  const estado = typeof record.Estado === 'string' ? record.Estado.trim() : '';
  const normalizedState = { activo: 'Activo', inactivo: 'Inactivo' }[estado.toLowerCase()] ?? estado;
  return {
    id: record.ID_Producto,
    proveedor: record.ID_Proveedor ? { id: record.ID_Proveedor, nombre: record.provider_name || '' } : null,
    rubroId: String(record.ID_Rubro ?? ''),
    marcaId: String(record.idMarca ?? ''),
    nombre: (record.Descripcion || '').trim(),
    compraPack,
    unidadesPack: compraPack ? String(uniXPack) : '',
    ventaMinima: !compraPack ? 'unidad' : minSale === 0.5 ? 'medio' : minSale === uniXPack ? 'pack' : 'unidad',
    costo: String(Number(Number(record.Costo).toFixed(3))),
    alicuotaId: String(record.IdAlicIva ?? ''),
    modo: 'final',
    valor: String(Number(Number(record.PrecioFinalUni).toFixed(3))),
    pmr: String(record.PMR ?? 0),
    estado: normalizedState,
    enviado: Number(record.Enviado) === 1,
    ocultarApp: !!record.OcultarApp,
    sinStockApp: !!record.SinStockApp
  };
}

export default function Products() {
  const { permission } = useStore();
  const isAdmin = permission === 'admin';
  const [products, setProducts] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [alicuotas, setAlicuotas] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [columns, setColumns] = useState(loadColumns);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const [productsRes, rubrosRes, alicuotasRes] = await Promise.all([api.get('/products'), api.get('/rubros'), api.get('/catalogs/alicuotas-iva')]);
      setProducts(productsRes.data);
      setRubros(rubrosRes.data);
      setAlicuotas(alicuotasRes.data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);
  useEffect(() => { setPage(0); }, [search, pageSize]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    if (!term) return products;
    return products.filter(p => `${p.id} ${p.name} ${p.provider_name} ${p.rubro_name} ${p.marca_name}`.toLocaleLowerCase().includes(term));
  }, [products, search]);
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const shownColumns = COLUMNS.filter(col => columns.includes(col.name));
  const changeColumns = (next) => {
    setColumns(next);
    localStorage.setItem(COLUMNS_KEY, JSON.stringify(next));
  };

  const startCreate = () => {
    setFormError('');
    setForm({ ...EMPTY_FORM, alicuotaId: alicuotas.length === 1 ? String(alicuotas[0].id) : '' });
  };
  const startEdit = async (product) => {
    try {
      const { data } = await api.get(`/products/${product.id}`);
      setFormError('');
      setForm(formFromRecord(data));
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const save = async (payload) => {
    setSaving(true);
    setFormError('');
    try {
      if (form.id) await api.put(`/products/${form.id}`, payload);
      else await api.post('/products', payload);
      setForm(null);
      await refresh();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará el producto ${product.name}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/products/${product.id}`);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (form) {
    return (
      <ProductForm
        form={form}
        onChange={setForm}
        editing={!!form.id}
        rubros={rubros}
        alicuotas={alicuotas}
        saving={saving}
        error={formError}
        onSubmit={save}
        onCancel={() => setForm(null)}
      />
    );
  }

  return (
    <div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && !error && <ModuleSummary moduleKey="products" count={products.length} />}
      <div className="dynamic-module-toolbar client-module-toolbar mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex gap-2 align-items-center client-module-search-group">
          <input className="form-control" placeholder="Buscar por nombre, proveedor, rubro o marca" aria-label="Buscar producto" value={search} onChange={e => setSearch(e.target.value)} />
          {isAdmin && (
            <button className="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0" onClick={startCreate} title="Crear producto">
              <span aria-hidden="true">+</span><span>Nuevo producto</span>
            </button>
          )}
        </div>
        <div className="d-flex gap-2 align-items-center client-module-options">
          <ColumnSelector tableStructure={COLUMN_STRUCTURE} selectedColumns={columns} onChange={changeColumns} fieldLabels={COLUMN_LABELS} />
          <label className="small text-muted mb-0" htmlFor="products-page-size">Mostrar:</label>
          <select id="products-page-size" className="form-select form-select-sm" style={{ width: 'auto' }} value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
            {PAGE_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
      </div>
      {loading ? <p>Cargando productos...</p> : filtered.length === 0 ? <div className="alert alert-info">No hay productos para mostrar.</div> : (
        <>
          <div className="table-responsive">
            <table className="table table-striped table-hover abm-grid-table">
              <thead><tr>{isAdmin && <th>Acciones</th>}{shownColumns.map(col => <th key={col.name} className={col.end ? 'text-end' : undefined}>{col.label}</th>)}</tr></thead>
              <tbody>{visible.map(product => (
                <tr key={product.id}>
                  {isAdmin && (
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button className="btn btn-outline-primary" title="Editar" aria-label="Editar" onClick={() => startEdit(product)}>✏️</button>
                        <button className="btn btn-outline-danger" title="Eliminar" aria-label="Eliminar" onClick={() => remove(product)}>🗑️</button>
                      </div>
                    </td>
                  )}
                  {shownColumns.map(col => <td key={col.name} className={col.end ? 'text-end' : undefined}>{col.render ? col.render(product) : product[col.name]}</td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
          <PaginationFooter page={page + 1} pageSize={pageSize} total={filtered.length} filteredFrom={search.trim() ? products.length : null} onPageChange={p => setPage(p - 1)} />
        </>
      )}
    </div>
  );
}
