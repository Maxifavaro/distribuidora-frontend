import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Products() {
  const store = useStore();
  const { products = [], providers = [], rubros = [], fetchProducts, fetchProviders, fetchRubros, createProduct, updateProduct, deleteProduct, loading, permission } = store;
  const [form, setForm] = useState({ 
    name: '', 
    sku: '', 
    price: '', 
    stock: '', 
    provider_id: '', 
    rubro_id: '1',
    costo: '0',
    margen: '0'
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { 
    if (fetchProducts) fetchProducts(); 
    if (fetchProviders) fetchProviders();
    if (fetchRubros) fetchRubros();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({ 
      name: product.name || '', 
      sku: product.sku || '', 
      price: product.price || '', 
      stock: product.stock || '', 
      provider_id: product.provider_id ? String(product.provider_id) : '',
      rubro_id: product.rubro_id ? String(product.rubro_id) : '1',
      costo: product.Costo || '0',
      margen: product.margen || '0'
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '1', costo: '0', margen: '0' });
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        name: form.name,
        sku: form.sku || null,
        price: parseFloat(form.price) || 0, 
        stock: parseInt(form.stock, 10) || 0, 
        provider_id: form.provider_id ? parseInt(form.provider_id, 10) : null,
        rubro_id: parseInt(form.rubro_id, 10) || 1,
        costo: parseFloat(form.costo) || 0,
        costoUnit: parseFloat(form.costo) || 0,
        margen: parseFloat(form.margen) || 0,
        precioFinalPack: parseFloat(form.price) || 0,
        precioNetoPack: parseFloat(form.price) || 0,
        precioNetoUni: parseFloat(form.price) || 0,
        montoIVA: (parseFloat(form.price) || 0) * 0.21,
        pmr: 1,
        pack: 'UN',
        uniXPack: 1,
        estado: 'Activo'
      };
      
      if (editingId) {
        const data = await updateProduct(editingId, payload);
        Swal.fire('Actualizado', `${data.name} actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createProduct(payload);
        setForm({ name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '1', costo: '0', margen: '0' });
        Swal.fire('Creado', `Producto creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await Swal.fire({ title: `Eliminar ${name}?`, showCancelButton: true, confirmButtonText: 'Eliminar', icon: 'warning' });
    if (confirmed.isConfirmed) {
      try {
        await deleteProduct(id);
        Swal.fire('Eliminado', `${name} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = Array.isArray(products) ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || String(p.id) === search || p.sku?.toLowerCase().includes(search.toLowerCase())) : [];

  const findProviderName = (id) => Array.isArray(providers) ? providers.find(p => p.id === id)?.name || '' : '';
  const findProviderInfo = (id) => {
    if (!Array.isArray(providers)) return '';
    const provider = providers.find(p => p.id === id);
    return provider ? `${provider.name} - ${provider.contact || 'N/A'}` : '';
  };

  return (
    <div>
      <h4>Productos</h4>

      <div className="mb-3 d-flex align-items-center">
        <input className="form-control me-2" placeholder="Buscar por ID, nombre o SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
        {permission === 'admin' && !editingId && (
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="toggleForm" 
              checked={showForm} 
              onChange={(e) => setShowForm(e.target.checked)}
              style={{ width: '48px', height: '24px', cursor: 'pointer' }}
            />
          </div>
        )}
      </div>

      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{editingId ? 'Modificar Producto' : 'Nuevo Producto'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input required name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">SKU</label>
                <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label">Precio</label>
                <input name="price" value={form.price} onChange={handleChange} placeholder="Precio" className="form-control" type="number" step="0.01" />
              </div>
              <div className="mb-3">
                <label className="form-label">Stock</label>
                <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" className="form-control" type="number" />
              </div>
              <div className="mb-3">
                <label className="form-label">Proveedor</label>
                <select name="provider_id" value={form.provider_id} onChange={handleChange} className="form-select" required>
                  <option value="">Seleccionar Proveedor</option>
                  {Array.isArray(providers) && providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Rubro</label>
                <select name="rubro_id" value={form.rubro_id} onChange={handleChange} className="form-select">
                  <option value="1">General</option>
                  {Array.isArray(rubros) && rubros.map(r => <option key={r.id_rubro} value={r.id_rubro}>{r.descripcion}</option>)}
                </select>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Costo</label>
                  <input name="costo" value={form.costo} onChange={handleChange} placeholder="Costo" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Margen (%)</label>
                  <input name="margen" value={form.margen} onChange={handleChange} placeholder="Margen" className="form-control" type="number" step="0.01" />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" disabled={loading} type="submit">Confirmar</button>
                <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <hr />
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>SKU</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Proveedor</th>
              <th>Rubro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>{prod.name}</td>
                <td>{prod.sku || 'N/A'}</td>
                <td>${prod.price ? parseFloat(prod.price).toFixed(2) : '0.00'}</td>
                <td>{prod.stock || 0}</td>
                <td>{prod.provider_name || 'N/A'}</td>
                <td>{prod.rubro_name || 'N/A'}</td>
                <td>
                  <span className={`badge ${prod.Estado === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                    {prod.Estado || 'Activo'}
                  </span>
                </td>
                <td>
                  {permission === 'admin' && <button className="btn btn-sm btn-info me-2" onClick={() => startEdit(prod)}>Edit</button>}
                  {permission === 'admin' && <button className="btn btn-sm btn-danger" onClick={() => handleDelete(prod.id, prod.name)}>Delete</button>}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7">No results</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
