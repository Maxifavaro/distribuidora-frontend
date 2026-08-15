import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import Swal from 'sweetalert2';
import { SearchBar } from '../../componentsUI';
import ProductForm from './ProductForm';
import ProductGrid from './ProductGrid';

export default function Products() {
  const store = useStore();
  const { products = [], providers = [], rubros = [], marcas = [], fetchProducts, fetchProviders, fetchRubros, fetchMarcas, createProduct, updateProduct, deleteProduct, loading, permission } = store;
  
  const [form, setForm] = useState({ 
    name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '',
    marca_id: '', alicuota_id: '', costo: '0', costoUnit: '0', margen: '0',
    precioFinalPack: '0', precioNetoPack: '0', precioNetoUni: '0', montoIVA: '0',
    pmr: '1', pack: 'UN', uniXPack: '1', estado: 'Activo', permite_descuento: true
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRubroChange = async (e) => {
    const newRubroId = e.target.value;
    setForm({ ...form, rubro_id: newRubroId, marca_id: '' });
    
    if (!newRubroId) {
      if (fetchMarcas) fetchMarcas();
      return;
    }
    
    setLoadingMarcas(true);
    try {
      await fetchMarcas(parseInt(newRubroId, 10));
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
        await fetchMarcas();
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
    setForm({ 
      name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '',
      marca_id: '', alicuota_id: '', costo: '0', costoUnit: '0', margen: '0',
      precioFinalPack: '0', precioNetoPack: '0', precioNetoUni: '0', montoIVA: '0',
      pmr: '1', pack: 'UN', uniXPack: '1', estado: 'Activo', permite_descuento: true
    });
    setShowForm(false);
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
        await updateProduct(editingId, payload);
        Swal.fire('Actualizado', `Producto actualizado`, 'success');
        cancelEdit();
      } else {
        await createProduct(payload);
        setForm({ 
          name: '', sku: '', price: '', stock: '', provider_id: '', rubro_id: '',
          marca_id: '', alicuota_id: '', costo: '0', costoUnit: '0', margen: '0',
          precioFinalPack: '0', precioNetoPack: '0', precioNetoUni: '0', montoIVA: '0',
          pmr: '1', pack: 'UN', uniXPack: '1', estado: 'Activo', permite_descuento: true
        });
        if (fetchMarcas) fetchMarcas();
        Swal.fire('Creado', `Producto creado`, 'success');
      }
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message || 'Error al guardar', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await Swal.fire({ 
      title: `Eliminar ${name}?`, 
      showCancelButton: true, 
      confirmButtonText: 'Eliminar', 
      icon: 'warning' 
    });
    if (confirmed.isConfirmed) {
      try {
        await deleteProduct(id);
        Swal.fire('Eliminado', `${name} eliminado`, 'success');
      } catch (err) {
        Swal.fire('Error', err.message || 'Failed to delete', 'error');
      }
    }
  };

  const filtered = Array.isArray(products) ? products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    String(p.id) === search || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const toggleFormSwitch = (
    permission === 'admin' && !editingId && (
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
    )
  );

  return (
    <div>
      <h4>Productos</h4>

      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por ID, nombre o SKU"
      />

      {toggleFormSwitch}

      {showForm && (
        <ProductForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
          onRubroChange={handleRubroChange}
          isEditing={!!editingId}
          loading={loading}
          loadingMarcas={loadingMarcas}
          providers={providers}
          rubros={rubros}
          marcas={marcas}
        />
      )}

      <hr />

      <ProductGrid
        products={filtered}
        onEdit={startEdit}
        onDelete={handleDelete}
        permission={permission}
      />
    </div>
  );
}
