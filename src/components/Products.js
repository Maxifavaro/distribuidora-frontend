import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Products() {
  const { products, providers, fetchProducts, fetchProviders, createProduct, updateProduct, deleteProduct, loading, permission } = useStore();
  const [form, setForm] = useState({ name: '', sku: '', price: '', stock: '', provider_id: '' });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchProducts(); fetchProviders(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({ name: product.name || '', sku: product.sku || '', price: product.price || '', stock: product.stock || '', provider_id: product.provider_id ? String(product.provider_id) : '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', sku: '', price: '', stock: '', provider_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10), provider_id: form.provider_id ? parseInt(form.provider_id, 10) : null };
      if (editingId) {
        const data = await updateProduct(editingId, payload);
        Swal.fire('Actualizado', `${data.name} actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createProduct(payload);
        setForm({ name: '', sku: '', price: '', stock: '', provider_id: '' });
        Swal.fire('Creado', `${data.name} creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed', 'error');
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

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || String(p.id) === search || p.sku?.toLowerCase().includes(search.toLowerCase()));

  const findProviderName = (id) => providers.find(p => p.id === id)?.name || '';
  const findProviderInfo = (id) => {
    const provider = providers.find(p => p.id === id);
    return provider ? `${provider.name} - ${provider.contact || 'N/A'}` : '';
  };

  return (
    <div>
      <h4>Productos</h4>

      <div className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Buscar por ID, nombre o SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <input required name="name" value={form.name} onChange={handleChange} placeholder="Name" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="form-control" />
        </div>
        <div className="mb-2">
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="form-control" type="number" step="0.01" />
        </div>
        <div className="mb-2">
          <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" className="form-control" type="number" />
        </div>
        <div className="mb-2">
          <select name="provider_id" value={form.provider_id} onChange={handleChange} className="form-select">
            <option value="">Select Provider</option>
            {providers.map(p => <option key={p.id} value={p.id}>{p.name} - {p.contact || 'N/A'}</option>)}
          </select>
        </div>
        <div className="mb-2">
          {permission === 'admin' && <button className="btn btn-primary me-2" disabled={loading} type="submit">{editingId ? 'Update' : 'Create'}</button>}
          {editingId && <button className="btn btn-secondary" type="button" onClick={cancelEdit}>Cancel</button>}
        </div>
      </form>

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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>{prod.name}</td>
                <td>{prod.sku}</td>
                <td>{prod.price}</td>
                <td>{prod.stock}</td>
                <td>{findProviderInfo(prod.provider_id)}</td>
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
