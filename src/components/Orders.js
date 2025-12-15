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
  const { orders = [], fetchOrders, createOrder, fetchOrderDetails, products = [], clients = [], fetchProducts, fetchClients, loading, permission } = store;

  const [selected, setSelected] = useState(''); // client_id
  const [selectedClient, setSelectedClient] = useState(null); // objeto completo del cliente
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState(''); // búsqueda de clientes
  const [showClientSelector, setShowClientSelector] = useState(false); // mostrar panel de selección
  const [deliveryType, setDeliveryType] = useState('deposito');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {
    if (fetchOrders) fetchOrders();
    if (fetchProducts) fetchProducts();
    if (fetchClients) fetchClients();
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selected) throw new Error('Seleccione un cliente');
      if (items.length === 0) throw new Error('Agregue al menos un producto');
      
      // Validar stock
      if (Array.isArray(products)) {
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
      
      const payload = { 
        client_id: parseInt(selected, 10),
        items: cleanItems,
        delivery_type: deliveryType
      };
      
      const data = await createOrder(payload);
      Swal.fire('Creado', `Pedido ${data.id} creado exitosamente`, 'success');
      setItems([]);
      setSelected('');
      if (fetchOrders) fetchOrders();
      if (fetchProducts) fetchProducts();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message || 'Error al crear pedido', 'error');
    }
  };

  const filtered = Array.isArray(orders) ? orders.filter(o => {
    return String(o.id).includes(search) || 
           o.client_name?.toLowerCase().includes(search.toLowerCase()) ||
           o.status?.toLowerCase().includes(search.toLowerCase());
  }) : [];

  const viewDetails = async (o) => {
    try {
      const data = await fetchOrderDetails(o.id);
      const html = data.items.map(it => `<div>${it.name} (SKU: ${it.sku || 'N/A'}) x ${it.quantity} - Precio: $${parseFloat(it.unit_price).toFixed(2)}</div>`).join('');
      Swal.fire({ title: `Pedido Cliente #${data.id}`, html: html || 'Sin items', width: 800 });
    } catch (err) {
      Swal.fire('Error', err.message || 'Error al obtener detalles', 'error');
    }
  }

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
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text(`Pedido Cliente #${o.id}`, 20, 20);
      
      // Información del cliente
      doc.setFontSize(12);
      const entityName = o.client_name || 'Cliente';
      doc.text(`Cliente: ${entityName}`, 20, 30);
      doc.text(`Fecha: ${new Date(o.created_at).toLocaleString()}`, 20, 38);
      
      // Línea separadora
      doc.line(20, 42, 190, 42);
      
      // Encabezados de tabla
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Producto', 20, 50);
      doc.text('Cantidad', 110, 50);
      doc.text('Precio Unit.', 140, 50);
      doc.text('Subtotal', 170, 50);
      doc.setFont(undefined, 'normal');
      
      // Items
      let yPos = 58;
      data.items.forEach((item, idx) => {
        const subtotal = item.quantity * item.unit_price;
        doc.text(item.name.substring(0, 35), 20, yPos);
        doc.text(String(item.quantity), 110, yPos);
        doc.text(`$${item.unit_price.toFixed(2)}`, 140, yPos);
        doc.text(`$${subtotal.toFixed(2)}`, 170, yPos);
        yPos += 8;
        
        // Nueva página si es necesario
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Línea separadora
      yPos += 5;
      doc.line(20, yPos, 190, yPos);
      
      // Total
      yPos += 8;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL:', 140, yPos);
      doc.text(`$${o.total_amount.toFixed(2)}`, 170, yPos);
      
      // Generar nombre del archivo
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const fileName = `PEDIDO_CLIENTE_${entityName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
      
      // Descargar
      doc.save(fileName);
      
      Swal.fire('Éxito', 'PDF generado correctamente', 'success');
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to generate PDF', 'error');
    }
  }

  return (
    <div>
      <style>{styles}</style>
      <h4>Pedidos de Clientes</h4>

      <div className="mb-3">
        <input className="form-control" placeholder="Buscar por ID, cliente o estado..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row align-items-center">
          <div className="col-md-4 mb-2">
            <div className="position-relative">
              <input 
                type="text" 
                className="form-control" 
                placeholder="Buscar cliente..." 
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
              <div className="card position-absolute" style={{ zIndex: 1000, width: '600px', maxHeight: '400px' }}>
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
          <div className="col-md-3 mb-2">
            <select className="form-select" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
              <option value="deposito">Depósito</option>
              <option value="por reparto">Por Reparto</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="col-md-5 mb-2 text-end">
            {permission === 'admin' && <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={addItem}>Agregar producto</button>}
            {permission === 'admin' && <button type="submit" className="btn btn-primary" disabled={loading || items.length === 0}>Crear Pedido</button>}
          </div>
        </div>

        {selectedClient && (
          <div className="card mb-3 shadow-sm">
            <div className="card-body p-3">
              <div className="row">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1 text-primary">
                        <i className="bi bi-person-circle"></i> {selectedClient.razon_social || `${selectedClient.nombre || ''} ${selectedClient.apellido || ''}`.trim() || 'Sin nombre'}
                      </h6>
                      <small className="text-muted">ID: #{selectedClient.id}</small>
                    </div>
                    <span className={`badge ${selectedClient.estado === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                      {selectedClient.estado || 'Activo'}
                    </span>
                  </div>
                  {selectedClient.cuit && (
                    <div className="mb-1">
                      <small><i className="bi bi-card-text text-primary"></i> <strong>CUIT:</strong> {selectedClient.cuit}</small>
                    </div>
                  )}
                  {selectedClient.telefono && (
                    <div className="mb-1">
                      <small><i className="bi bi-telephone text-primary"></i> <strong>Teléfono:</strong> {selectedClient.telefono}</small>
                    </div>
                  )}
                  {selectedClient.correo && (
                    <div className="mb-1">
                      <small><i className="bi bi-envelope text-primary"></i> <strong>Email:</strong> {selectedClient.correo}</small>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  {(selectedClient.direccion || selectedClient.localidad_nombre) && (
                    <div className="mb-2">
                      <small className="text-muted d-block mb-1"><strong>Dirección:</strong></small>
                      <small>
                        <i className="bi bi-geo-alt text-primary"></i> 
                        {selectedClient.direccion} {selectedClient.numero || ''}
                        {selectedClient.localidad_nombre && ` - ${selectedClient.localidad_nombre}`}
                        {selectedClient.barrio_nombre && ` (${selectedClient.barrio_nombre})`}
                      </small>
                    </div>
                  )}
                  {selectedClient.condicion_pago && (
                    <div className="mb-1">
                      <small><strong>Condición de Pago:</strong> <span className="badge bg-info text-dark">{selectedClient.condicion_pago}</span></small>
                    </div>
                  )}
                  {selectedClient.zona_nombre && (
                    <div>
                      <small><strong>Zona:</strong> {selectedClient.zona_nombre}</small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="row mb-3">
            <div className="col-md-5"><small className="text-muted">Producto</small></div>
            <div className="col-md-2"><small className="text-muted">Cantidad</small></div>
            <div className="col-md-2"><small className="text-muted">Precio Unitario</small></div>
            <div className="col-md-2"><small className="text-muted">Total</small></div>
            <div className="col-md-1"></div>
          </div>
        )}
        {items.map((it, idx) => {
          const selectedProduct = Array.isArray(products) ? products.find(p => p.id === parseInt(it.product_id, 10)) : null;
          const unitPrice = parseFloat(it.unit_price) || (selectedProduct?.price || 0);
          const quantity = parseInt(it.quantity, 10) || 0;
          const total = unitPrice * quantity;

          return (
            <div className="row mb-2" key={idx}>
              <div className="col-md-5">
                <select 
                  className="form-select" 
                  value={String(it.product_id || '')} 
                  onChange={(e) => {
                    const productId = e.target.value;
                    const product = Array.isArray(products) ? products.find(p => String(p.id) === productId) : null;
                    // Actualizar product_id y unit_price en una sola operación
                    setItems(items.map((item, i) => 
                      i === idx 
                        ? { ...item, product_id: productId, unit_price: product ? product.price : 0 }
                        : item
                    ));
                  }}
                >
                  <option value="">Seleccione producto</option>
                  {Array.isArray(products) && products.map(p => (
                    <option 
                      key={p.id} 
                      value={String(p.id)}
                      disabled={p.stock <= 0}
                    >
                      [{p.sku || p.id}] {p.name} | ${p.price} | Stock: {p.stock} | {p.provider_name || 'Sin proveedor'}
                    </option>
                  ))}
                </select>
                {selectedProduct && (
                  <div className="small mt-1 text-muted">
                    <span className="me-2"><strong>SKU:</strong> {selectedProduct.sku || 'N/A'}</span>
                    <span className="me-2"><strong>Stock:</strong> <span className={selectedProduct.stock < 10 ? 'text-danger' : 'text-success'}>{selectedProduct.stock}</span></span>
                    {selectedProduct.provider_name && <span><strong>Proveedor:</strong> {selectedProduct.provider_name}</span>}
                  </div>
                )}
              </div>
              <div className="col-md-2">
                <input 
                  className="form-control" 
                  type="number" 
                  min="1" 
                  value={it.quantity} 
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)} 
                />
              </div>
              <div className="col-md-2">
                <input 
                  className="form-control" 
                  type="number" 
                  step="0.01" 
                  value={unitPrice} 
                  onChange={(e) => updateItem(idx, 'unit_price', e.target.value)}
                  readOnly={selectedProduct ? true : false}
                />
              </div>
              <div className="col-md-2">
                <input 
                  className="form-control" 
                  type="number" 
                  value={total.toFixed(2)} 
                  readOnly 
                  style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}
                />
              </div>
              <div className="col-md-1 text-end">
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>Quitar</button>
              </div>
            </div>
          );
        })}
      </form>

      <hr />
      <div className="mb-3 d-flex">
        <input className="form-control me-2" placeholder="Buscar por ID, proveedor o cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <td>${parseFloat(o.total_amount || 0).toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.delivery_date ? new Date(o.delivery_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-info me-2" 
                      onClick={() => viewDetails(o)}
                      title="Ver detalles"
                    >
                      👁️ Ver
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => exportToPDF(o)}
                      title="Exportar a PDF"
                    >
                      📄 PDF
                    </button>
                  </td>
                </tr>
                {expandedOrder === o.id && (
                  <tr>
                    <td colSpan="8" className="bg-light">
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
            {filtered.length === 0 && (<tr><td colSpan="8">No orders</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
