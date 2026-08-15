import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';
import { usePDFGenerator } from './Orders/usePDFGenerator';
import ClientSelector from './Orders/ClientSelector';

// Agregar estilos para hover
const styles = `
  .hover-bg-light:hover {
    background-color: #f8f9fa !important;
  }
`;

export default function Orders() {
  const store = useStore();
  const { orders = [], fetchOrders, createOrder, fetchOrderDetails, products = [], clients = [], repartidores = [], rubros = [], marcas = [], fetchProducts, fetchClients, fetchRepartidores, fetchRubros, fetchMarcas, loading, permission } = store;
  const { generatePDFBlob, downloadPDF } = usePDFGenerator();

  const [selected, setSelected] = useState(''); // client_id
  const [selectedClient, setSelectedClient] = useState(null); // objeto completo del cliente
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showClientSelector, setShowClientSelector] = useState(false); // mostrar panel de selección
  const [deliveryType, setDeliveryType] = useState('deposito');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [repartidorId, setRepartidorId] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  
  // Filtros de productos
  const [productNameFilter, setProductNameFilter] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productMarcaFilter, setProductMarcaFilter] = useState('');
  const [showProductGrid, setShowProductGrid] = useState(false);
  const [showPastOrders, setShowPastOrders] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // Obtener fecha del día siguiente por defecto
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (fetchOrders) fetchOrders();
    if (fetchProducts) fetchProducts();
    if (fetchClients) fetchClients();
    if (fetchRepartidores) fetchRepartidores();
    if (fetchRubros) fetchRubros();
    if (fetchMarcas) fetchMarcas();
    // Establecer fecha de entrega por defecto (mañana)
    setDeliveryDate(getTomorrowDate());
  }, []);

  // Cargar datos del pedido cuando estoy editando
  useEffect(() => {
    if (editingOrder) {
      setItems(editingOrder.items);
      setSelected(String(editingOrder.client_id));
      const client = Array.isArray(clients) ? clients.find(c => c.id === editingOrder.client_id) : null;
      setSelectedClient(client);
      setDeliveryType(editingOrder.delivery_type);
      setDeliveryDate(editingOrder.delivery_date);
      setRepartidorId(editingOrder.repartidor_id ? String(editingOrder.repartidor_id) : '');
    }
  }, [editingOrder, clients]);

  const addProductToOrder = (product) => {
    // Verificar si el producto ya está en el pedido
    const existingItem = items.find(it => String(it.product_id) === String(product.id));
    if (existingItem) {
      // Incrementar cantidad si ya existe
      setItems(items.map(it => 
        String(it.product_id) === String(product.id) 
          ? { ...it, quantity: parseInt(it.quantity) + 1 }
          : it
      ));
      Swal.fire({
        icon: 'info',
        title: 'Producto actualizado',
        text: `Se incrementó la cantidad de "${product.name}"`,
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      // Agregar nuevo producto
      setItems([...items, { 
        product_id: product.id, 
        quantity: 1, 
        unit_price: product.price,
        discount: 0
      }]);
      Swal.fire({
        icon: 'success',
        title: 'Producto agregado',
        text: `"${product.name}" agregado al pedido`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  };
  
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  
  // Filtrar productos - solo mostrar cuando hay filtros activos
  const hasActiveFilters = productNameFilter || productCategoryFilter || productMarcaFilter;
  
  const filteredProducts = hasActiveFilters && Array.isArray(products) ? products.filter(p => {
    const matchesName = !productNameFilter || 
      p.name?.toLowerCase().includes(productNameFilter.toLowerCase()) ||
      p.sku?.toLowerCase().includes(productNameFilter.toLowerCase());
    const matchesCategory = !productCategoryFilter || 
      String(p.rubro_id) === String(productCategoryFilter);
    const matchesMarca = !productMarcaFilter || 
      String(p.marca_id) === String(productMarcaFilter);
    return matchesName && matchesCategory && matchesMarca;
  }) : [];
  
  // Filtrar marcas según la categoría seleccionada
  const availableMarcas = productCategoryFilter 
    ? Array.isArray(marcas) ? marcas.filter(m => {
        // Verificar si existe algún producto con esta categoría y esta marca
        return Array.isArray(products) && products.some(p => 
          String(p.rubro_id) === String(productCategoryFilter) && 
          String(p.marca_id) === String(m.id_marca)
        );
      }) : []
    : marcas; // Si no hay categoría seleccionada, mostrar todas las marcas

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Siempre usar los valores actuales del formulario (estados locales)
      if (!selected) throw new Error('Seleccione un cliente');
      if (items.length === 0) throw new Error('Agregue al menos un producto');
      
      // Validar stock solo para pedidos nuevos
      if (!editingOrder && Array.isArray(products)) {
        for (const it of items) {
          const product = products.find(p => String(p.id) === String(it.product_id));
          const quantity = parseInt(it.quantity, 10);
          if (product && quantity > product.stock) {
            Swal.fire({
              icon: 'error',
              title: 'Stock insuficiente',
              text: `El producto "${product.name}" tiene stock de ${product.stock} unidades. No puedes pedir ${quantity} unidades.`
            });
            return;
          }
        }
      }
      
      const cleanItems = items.map(it => ({ 
        product_id: parseInt(it.product_id, 10), 
        quantity: parseInt(it.quantity, 10), 
        unit_price: parseFloat(it.unit_price) || 0 
      }));
      
      // Validar que si es "por reparto", se seleccione un repartidor
      if (deliveryType === 'por reparto' && !repartidorId) {
        Swal.fire('Error', 'Debe seleccionar un repartidor para entregas por reparto', 'error');
        return;
      }
      
      const payload = { 
        client_id: parseInt(selected, 10),
        items: cleanItems,
        delivery_type: deliveryType,
        delivery_date: deliveryDate || null,
        repartidor_id: repartidorId ? parseInt(repartidorId, 10) : null
      };
      
      if (editingOrder) {
        // Actualizar pedido existente
        await store.updateOrder(editingOrder.id, payload);
        Swal.fire('Actualizado', `Pedido ${editingOrder.id} actualizado exitosamente`, 'success');
        cancelEditOrder();
      } else {
        // Crear nuevo pedido
        const data = await createOrder(payload);
        Swal.fire('Creado', `Pedido ${data.id} creado exitosamente`, 'success');
        setItems([]);
        setSelected('');
        setSelectedClient(null);
        setDeliveryDate(getTomorrowDate());
        setRepartidorId('');
      }
      
      if (fetchOrders) fetchOrders();
      if (fetchProducts) fetchProducts();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message || 'Error al procesar pedido', 'error');
    }
  };

  const filtered = Array.isArray(orders) ? orders.filter(o => {
    const matchesSearch = String(o.id).includes(search) || 
           o.client_name?.toLowerCase().includes(search.toLowerCase()) ||
           o.status?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Si no hay filtro de fecha activado, mostrar todos los que coinciden con la búsqueda
    if (!showPastOrders) {
      // Por defecto mostrar pedidos vigentes (sin fecha o con fecha futura/hoy)
      if (!o.delivery_date) return true;
      
      const deliveryDate = new Date(o.delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deliveryDate.setHours(0, 0, 0, 0);
      
      return deliveryDate >= today;
    } else {
      // Mostrar solo pedidos vencidos
      if (!o.delivery_date) return false;
      
      const deliveryDate = new Date(o.delivery_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deliveryDate.setHours(0, 0, 0, 0);
      
      return deliveryDate < today;
    }
  }) : [];

  const viewDetails = async (o) => {
    try {
      const data = await fetchOrderDetails(o.id);
      const pdfBlob = await generatePDFBlob(o, data);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Mostrar preview del PDF en un iframe
      Swal.fire({
        title: `Pedido #${o.id}`,
        html: `<iframe src="${pdfUrl}" style="width:100%; height:600px; border:none;"></iframe>`,
        width: '90%',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '📥 Descargar PDF',
        confirmButtonColor: '#28a745'
      }).then((result) => {
        if (result.isConfirmed) {
          downloadPDF(pdfBlob, o.id, o.client_name);
        }
        // Limpiar el objeto URL
        URL.revokeObjectURL(pdfUrl);
      });
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al obtener detalles', 'error');
    }
  }

  const startEditOrder = async (order) => {
    try {
      const data = await fetchOrderDetails(order.id);
      setEditingOrder({
        id: order.id,
        client_id: order.client_id,
        client_name: order.client_name,
        delivery_type: order.delivery_type || 'deposito',
        delivery_date: order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : getTomorrowDate(),
        repartidor_id: order.repartidor_id || '',
        items: data.items.map(it => ({
          product_id: it.product_id,
          quantity: it.quantity,
          unit_price: it.unit_price
        }))
      });
      setShowProductGrid(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al cargar pedido', 'error');
    }
  };

  const cancelEditOrder = () => {
    setEditingOrder(null);
    setItems([]);
    setSelected('');
    setSelectedClient(null);
    setDeliveryType('deposito');
    setDeliveryDate(getTomorrowDate());
    setRepartidorId('');
    setShowProductGrid(false);
  };

  const markAsDelivered = async (orderId) => {
    const confirm = await Swal.fire({
      title: '¿Marcar como entregado?',
      text: 'Esta acción marcará el pedido como completado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar como entregado',
      cancelButtonText: 'Cancelar'
    });
    
    if (confirm.isConfirmed) {
      try {
        // Implementar la llamada API para actualizar el estado
        await store.updateOrder(orderId, { status: 'Completado' });
        Swal.fire('Actualizado', 'Pedido marcado como entregado', 'success');
        if (fetchOrders) fetchOrders();
      } catch (err) {
        Swal.fire('Error', err.message || 'Error al actualizar pedido', 'error');
      }
    }
  };

  const toggleOrderItems = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    if (!orderItems[orderId]) {
      setLoadingItems({ ...loadingItems, [orderId]: true });
      try {
        const data = await fetchOrderDetails(orderId);
        setOrderItems({ ...orderItems, [orderId]: data.items });
      } catch (error) {
        console.error('Error loading order items:', error);
      } finally {
        setLoadingItems({ ...loadingItems, [orderId]: false });
      }
    }
    
    setExpandedOrder(orderId);
  };

  const exportToPDF = async (o) => {
    try {
      const data = await fetchOrderDetails(o.id);
      const pdfBlob = await generatePDFBlob(o, data);
      downloadPDF(pdfBlob, o.id, o.client_name);
      Swal.fire('Éxito', 'PDF generado correctamente', 'success');
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al generar PDF', 'error');
    }
  }

  return (
    <div>
      <style>{styles}</style>
      <h4 className="mb-4">Pedidos de Clientes</h4>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="card shadow-sm mb-3">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">{editingOrder ? `📝 Editar Pedido #${editingOrder.id}` : '📝 Crear Nuevo Pedido'}</h6>
            {editingOrder && (
              <button type="button" className="btn btn-sm btn-light" onClick={cancelEditOrder}>
                ✕ Cancelar Edición
              </button>
            )}
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Cliente *</label>
                <div className="position-relative">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Seleccionar cliente..." 
                    value={selectedClient ? (selectedClient.razon_social || `${selectedClient.nombre || ''} ${selectedClient.apellido || ''}`.trim() || `Cliente ${selectedClient.id}`) : ''}
                    onFocus={() => setShowClientSelector(true)}
                    readOnly
                    required
                    style={{ cursor: 'pointer' }}
                  />
                  {selectedClient && (
                    <button 
                      type="button" 
                      className="btn-close position-absolute top-50 end-0 translate-middle-y me-2" 
                      onClick={(e) => { e.stopPropagation(); setSelectedClient(null); setSelected(''); }}
                      style={{ fontSize: '0.7rem' }}
                    />
                  )}
                </div>
                
                <ClientSelector
                  clients={clients}
                  show={showClientSelector}
                  onSelectClient={(client) => {
                    setSelectedClient(client);
                    setSelected(client.id.toString());
                  }}
                  onClose={() => setShowClientSelector(false)}
                />
              </div>
              
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Tipo de Entrega *</label>
                <select 
                  className="form-select" 
                  value={deliveryType} 
                  onChange={(e) => setDeliveryType(e.target.value)}
                >
                  <option value="deposito">Depósito</option>
                  <option value="por reparto">Por Reparto</option>
                  <option value="otros">Otros</option>
                </select>
              </div>
              
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Fecha de Entrega *</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={deliveryDate} 
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              {deliveryType === 'por reparto' && (
                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Repartidor *</label>
                  <select 
                    className="form-select" 
                    value={repartidorId} 
                    onChange={(e) => setRepartidorId(e.target.value)}
                    required={deliveryType === 'por reparto'}
                  >
                    <option value="">Seleccione un repartidor</option>
                    {Array.isArray(repartidores) && repartidores
                      .filter(r => r.estado === 'Activo')
                      .map(r => (
                        <option key={r.id} value={r.id}>
                          🚚 {r.nombre} {r.apellido} {r.licencia_conducir ? `- Lic: ${r.licencia_conducir}` : ''}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {selectedClient && (
              <div className="alert alert-info mb-3">
                <strong>📌 Cliente Seleccionado:</strong> {selectedClient.razon_social || `${selectedClient.nombre || ''} ${selectedClient.apellido || ''}`.trim()}
                {selectedClient.cuit && ` | CUIT: ${selectedClient.cuit}`}
                {selectedClient.telefono && ` | Tel: ${selectedClient.telefono}`}
              </div>
            )}

            {/* Botón para mostrar/ocultar grilla de productos */}
            {selectedClient && permission === 'admin' && (
              <div className="mb-3">
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => setShowProductGrid(!showProductGrid)}
                >
                  {showProductGrid ? '🔽 Ocultar Productos' : '📦 Agregar Productos al Pedido'}
                </button>
                {items.length > 0 && (
                  <span className="ms-3 badge bg-success" style={{ fontSize: '1rem' }}>
                    {items.length} producto(s) en el pedido
                  </span>
                )}
              </div>
            )}

            {/* Grilla de productos */}
            {selectedClient && showProductGrid && (
              <div className="border rounded p-3 mb-3 bg-light">
                <h6 className="mb-3">📦 Seleccionar Productos</h6>
                
                {/* Filtros */}
                <div className="row mb-3">
                  <div className="col-md-4">
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="🔍 Buscar por nombre o SKU..." 
                      value={productNameFilter}
                      onChange={(e) => setProductNameFilter(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select form-select-sm" 
                      value={productCategoryFilter}
                      onChange={(e) => {
                        setProductCategoryFilter(e.target.value);
                        setProductMarcaFilter(''); // Limpiar marca cuando cambia categoría
                      }}
                    >
                      <option value="">Todas las categorías</option>
                      {Array.isArray(rubros) && rubros.map(r => (
                        <option key={r.id_rubro} value={r.id_rubro}>{r.descripcion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
    <select 
                      className="form-select form-select-sm"
                      value={productMarcaFilter}
                      onChange={(e) => setProductMarcaFilter(e.target.value)}
                      disabled={!productCategoryFilter}
                    >
                      <option value="">Todas las marcas</option>
                      {Array.isArray(availableMarcas) && availableMarcas.map(m => (
                        <option key={m.id_marca} value={m.id_marca}>{m.descripcion}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    {(productNameFilter || productCategoryFilter || productMarcaFilter) && (
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary w-100"
                        onClick={() => {
                          setProductNameFilter('');
                          setProductCategoryFilter('');
                          setProductMarcaFilter('');
                        }}
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabla de productos */}
                <div className="table-responsive">
                  <table className="table table-sm table-hover table-bordered bg-white">
                    <thead className="table-primary">
                      <tr>
                        <th style={{ width: '15%' }}>SKU</th>
                        <th style={{ width: '35%' }}>Producto</th>
                        <th style={{ width: '15%' }}>Categoría</th>
                        <th style={{ width: '10%' }} className="text-center">Stock</th>
                        <th style={{ width: '12%' }} className="text-end">Precio</th>
                        <th style={{ width: '8%' }} className="text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hasActiveFilters ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted py-4">
                            💡 Use los filtros para buscar productos
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            No se encontraron productos con los filtros seleccionados
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(product => (
                          <tr key={product.id} className={product.stock <= 0 ? 'table-secondary' : ''}>
                            <td className="small">{product.sku || 'N/A'}</td>
                            <td className="small">
                              {product.name}
                              {product.marca_name && (
                                <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.7rem' }}>
                                  {product.marca_name}
                                </span>
                              )}
                            </td>
                            <td className="small">{product.rubro_name || 'N/A'}</td>
                            <td className="text-center">
                              <span className={`badge ${product.stock <= 0 ? 'bg-danger' : product.stock < 10 ? 'bg-warning text-dark' : 'bg-success'}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td className="text-end fw-bold">${parseFloat(product.price).toFixed(2)}</td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-success"
                                onClick={() => addProductToOrder(product)}
                                disabled={product.stock <= 0}
                                title={product.stock <= 0 ? 'Sin stock' : 'Agregar al pedido'}
                              >
                                +
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {hasActiveFilters && filteredProducts.length > 0 && (
                    <div className="text-muted small mt-2">
                      Mostrando {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de productos agregados al pedido */}
        {items.length > 0 && (
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0">🛒 Resumen del Pedido ({items.length} producto(s))</h6>
            </div>
            <div className="card-body p-3">
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '35%' }}>Producto</th>
                      <th style={{ width: '12%' }} className="text-center">Cantidad</th>
                      <th style={{ width: '15%' }} className="text-center">Precio Unit.</th>
                      <th style={{ width: '12%' }} className="text-center">Desc. %</th>
                      <th style={{ width: '15%' }} className="text-center">Subtotal</th>
                      <th style={{ width: '11%' }} className="text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const selectedProduct = Array.isArray(products) ? products.find(p => p.id === parseInt(it.product_id, 10)) : null;
                      const unitPrice = parseFloat(it.unit_price) || 0;
                      const quantity = parseInt(it.quantity, 10) || 0;
                      const discount = parseFloat(it.discount) || 0;
                      const priceAfterDiscount = unitPrice * (1 - discount / 100);
                      const total = priceAfterDiscount * quantity;

                      return (
                        <tr key={idx}>
                          <td>
                            {selectedProduct ? (
                              <div>
                                <strong>{selectedProduct.name}</strong>
                                <div className="small text-muted">
                                  SKU: {selectedProduct.sku || 'N/A'} | Stock: {selectedProduct.stock}
                                </div>
                              </div>
                            ) : (
                              <span className="text-danger">Producto no encontrado</span>
                            )}
                          </td>
                          <td className="text-center">
                            <input 
                              className="form-control form-control-sm text-center" 
                              type="number" 
                              min="1" 
                              value={it.quantity} 
                              onChange={(e) => updateItem(idx, 'quantity', e.target.value)} 
                              style={{ maxWidth: '80px', margin: '0 auto' }}
                            />
                          </td>
                          <td className="text-center">
                            <input 
                              className="form-control form-control-sm text-center" 
                              type="number" 
                              step="0.01" 
                              min="0"
                              value={unitPrice.toFixed(2)} 
                              onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                              onBlur={async (e) => {
                                const newPrice = parseFloat(e.target.value);
                                if (selectedProduct && !isNaN(newPrice) && newPrice !== selectedProduct.price) {
                                  const confirm = await Swal.fire({
                                    title: '¿Actualizar precio en BD?',
                                    text: `¿Desea actualizar el precio de "${selectedProduct.name}" de $${selectedProduct.price.toFixed(2)} a $${newPrice.toFixed(2)} en la base de datos?`,
                                    icon: 'question',
                                    showCancelButton: true,
                                    confirmButtonText: 'Sí, actualizar',
                                    cancelButtonText: 'No, solo para este pedido'
                                  });
                                  if (confirm.isConfirmed) {
                                    try {
                                      await store.updateProduct(selectedProduct.id, { 
                                        ...selectedProduct, 
                                        price: newPrice 
                                      });
                                      Swal.fire('Actualizado', 'Precio actualizado en la base de datos', 'success');
                                      if (fetchProducts) fetchProducts();
                                    } catch (err) {
                                      Swal.fire('Error', err.message || 'No se pudo actualizar el precio', 'error');
                                    }
                                  }
                                }
                              }}
                              style={{ maxWidth: '100px', margin: '0 auto' }}
                            />
                          </td>
                          <td className="text-center">
                            <div className="input-group input-group-sm" style={{ maxWidth: '120px', margin: '0 auto' }}>
                              <input 
                                className="form-control text-center" 
                                type="number" 
                                step="0.1" 
                                min="0"
                                max="100"
                                value={discount.toFixed(1)} 
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 0;
                                  if (value >= 0 && value <= 100) {
                                    updateItem(idx, 'discount', value);
                                  }
                                }}
                                disabled={selectedProduct && !selectedProduct.permite_descuento}
                                title={selectedProduct && !selectedProduct.permite_descuento ? 'Este producto no permite descuentos' : 'Porcentaje de descuento'}
                              />
                              <span className="input-group-text">%</span>
                            </div>
                          </td>
                          <td className="text-center">
                            <div>
                              {discount > 0 && (
                                <small className="text-muted text-decoration-line-through d-block">
                                  ${(unitPrice * quantity).toFixed(2)}
                                </small>
                              )}
                              <strong className="text-success">${total.toFixed(2)}</strong>
                            </div>
                          </td>
                          <td className="text-center">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => removeItem(idx)} 
                              title="Eliminar producto"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="4" className="text-end"><strong>TOTAL:</strong></td>
                      <td className="text-center">
                        <h5 className="mb-0 text-success">
                          ${items.reduce((sum, it) => {
                            const unitPrice = parseFloat(it.unit_price) || 0;
                            const quantity = parseInt(it.quantity, 10) || 0;
                            const discount = parseFloat(it.discount) || 0;
                            const priceAfterDiscount = unitPrice * (1 - discount / 100);
                            return sum + (priceAfterDiscount * quantity);
                          }, 0).toFixed(2)}
                        </h5>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && permission === 'admin' && (
          <div className="text-end">
            {editingOrder && (
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-lg px-4 me-2" 
                onClick={cancelEditOrder}
              >
                ✕ Cancelar
              </button>
            )}
            <button type="submit" className="btn btn-success btn-lg px-5" disabled={loading || items.length === 0}>
              {editingOrder ? '✓ Confirmar Cambios' : '✓ Crear Pedido'}
            </button>
          </div>
        )}
      </form>

      <div className="card shadow-sm mt-5">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">📋 Lista de Pedidos</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-8">
              <input 
                className="form-control" 
                placeholder="🔍 Buscar por ID, cliente o estado..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
            <div className="col-md-4">
              <div className="form-check form-switch d-flex align-items-center">
                <input 
                  className="form-check-input me-2" 
                  type="checkbox" 
                  id="showPastOrdersSwitch"
                  checked={showPastOrders}
                  onChange={(e) => setShowPastOrders(e.target.checked)}
                  style={{ width: '48px', height: '24px', cursor: 'pointer' }}
                />
                <label className="form-check-label" htmlFor="showPastOrdersSwitch" style={{ fontSize: '0.95rem' }}>
                  {showPastOrders ? '📅 Mostrando pedidos vencidos' : '📅 Mostrar pedidos vencidos'}
                </label>
              </div>
            </div>
          </div>

          <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Tipo Entrega</th>
              <th>Repartidor</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Fecha Entrega</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <React.Fragment key={o.id}>
                <tr>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => toggleOrderItems(o.id)}
                      title="Ver productos"
                    >
                      {expandedOrder === o.id ? '−' : '+'}
                    </button>
                  </td>
                  <td>{o.id}</td>
                  <td>{o.client_name || 'N/A'}</td>
                  <td>
                    <span className={`badge ${o.status === 'Completado' ? 'bg-success' : o.status === 'Pendiente' ? 'bg-warning' : 'bg-secondary'}`}>
                      {o.status || 'Pendiente'}
                    </span>
                  </td>
                  <td>{o.delivery_type || 'N/A'}</td>
                  <td>
                    {o.repartidor_name ? (
                      <span className="badge bg-info text-dark">{o.repartidor_name}</span>
                    ) : '-'}
                  </td>
                  <td>${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    {o.delivery_date ? (
                      <span className={new Date(o.delivery_date) < new Date() ? 'text-danger fw-bold' : ''}>
                        {new Date(o.delivery_date).toLocaleDateString()}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td>
                    <div className="d-flex gap-1 flex-wrap">
                      {permission === 'admin' && o.status !== 'Completado' && (
                        <>
                          <button 
                            className="btn btn-sm btn-warning" 
                            onClick={() => startEditOrder(o)}
                            title="Editar pedido"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn btn-sm btn-success" 
                            onClick={() => markAsDelivered(o.id)}
                            title="Marcar como entregado"
                          >
                            ✓
                          </button>
                        </>
                      )}
                      <button 
                        className="btn btn-sm btn-info" 
                        onClick={() => viewDetails(o)}
                        title="Ver detalles"
                      >
                        👁️
                      </button>
                      <button 
                        className="btn btn-sm btn-danger" 
                        onClick={() => exportToPDF(o)}
                        title="Exportar a PDF"
                      >
                        📄
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedOrder === o.id && (
                  <tr>
                    <td colSpan="10" className="bg-light">
                      {loadingItems[o.id] ? (
                        <div className="text-center py-3">
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3">
                          <h6 className="mb-3">📦 Productos del Pedido</h6>
                          {orderItems[o.id]?.length > 0 ? (
                            <table className="table table-sm table-bordered">
                              <thead className="table-secondary">
                                <tr>
                                  <th>Producto</th>
                                  <th>SKU</th>
                                  <th>Cantidad</th>
                                  <th>Precio Unit.</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {orderItems[o.id].map((item, idx) => (
                                  <tr key={idx}>
                                    <td>{item.name}</td>
                                    <td>{item.sku || 'N/A'}</td>
                                    <td>{item.quantity}</td>
                                    <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="text-success">${(item.quantity * item.unit_price).toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="text-muted mb-0">No hay productos para mostrar</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center text-muted py-4">
                  <div className="mb-2" style={{ fontSize: '3rem' }}>📦</div>
                  <div>No hay pedidos para mostrar</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
          </div>
        </div>
      </div>
    </div>
  );
}
