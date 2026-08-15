import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

// Agregar estilos para hover
const styles = `
  .hover-bg-light:hover {
    background-color: #f8f9fa !important;
  }
`;

export default function Orders() {
  const store = useStore();
  const { orders = [], fetchOrders, createOrder, fetchOrderDetails, products = [], clients = [], repartidores = [], rubros = [], marcas = [], fetchProducts, fetchClients, fetchRepartidores, fetchRubros, fetchMarcas, loading, permission } = store;

  const [selected, setSelected] = useState(''); // client_id
  const [selectedClient, setSelectedClient] = useState(null); // objeto completo del cliente
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState(''); // búsqueda de clientes
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
          // Descargar el PDF
          const link = document.createElement('a');
          link.href = pdfUrl;
          const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 10);
          link.download = `PEDIDO_${o.id}_${o.client_name?.replace(/\s+/g, '_')}_${dateStr}.pdf`;
          link.click();
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

  const generatePDFBlob = async (o, data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Título simple
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Pedido: ${String(o.id).padStart(6, '0')}`, pageWidth / 2, 20, { align: 'center' });
    
    // Línea separadora
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, 25, pageWidth - 15, 25);
    
    // Información del pedido en dos columnas
    let yPos = 35;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL CLIENTE', 15, yPos);
    doc.text('DATOS DEL PEDIDO', 110, yPos);
    
    yPos += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Columna izquierda - Cliente
    doc.setFont(undefined, 'bold');
    doc.text('Cliente:', 15, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(o.client_name || 'N/A', 35, yPos);
    
    // Columna derecha - Fecha creación
    doc.setFont(undefined, 'bold');
    doc.text('Fecha Pedido:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(o.created_at).toLocaleDateString('es-AR'), 145, yPos);
    
    yPos += 7;
    
    // Dirección
    if (o.client_direccion) {
      doc.setFont(undefined, 'bold');
      doc.text('Dirección:', 15, yPos);
      doc.setFont(undefined, 'normal');
      const direccion = o.client_direccion + (o.client_numero ? ' ' + o.client_numero : '');
      doc.text(direccion, 35, yPos);
    }
    
    // Tipo de entrega
    doc.setFont(undefined, 'bold');
    doc.text('Tipo Entrega:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(o.delivery_type || 'N/A', 145, yPos);
    
    yPos += 7;
    
    // Teléfono
    if (o.client_telefono) {
      doc.setFont(undefined, 'bold');
      doc.text('Teléfono:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(o.client_telefono, 35, yPos);
    }
    
    yPos += 7;
    
    // Fecha de entrega
    if (o.delivery_date) {
      doc.setFont(undefined, 'bold');
      doc.text('Fecha Entrega:', 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(new Date(o.delivery_date).toLocaleDateString('es-AR'), 145, yPos);
      yPos += 7;
    }
    
    // Repartidor
    if (o.repartidor_name) {
      doc.setFont(undefined, 'bold');
      doc.text('Repartidor:', 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(o.repartidor_name, 145, yPos);
      yPos += 7;
    }
    
    // Estado
    doc.setFont(undefined, 'bold');
    doc.text('Estado:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(o.status || 'Pendiente', 145, yPos);
    
    // Línea separadora
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Título de la tabla
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLE DE PRODUCTOS', 15, yPos);
    
    // Encabezado de tabla
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    // Línea superior del encabezado
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 2, pageWidth - 15, yPos - 2);
    
    doc.text('PRODUCTO', 17, yPos + 2);
    doc.text('SKU', 110, yPos + 2);
    doc.text('CANT.', 135, yPos + 2, { align: 'center' });
    doc.text('PRECIO UNIT.', 160, yPos + 2, { align: 'right' });
    doc.text('SUBTOTAL', pageWidth - 17, yPos + 2, { align: 'right' });
    
    // Línea inferior del encabezado
    doc.line(15, yPos + 4, pageWidth - 15, yPos + 4);
    
    doc.setFont(undefined, 'normal');
    
    // Items de la tabla
    yPos += 8;
    let totalGeneral = 0;
    let itemCount = 0;
    
    data.items.forEach((item, idx) => {
      // Verificar si necesitamos nueva página
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
        
        // Repetir encabezado en nueva página
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        
        doc.setLineWidth(0.5);
        doc.line(15, yPos - 2, pageWidth - 15, yPos - 2);
        
        doc.text('PRODUCTO', 17, yPos + 2);
        doc.text('SKU', 110, yPos + 2);
        doc.text('CANT.', 135, yPos + 2, { align: 'center' });
        doc.text('PRECIO UNIT.', 160, yPos + 2, { align: 'right' });
        doc.text('SUBTOTAL', pageWidth - 17, yPos + 2, { align: 'right' });
        
        doc.line(15, yPos + 4, pageWidth - 15, yPos + 4);
        
        doc.setFont(undefined, 'normal');
        yPos += 8;
      }
      
      const subtotal = item.quantity * item.unit_price;
      totalGeneral += subtotal;
      itemCount++;
      
      // Truncar nombre si es muy largo
      const productName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      
      doc.setFontSize(8);
      doc.text(productName, 17, yPos);
      doc.text(item.sku || 'N/A', 110, yPos);
      doc.text(String(item.quantity), 135, yPos, { align: 'center' });
      doc.text(`$ ${parseFloat(item.unit_price).toFixed(2)}`, 160, yPos, { align: 'right' });
      doc.setFont(undefined, 'bold');
      doc.text(`$ ${subtotal.toFixed(2)}`, pageWidth - 17, yPos, { align: 'right' });
      doc.setFont(undefined, 'normal');
      
      yPos += 7;
    });
    
    // Línea antes del total
    yPos += 3;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Resumen final
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Total de items: ${itemCount}`, 15, yPos);
    
    // Total
    yPos += 2;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', pageWidth - 75, yPos + 2);
    doc.text(`$ ${totalGeneral.toFixed(2)}`, pageWidth - 17, yPos + 2, { align: 'right' });
    
    // Pie de página
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado el ${new Date().toLocaleString('es-AR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    return doc.output('blob');
  };

  const exportToPDF = async (o) => {
    try {
      const data = await fetchOrderDetails(o.id);
      const pdfBlob = await generatePDFBlob(o, data);
      
      // Crear link de descarga
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 10);
      link.download = `PEDIDO_${o.id}_${o.client_name?.replace(/\s+/g, '_')}_${dateStr}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      
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
                      onClick={(e) => { e.stopPropagation(); setSelectedClient(null); setSelected(''); setClientSearch(''); }}
                      style={{ fontSize: '0.7rem' }}
                    />
                  )}
                </div>
                
                {showClientSelector && (
                  <div className="card position-absolute" style={{ zIndex: 1000, width: '600px', maxHeight: '400px', marginTop: '5px' }}>
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                      <span>Seleccionar Cliente</span>
                      <button type="button" className="btn-close btn-close-white" onClick={() => setShowClientSelector(false)} />
                    </div>
                <div className="card-body p-2">
                  <input 
                    type="text" 
                    className="form-control form-control-sm mb-2" 
                    placeholder="Buscar por nombre, razón social, CUIT, dirección, teléfono..." 
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    autoFocus
                  />
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {Array.isArray(clients) && clients
                      .filter(c => {
                        if (!clientSearch) return true;
                        const searchLower = clientSearch.toLowerCase();
                        return (
                          (c.razon_social && c.razon_social.toLowerCase().includes(searchLower)) ||
                          (c.nombre && c.nombre.toLowerCase().includes(searchLower)) ||
                          (c.apellido && c.apellido.toLowerCase().includes(searchLower)) ||
                          (c.cuit && c.cuit.toLowerCase().includes(searchLower)) ||
                          (c.direccion && c.direccion.toLowerCase().includes(searchLower)) ||
                          (c.telefono && c.telefono.toLowerCase().includes(searchLower)) ||
                          (c.localidad_nombre && c.localidad_nombre.toLowerCase().includes(searchLower)) ||
                          c.id.toString().includes(searchLower)
                        );
                      })
                      .slice(0, 50)
                      .map(c => (
                        <div 
                          key={c.id} 
                          className="border-bottom p-2 hover-bg-light" 
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedClient(c);
                            setSelected(c.id.toString());
                            setShowClientSelector(false);
                            setClientSearch('');
                          }}
                        >
                          <div className="d-flex justify-content-between">
                            <strong className="text-primary">#{c.id} - {c.razon_social || `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'Sin nombre'}</strong>
                            <span className="badge bg-secondary">{c.estado || 'Activo'}</span>
                          </div>
                          <div className="small text-muted">
                            {c.cuit && <span className="me-3"><i className="bi bi-card-text"></i> CUIT: {c.cuit}</span>}
                            {c.telefono && <span className="me-3"><i className="bi bi-telephone"></i> {c.telefono}</span>}
                          </div>
                          <div className="small text-muted">
                            {c.direccion && <span className="me-2"><i className="bi bi-geo-alt"></i> {c.direccion} {c.numero || ''}</span>}
                            {c.localidad_nombre && <span>- {c.localidad_nombre}</span>}
                          </div>
                          {c.condicion_pago && <div className="small"><span className="badge bg-info text-dark mt-1">{c.condicion_pago}</span></div>}
                        </div>
                      ))}
                    {Array.isArray(clients) && clients.filter(c => {
                      if (!clientSearch) return true;
                      const searchLower = clientSearch.toLowerCase();
                      return (
                        (c.razon_social && c.razon_social.toLowerCase().includes(searchLower)) ||
                        (c.nombre && c.nombre.toLowerCase().includes(searchLower)) ||
                        (c.apellido && c.apellido.toLowerCase().includes(searchLower)) ||
                        (c.cuit && c.cuit.toLowerCase().includes(searchLower)) ||
                        (c.direccion && c.direccion.toLowerCase().includes(searchLower)) ||
                        (c.telefono && c.telefono.toLowerCase().includes(searchLower)) ||
                        (c.localidad_nombre && c.localidad_nombre.toLowerCase().includes(searchLower))
                      );
                    }).length === 0 && (
                      <div className="text-center text-muted p-3">No se encontraron clientes</div>
                    )}
                  </div>
                </div>
              </div>
            )}
              </div>
              
              <div className="col-md-3 mb-3">
                <label className="form-label fw-bold">Tipo de Entrega *</label>
                <select className="form-select" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
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
