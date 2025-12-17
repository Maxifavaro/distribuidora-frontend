import React, { useEffect, useState, useMemo } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Products() {
  const store = useStore();
  const { products = [], providers = [], rubros = [], marcas = [], fetchProducts, fetchProviders, fetchRubros, fetchMarcas, createProduct, updateProduct, deleteProduct, loading, permission } = store;
  const [form, setForm] = useState({ 
    name: '', 
    sku: '', 
    price: '', 
    stock: '', 
    provider_id: '', 
    rubro_id: '',
    marca_id: '',
    alicuota_id: '',
    costo: '0',
    costoUnit: '0',
    margen: '0',
    precioFinalPack: '0',
    precioNetoPack: '0',
    precioNetoUni: '0',
    montoIVA: '0',
    pmr: '1',
    pack: 'UN',
    uniXPack: '1',
    estado: 'Activo',
    permite_descuento: true
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loadingMarcas, setLoadingMarcas] = useState(false);

  useEffect(() => { 
    if (fetchProducts) fetchProducts(); 
    if (fetchProviders) fetchProviders();
    if (fetchRubros) fetchRubros();
    if (fetchMarcas) fetchMarcas();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRubroChange = async (e) => {
    const newRubroId = e.target.value;
    setForm({ ...form, rubro_id: newRubroId, marca_id: '' }); // Resetear marca
    
    if (!newRubroId) {
      // Si no hay rubro seleccionado, cargar todas las marcas
      if (fetchMarcas) fetchMarcas();
      return;
    }
    
    setLoadingMarcas(true);
    try {
      await fetchMarcas(parseInt(newRubroId, 10)); // Cargar marcas del rubro
    } catch (err) {
      console.error('Error loading marcas:', err);
    } finally {
      setLoadingMarcas(false);
    }
  };

  const startEdit = async (product) => {
    setEditingId(product.id);
    setShowForm(true);
    
    const rubroId = product.rubro_id ? String(product.rubro_id) : '';
    
    // Cargar marcas del rubro del producto
    if (rubroId && fetchMarcas) {
      setLoadingMarcas(true);
      try {
        await fetchMarcas(parseInt(rubroId, 10));
      } catch (err) {
        console.error('Error loading marcas for edit:', err);
      } finally {
        setLoadingMarcas(false);
      }
    } else if (fetchMarcas) {
      setLoadingMarcas(true);
      try {
        await fetchMarcas(); // Cargar todas las marcas
      } catch (err) {
        console.error('Error loading all marcas:', err);
      } finally {
        setLoadingMarcas(false);
      }
    }
    
    setForm({ 
      name: product.name || '', 
      sku: product.sku || '', 
      price: product.price || '', 
      stock: product.stock || '', 
      provider_id: product.provider_id ? String(product.provider_id) : '',
      rubro_id: rubroId || '',
      marca_id: product.marca_id ? String(product.marca_id) : '',
      alicuota_id: product.alicuota_id ? String(product.alicuota_id) : '',
      costo: product.Costo !== undefined ? String(product.Costo) : '0',
      costoUnit: product.CostoUnit !== undefined ? String(product.CostoUnit) : '0',
      margen: product.margen !== undefined ? String(product.margen) : '0',
      precioFinalPack: product.PrecioFinalPack !== undefined ? String(product.PrecioFinalPack) : '0',
      precioNetoPack: product.PrecioNetoPack !== undefined ? String(product.PrecioNetoPack) : '0',
      precioNetoUni: product.PrecioNetoUni !== undefined ? String(product.PrecioNetoUni) : '0',
      montoIVA: product.MontoIVA !== undefined ? String(product.MontoIVA) : '0',
      pmr: product.PMR !== undefined ? String(product.PMR) : '1',
      pack: product.Pr_Pack || 'UN',
      uniXPack: product.Pr_UniXPack !== undefined ? String(product.Pr_UniXPack) : '1',
      estado: product.Estado || 'Activo',
      permite_descuento: product.permite_descuento !== undefined ? product.permite_descuento : true
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '', marca_id: '', alicuota_id: '', costo: '0', costoUnit: '0', margen: '0', precioFinalPack: '0', precioNetoPack: '0', precioNetoUni: '0', montoIVA: '0', pmr: '1', pack: 'UN', uniXPack: '1', estado: 'Activo', permite_descuento: true });
    setShowForm(false);
    // Recargar todas las marcas al cancelar
    if (fetchMarcas) fetchMarcas();
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
        rubro_id: form.rubro_id ? parseInt(form.rubro_id, 10) : null,
        marca_id: form.marca_id ? parseInt(form.marca_id, 10) : null,
        alicuota_id: form.alicuota_id ? parseInt(form.alicuota_id, 10) : null,
        costo: parseFloat(form.costo) || 0,
        costoUnit: parseFloat(form.costoUnit) || 0,
        margen: parseFloat(form.margen) || 0,
        precioFinalPack: parseFloat(form.precioFinalPack) || 0,
        precioNetoPack: parseFloat(form.precioNetoPack) || 0,
        precioNetoUni: parseFloat(form.precioNetoUni) || 0,
        montoIVA: parseFloat(form.montoIVA) || 0,
        pmr: parseInt(form.pmr, 10) || 1,
        pack: form.pack || 'UN',
        uniXPack: parseInt(form.uniXPack, 10) || 1,
        estado: form.estado || 'Activo',
        permite_descuento: form.permite_descuento
      };
      
      if (editingId) {
        const data = await updateProduct(editingId, payload);
        Swal.fire('Actualizado', `${data.name} actualizado`, 'success');
        cancelEdit();
      } else {
        const data = await createProduct(payload);
        setForm({ name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '', marca_id: '', alicuota_id: '', costo: '0', costoUnit: '0', margen: '0', precioFinalPack: '0', precioNetoPack: '0', precioNetoUni: '0', montoIVA: '0', pmr: '1', pack: 'UN', uniXPack: '1', estado: 'Activo', permite_descuento: true });
        // Recargar todas las marcas después de crear
        if (fetchMarcas) fetchMarcas();
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

      <div className="mb-3">
        <input className="form-control" placeholder="Buscar por ID, nombre o SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      
      {permission === 'admin' && !editingId && (
        <div className="mb-3 d-flex align-items-center">
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="toggleForm" 
              checked={showForm} 
              onChange={(e) => setShowForm(e.target.checked)}
              style={{ width: '48px', height: '24px', cursor: 'pointer' }}
            />
            <label className="form-check-label ms-2" htmlFor="toggleForm" style={{ cursor: 'pointer', fontWeight: '500' }}>
              Nuevo producto
            </label>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{editingId ? 'Modificar Producto' : 'Nuevo Producto'}</h5>
            <form onSubmit={handleSubmit}>
              {/* Fila 1: Datos básicos */}
              <div className="row">
                <div className="col-md-4 mb-2">
                  <label className="form-label">Nombre *</label>
                  <input required name="name" value={form.name} onChange={handleChange} placeholder="Nombre" className="form-control" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">SKU</label>
                  <input name="sku" value={form.sku} onChange={handleChange} placeholder="SKU" className="form-control" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">Stock</label>
                  <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" className="form-control" type="number" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">Pack</label>
                  <input name="pack" value={form.pack} onChange={handleChange} placeholder="UN" className="form-control" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">Uni x Pack</label>
                  <input name="uniXPack" value={form.uniXPack} onChange={handleChange} placeholder="1" className="form-control" type="number" />
                </div>
              </div>
              
              {/* Fila 2: Precios */}
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className="form-label">Precio Final Uni *</label>
                  <input required name="price" value={form.price} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Precio Final Pack</label>
                  <input name="precioFinalPack" value={form.precioFinalPack} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Precio Neto Pack</label>
                  <input name="precioNetoPack" value={form.precioNetoPack} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Precio Neto Uni</label>
                  <input name="precioNetoUni" value={form.precioNetoUni} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
              </div>

              {/* Fila 3: Costos */}
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className="form-label">Costo</label>
                  <input name="costo" value={form.costo} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Costo Unit</label>
                  <input name="costoUnit" value={form.costoUnit} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">Margen (%)</label>
                  <input name="margen" value={form.margen} onChange={handleChange} placeholder="0" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">Monto IVA</label>
                  <input name="montoIVA" value={form.montoIVA} onChange={handleChange} placeholder="0.00" className="form-control" type="number" step="0.01" />
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">PMR</label>
                  <input name="pmr" value={form.pmr} onChange={handleChange} placeholder="1" className="form-control" type="number" />
                </div>
              </div>
              
              {/* Fila 4: Relaciones */}
              <div className="row">
                <div className="col-md-4 mb-2">
                  <label className="form-label">Proveedor *</label>
                  <select name="provider_id" value={form.provider_id} onChange={handleChange} className="form-select" required>
                    <option value="">Seleccionar Proveedor</option>
                    {Array.isArray(providers) && providers.map(p => <option key={p.id} value={p.id}>{p.razon_social || p.name}</option>)}
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Rubro *</label>
                  <select name="rubro_id" value={form.rubro_id} onChange={handleRubroChange} className="form-select" required>
                    <option value="">Seleccionar Rubro</option>
                    {Array.isArray(rubros) && rubros.map(r => <option key={r.id_rubro} value={r.id_rubro}>{r.descripcion}</option>)}
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label">Marca</label>
                  <select name="marca_id" value={form.marca_id} onChange={handleChange} className="form-select" disabled={loadingMarcas}>
                    <option value="">{loadingMarcas ? 'Cargando...' : 'Sin marca'}</option>
                    {Array.isArray(marcas) && marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.descripcion}</option>)}
                  </select>
                </div>
                <div className="col-md-2 mb-2">
                  <label className="form-label">Alicuota IVA</label>
                  <select name="alicuota_id" value={form.alicuota_id} onChange={handleChange} className="form-select">
                    <option value="">Sin alicuota</option>
                    <option value="1">21%</option>
                    <option value="2">10.5%</option>
                    <option value="3">27%</option>
                  </select>
                </div>
              </div>

              {/* Fila 5: Estado y descuento */}
              <div className="row">
                <div className="col-md-3 mb-2">
                  <label className="form-label">Estado</label>
                  <select name="estado" value={form.estado} onChange={handleChange} className="form-select">
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="col-md-3 mb-2">
                  <label className="form-label d-block">¿Permite descuentos?</label>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="permite_descuento" 
                      id="descuento_si" 
                      checked={form.permite_descuento === true}
                      onChange={() => setForm({...form, permite_descuento: true})}
                    />
                    <label className="form-check-label" htmlFor="descuento_si">Sí</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="permite_descuento" 
                      id="descuento_no" 
                      checked={form.permite_descuento === false}
                      onChange={() => setForm({...form, permite_descuento: false})}
                    />
                    <label className="form-check-label" htmlFor="descuento_no">No</label>
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-2 mt-3">
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
