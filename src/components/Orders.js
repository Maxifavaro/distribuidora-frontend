import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

export default function Orders() {
  const { orders, fetchOrders, createOrder, fetchOrderDetails, products, providers, clients, fetchProducts, fetchProviders, fetchClients, loading, permission } = useStore();

  const [type, setType] = useState('client');
  const [selected, setSelected] = useState(''); // client_id or provider_id
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [deliveryType, setDeliveryType] = useState('deposito');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState({});
  const [loadingItems, setLoadingItems] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchProviders();
    fetchClients();
  }, []);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => setItems(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // validate
      if (!selected) throw new Error('Seleccione cliente o proveedor');
      
      // Validar stock para pedidos de cliente
      if (type === 'client') {
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
      const payload = { order_type: type === 'supplier' ? 'supplier' : 'client', items: cleanItems };
      if (type === 'client') {
        payload.client_id = parseInt(selected, 10);
        payload.delivery_type = deliveryType;
      } else {
        payload.provider_id = parseInt(selected, 10);
      }
      const data = await createOrder(payload);
      Swal.fire('Creado', `Pedido ${data.id} creado`, 'success');
      setItems([]);
      setSelected('');
      fetchOrders();
      fetchProducts();
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to create order', 'error');
    }
  };

  const filtered = orders.filter(o => {
    // Filtrar por tipo de pedido
    if (type === 'client' && o.order_type !== 'client') return false;
    if (type === 'supplier' && o.order_type !== 'supplier') return false;
    
    // Filtrar por búsqueda
    return String(o.id).includes(search) || 
           o.provider_name?.toLowerCase().includes(search.toLowerCase()) || 
           o.client_name?.toLowerCase().includes(search.toLowerCase());
  });

  const viewDetails = async (o) => {
    try {
      const data = await fetchOrderDetails(o.id);
      const html = data.items.map(it => `<div>${it.name} (SKU: ${it.sku}) x ${it.quantity} - Precio: ${it.unit_price}</div>`).join('');
      Swal.fire({ title: `Pedido ${data.id} - ${data.order_type}`, html: html || 'Sin items', width: 800 });
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to fetch order details', 'error');
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
      doc.text(`Pedido ${o.order_type === 'client' ? 'Cliente' : 'Proveedor'} #${o.id}`, 20, 20);
      
      // Información del cliente/proveedor
      doc.setFontSize(12);
      const entityName = o.order_type === 'client' ? o.client_name : o.provider_name;
      doc.text(`${o.order_type === 'client' ? 'Cliente' : 'Proveedor'}: ${entityName}`, 20, 30);
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
      const fileName = `PEDIDO_${o.order_type === 'client' ? 'CLIENTE' : 'PROVEEDOR'}_${entityName.replace(/\s+/g, '_')}_${dateStr}.pdf`;
      
      // Descargar
      doc.save(fileName);
      
      Swal.fire('Éxito', 'PDF generado correctamente', 'success');
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to generate PDF', 'error');
    }
  }

  return (
    <div>
      <h4>Pedidos</h4>

      <div className="mb-3">
        <div className="btn-group" role="group">
          <button type="button" className={`btn btn-outline-primary ${type === 'client' ? 'active' : ''}`} onClick={() => setType('client')}>Pedido Cliente</button>
          <button type="button" className={`btn btn-outline-secondary ${type === 'supplier' ? 'active' : ''}`} onClick={() => setType('supplier')}>Pedido Proveedor</button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row align-items-center">
          <div className="col-md-4 mb-2">
            <select className="form-select" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Seleccionar {type === 'client' ? 'Cliente' : 'Proveedor'}</option>
              {type === 'client' ? clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>) : providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          {type === 'client' && (
            <div className="col-md-3 mb-2">
              <select className="form-select" value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
                <option value="deposito">Depósito</option>
                <option value="por reparto">Por Reparto</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          )}
          <div className={`col-md-${type === 'client' ? '5' : '8'} mb-2 text-end`}>

            {permission === 'admin' && <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={addItem}>Agregar producto</button>}
            {permission === 'admin' && <button type="submit" className="btn btn-primary" disabled={loading || items.length === 0}>Crear Pedido</button>}
          </div>
        </div>

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
          const selectedProduct = products.find(p => p.id === parseInt(it.product_id, 10));
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
                    const product = products.find(p => String(p.id) === productId);
                    // Actualizar product_id y unit_price en una sola operación
                    setItems(items.map((item, i) => 
                      i === idx 
                        ? { ...item, product_id: productId, unit_price: product ? product.price : 0 }
                        : item
                    ));
                  }}
                >
                  <option value="">Seleccione producto</option>
                  {products.map(p => <option key={p.id} value={String(p.id)}>{p.name} (Stock: {p.stock})</option>)}
                </select>
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
              <th>Tipo</th>
              <th>Proveedor/Cliente</th>
              <th>Tipo Entrega</th>
              <th>Total</th>
              <th>Fecha</th>
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
                  <td>{o.order_type}</td>
                  <td>{o.order_type === 'supplier' ? o.provider_name : o.client_name}</td>
                  <td>{o.delivery_type || 'N/A'}</td>
                  <td>${o.total_amount.toFixed(2)}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
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
