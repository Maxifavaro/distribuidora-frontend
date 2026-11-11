import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api from '../../store/api';
import useStore from '../../store';
import Swal from 'sweetalert2';
import PaginationFooter from '../shared/PaginationFooter';
import './Orders.css';

const EMPTY_ARRAY = [];
const PAGE_SIZE = 10;

function localDateValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function defaultDeliveryDate(fromDate = new Date()) {
  const date = new Date(fromDate);
  date.setDate(date.getDate() + (date.getDay() === 6 ? 2 : 1));
  return localDateValue(date);
}

function money(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(value) || 0);
}

function hasKnownStock(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function errorMessage(error) {
  return error.response?.data?.message || error.response?.data?.error || error.message || 'Ocurrió un error inesperado.';
}

function clientLabel(client) {
  return client.razon_social || [client.apellido, client.nombre].filter(Boolean).join(', ') || `Cliente ${client.id}`;
}

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : localDateValue(date);
}

function formatDate(value, dateOnly = false) {
  if (!value) return '—';
  const date = dateOnly && /^\d{4}-\d{2}-\d{2}/.test(String(value))
    ? new Date(`${String(value).slice(0, 10)}T12:00:00`)
    : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-AR');
}

function SearchResults({ id, label, loading, error, items, renderItem }) {
  if (loading) return <div className="orders-search-status" role="status">Buscando...</div>;
  if (error) return <div className="orders-search-status is-error" role="alert">{error}</div>;
  if (items.length === 0) return null;

  return (
    <div id={id} className="orders-search-results" role="listbox" aria-label={label}>
      {items.map(item => renderItem(item))}
    </div>
  );
}

export default function Orders() {
  const { permission } = useStore();
  const isAdmin = permission === 'admin';
  const productInput = useRef(null);
  const [clientTerm, setClientTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientMatches, setClientMatches] = useState(EMPTY_ARRAY);
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState('');
  const [productTerm, setProductTerm] = useState('');
  const [productMatches, setProductMatches] = useState(EMPTY_ARRAY);
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState('');
  const [cart, setCart] = useState(EMPTY_ARRAY);
  const [discountPercent, setDiscountPercent] = useState('0');
  const [deliveryType, setDeliveryType] = useState('por reparto');
  const [deliveryDate, setDeliveryDate] = useState(() => defaultDeliveryDate());
  const [repartidores, setRepartidores] = useState(EMPTY_ARRAY);
  const [repartidoresError, setRepartidoresError] = useState('');
  const [repartidorId, setRepartidorId] = useState('');
  const [notes, setNotes] = useState('');
  const [orders, setOrders] = useState(EMPTY_ARRAY);
  const [ordersError, setOrdersError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [nextOrderNumber, setNextOrderNumber] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);

  useEffect(() => {
    let active = true;
    api.get('/catalogs/repartidores')
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error('El catálogo de repartidores tiene un formato inválido.');
        if (active) setRepartidores(data);
      })
      .catch(error => {
        if (active) setRepartidoresError(errorMessage(error));
      });
    return () => { active = false; };
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders');
      if (!Array.isArray(data)) throw new Error('La lista de pedidos tiene un formato inválido.');
      setOrders(data);
      setOrdersError('');
    } catch (error) {
      setOrdersError(errorMessage(error));
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const term = clientTerm.trim();
    const controller = new AbortController();
    if (!isAdmin || selectedClient || !term) {
      setClientMatches(EMPTY_ARRAY);
      setClientLoading(false);
      return () => controller.abort();
    }

    setClientError('');
    const timeout = setTimeout(async () => {
      setClientLoading(true);
      try {
        const { data } = await api.get('/clients/search', { params: { q: term }, signal: controller.signal });
        if (!Array.isArray(data)) throw new Error('La búsqueda de clientes tiene un formato inválido.');
        setClientMatches(data);
      } catch (error) {
        if (!controller.signal.aborted) setClientError(errorMessage(error));
      } finally {
        if (!controller.signal.aborted) setClientLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [clientTerm, selectedClient, isAdmin]);

  useEffect(() => {
    const term = productTerm.trim();
    const controller = new AbortController();
    if (!isAdmin || !term) {
      setProductMatches(EMPTY_ARRAY);
      setProductLoading(false);
      return () => controller.abort();
    }

    setProductError('');
    const timeout = setTimeout(async () => {
      setProductLoading(true);
      try {
        const { data } = await api.get('/products/search', { params: { q: term }, signal: controller.signal });
        if (!Array.isArray(data)) throw new Error('La búsqueda de productos tiene un formato inválido.');
        setProductMatches(data);
      } catch (error) {
        if (!controller.signal.aborted) setProductError(errorMessage(error));
      } finally {
        if (!controller.signal.aborted) setProductLoading(false);
      }
    }, 180);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [productTerm, isAdmin]);

  const orderTotal = useMemo(
    () => cart.reduce((total, item) => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
      return total + (item.applyDiscount ? lineTotal * (1 - (Number(discountPercent) || 0) / 100) : lineTotal);
    }, 0),
    [cart, discountPercent]
  );
  const orderSubtotal = useMemo(
    () => cart.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0),
    [cart]
  );
  const discountAmount = orderSubtotal - orderTotal;
  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLocaleLowerCase();
    if (!term) return orders;
    return orders.filter(order =>
      `${order.id} ${order.client_name || ''} ${order.client_direccion || ''} ${order.status || ''}`
        .toLocaleLowerCase()
        .includes(term)
    );
  }, [orders, orderSearch]);
  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const safeOrderPage = Math.min(orderPage, orderPageCount);
  const visibleOrders = filteredOrders.slice((safeOrderPage - 1) * PAGE_SIZE, safeOrderPage * PAGE_SIZE);

  const chooseClient = (client) => {
    setSelectedClient(client);
    setClientTerm(clientLabel(client));
    setClientMatches(EMPTY_ARRAY);
    setClientError('');
    setFormError('');
    productInput.current?.focus();
  };

  const addProduct = (product) => {
    const price = Number(product.price);
    if (product.price === null || product.price === undefined || !Number.isFinite(price) || price < 0) {
      setFormError(`El producto ${product.name} no tiene un precio de venta válido.`);
      return;
    }
    const currentQuantity = cart.find(item => item.id === product.id)?.quantity || 0;
    const nextQuantity = Number(currentQuantity) + 1;
    const stock = Number(product.stock);
    if (!editingOrderId && hasKnownStock(product.stock) && nextQuantity > stock) {
      setFormError(`Stock insuficiente para ${product.name}. Disponible: ${stock}.`);
      return;
    }

    setCart(current => {
      const existing = current.find(item => item.id === product.id);
      if (existing) {
        return current.map(item => item.id === product.id ? { ...item, quantity: Number(item.quantity) + 1 } : item);
      }
      return [...current, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        price,
        stock: product.stock,
        quantity: 1,
        applyDiscount: true
      }];
    });
    setFormError('');
    setSuccess('');
    setProductTerm('');
    setProductMatches(EMPTY_ARRAY);
    productInput.current?.focus();
  };

  const updateQuantity = (productId, rawValue) => {
    const quantity = rawValue === '' ? '' : Number(rawValue);
    setCart(current => current.map(item => item.id === productId ? { ...item, quantity } : item));
    setFormError('');
  };

  const resetForm = () => {
    setSelectedClient(null);
    setClientTerm('');
    setCart(EMPTY_ARRAY);
    setDiscountPercent('0');
    setDeliveryType('por reparto');
    setDeliveryDate(defaultDeliveryDate());
    setRepartidorId('');
    setNotes('');
    setEditingOrderId(null);
    setNextOrderNumber('');
    setFormError('');
    setSuccess('');
  };

  const startNewOrder = async () => {
    resetForm();
    setShowForm(true);
    try {
      const { data } = await api.get('/orders/next-number');
      if (!Number.isInteger(Number(data.next_number)) || Number(data.next_number) < 1) {
        throw new Error('El próximo número de pedido tiene un formato inválido.');
      }
      setNextOrderNumber(String(data.next_number));
    } catch (error) {
      setFormError(`No se pudo consultar el próximo número de pedido: ${errorMessage(error)}`);
    }
  };

  const editOrder = async (order) => {
    try {
      setFormError('');
      const { data } = await api.get(`/orders/${order.id}`);
      setSelectedClient({
        id: data.client_id,
        razon_social: data.client_name,
        direccion: data.client_direccion,
        numero: data.client_numero,
        telefono: data.client_telefono
      });
      setClientTerm(data.client_name || `Cliente ${data.client_id}`);
      setCart((data.items || []).map(item => ({
        id: item.product_id,
        name: item.name || `Producto ${item.product_id}`,
        sku: item.sku,
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        stock: item.stock,
        applyDiscount: Number(item.discount_percent) > 0 || !(Number(data.discount_percent) > 0)
      })));
      setDiscountPercent(String(Number(data.discount_percent) || 0));
      setDeliveryType(data.delivery_type || 'por reparto');
      setDeliveryDate(dateInputValue(data.delivery_date));
      setRepartidorId(data.repartidor_id ? String(data.repartidor_id) : '');
      setNotes(data.notes || '');
      setEditingOrderId(data.id);
      setNextOrderNumber(String(data.id));
      setShowForm(true);
    } catch (error) {
      Swal.fire('Error', `No se pudo cargar el pedido: ${errorMessage(error)}`, 'error');
    }
  };

  const deleteOrder = async (order) => {
    const confirmation = await Swal.fire({
      title: `¿Eliminar el pedido #${order.id}?`,
      text: 'Se eliminarán sus productos y se restaurará el stock.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c62839',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar pedido',
      cancelButtonText: 'Cancelar'
    });
    if (!confirmation.isConfirmed) return;

    try {
      await api.delete(`/orders/${order.id}`);
      await loadOrders();
      Swal.fire('Pedido eliminado', `El pedido #${order.id} fue eliminado.`, 'success');
    } catch (error) {
      Swal.fire('Error', `No se pudo eliminar el pedido: ${errorMessage(error)}`, 'error');
    }
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    if (!selectedClient) {
      setFormError('Seleccioná un cliente para continuar.');
      return;
    }
    if (cart.length === 0 || cart.some(item => !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0)) {
      setFormError('Agregá al menos un producto e ingresá cantidades mayores a cero.');
      return;
    }
    const discount = Number(discountPercent);
    if (!Number.isFinite(discount) || discount < 0 || discount > 25) {
      setFormError('El descuento debe estar entre 0% y 25%.');
      return;
    }
    if (!deliveryDate || deliveryDate < localDateValue(new Date())) {
      setFormError('La fecha de entrega no puede ser anterior a hoy.');
      return;
    }
    if (deliveryType === 'por reparto' && !repartidorId) {
      setFormError('Seleccioná un repartidor para la entrega por reparto.');
      return;
    }
    const stockProblem = editingOrderId ? null : cart.find(item => hasKnownStock(item.stock) && Number(item.quantity) > Number(item.stock));
    if (stockProblem) {
      setFormError(`Stock insuficiente para ${stockProblem.name}. Disponible: ${stockProblem.stock}.`);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        client_id: selectedClient.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: Number(item.quantity),
          unit_price: item.price,
          apply_discount: item.applyDiscount
        })),
        discount_percent: discount,
        delivery_type: deliveryType,
        delivery_date: deliveryDate,
        repartidor_id: deliveryType === 'por reparto' ? Number(repartidorId) : null,
        notes: notes.trim()
      };
      const { data } = editingOrderId
        ? await api.put(`/orders/${editingOrderId}`, payload)
        : await api.post('/orders', payload);
      setShowForm(false);
      resetForm();
      await loadOrders();
      await Swal.fire('Pedido guardado', `Pedido #${data.id} · Total: ${money(data.total_amount)}.`, 'success');
    } catch (error) {
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="orders-page">
      {showForm ? (isAdmin ? (
        <form className="orders-form" onSubmit={submitOrder}>
          <div className="orders-page-heading">
            <div>
              <span className="orders-eyebrow">VENTAS</span>
              <h3>{editingOrderId ? `Modificar pedido #${editingOrderId}` : 'Nuevo pedido'}</h3>
              <p>Buscá el cliente, agregá productos y confirmá la entrega.</p>
            </div>
            <div className="orders-number-field">
              <label htmlFor="orders-number">Nro. de pedido</label>
              <input id="orders-number" className="form-control" type="text" value={editingOrderId || nextOrderNumber} readOnly aria-readonly="true" />
            </div>
            <span className="orders-flow-hint">Enter para agregar el primer resultado</span>
          </div>

          <section className="orders-card orders-client-card" aria-labelledby="orders-client-title">
            <div className="orders-section-heading">
              <span className="orders-step">1</span>
              <div><h4 id="orders-client-title">Cliente</h4><p>Buscá por nombre, dirección, teléfono o número.</p></div>
            </div>
            <label className="orders-field-label" htmlFor="orders-client-search">Buscar cliente</label>
            <div className="orders-search-wrap">
              <input
                id="orders-client-search"
                className="form-control orders-search-input"
                type="search"
                autoComplete="off"
                placeholder="Ej.: almacén, calle o teléfono"
                value={clientTerm}
                onChange={event => {
                  setClientTerm(event.target.value);
                  setSelectedClient(null);
                  setClientMatches(EMPTY_ARRAY);
                  setFormError('');
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (clientMatches.length === 1) chooseClient(clientMatches[0]);
                  }
                }}
                aria-autocomplete="list"
                aria-expanded={clientMatches.length > 0}
                aria-controls="orders-client-results"
              />
              <SearchResults
                id="orders-client-results"
                label="Coincidencias de clientes"
                loading={clientLoading}
                error={clientError}
                items={clientMatches}
                renderItem={client => (
                  <button
                    className="orders-result-option"
                    key={client.id}
                    type="button"
                    role="option"
                    onClick={() => chooseClient(client)}
                  >
                    <span><strong>{clientLabel(client)}</strong><small>{[client.direccion, client.numero].filter(Boolean).join(' ')}{client.telefono ? ` · ${client.telefono}` : ''}</small></span>
                    <span className="orders-result-id">#{client.id}</span>
                  </button>
                )}
              />
            </div>
            {selectedClient && (
              <div className="orders-selected-client">
                <span className="orders-selected-check" aria-hidden="true">✓</span>
                <div><strong>{clientLabel(selectedClient)}</strong><small>{[selectedClient.direccion, selectedClient.numero].filter(Boolean).join(' ')}{selectedClient.telefono ? ` · ${selectedClient.telefono}` : ''}</small></div>
                <button type="button" className="orders-link-button" onClick={() => { setSelectedClient(null); setClientTerm(''); }}>Cambiar</button>
              </div>
            )}
          </section>

          <section className="orders-card orders-products-card" aria-labelledby="orders-products-title">
            <div className="orders-section-heading">
              <span className="orders-step">2</span>
              <div><h4 id="orders-products-title">Productos</h4><p>Buscá por descripción, código o código de barras.</p></div>
            </div>
            <label className="orders-field-label" htmlFor="orders-product-search">Agregar producto</label>
            <div className="orders-search-wrap">
              <input
                ref={productInput}
                id="orders-product-search"
                className="form-control orders-search-input"
                type="search"
                autoComplete="off"
                placeholder="Escribí o escaneá el producto"
                value={productTerm}
                onChange={event => {
                  setProductTerm(event.target.value);
                  setProductMatches(EMPTY_ARRAY);
                  setProductError('');
                  setFormError('');
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (productMatches.length === 1) addProduct(productMatches[0]);
                  }
                }}
                aria-autocomplete="list"
                aria-expanded={productMatches.length > 0}
                aria-controls="orders-product-results"
              />
              <SearchResults
                id="orders-product-results"
                label="Coincidencias de productos"
                loading={productLoading}
                error={productError}
                items={productMatches}
                renderItem={product => (
                  <button
                    className="orders-result-option orders-product-option"
                    key={product.id}
                    type="button"
                    role="option"
                    onClick={() => addProduct(product)}
                  >
                    <span><strong>{product.name}</strong><small>{product.sku ? `Código ${product.sku}` : `ID ${product.id}`} · Stock: {product.stock == null ? 's/d' : product.stock}</small></span>
                    <span className="orders-product-price">{product.price === null || product.price === undefined ? 'Sin precio' : money(product.price)}</span>
                    <span className="orders-add-mark" aria-hidden="true">+</span>
                  </button>
                )}
              />
            </div>

            <div className="orders-cart">
              <div className="orders-cart-heading">
                <strong>Detalle del pedido</strong>
                <span>{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</span>
              </div>
              <div className="orders-discount-control">
                <label className="orders-field-label" htmlFor="orders-discount">Descuento del pedido</label>
                <div className="orders-discount-input-wrap">
                  <input
                    id="orders-discount"
                    className="form-control"
                    type="number"
                    min="0"
                    max="25"
                    step="0.01"
                    value={discountPercent}
                    onChange={event => setDiscountPercent(event.target.value)}
                  />
                  <span>%</span>
                </div>
                <small>Se aplica a las líneas seleccionadas (máximo 25%).</small>
              </div>
              {cart.length === 0 ? (
                <div className="orders-cart-empty">Todavía no agregaste productos.</div>
              ) : (
                <div className="table-responsive">
                  <table className="table orders-cart-table">
                    <thead><tr><th>Producto</th><th className="orders-number-cell">Precio</th><th className="orders-quantity-cell">Cantidad</th><th className="orders-discount-cell">Dto.</th><th className="orders-number-cell">Importe</th><th><span className="visually-hidden">Acciones</span></th></tr></thead>
                    <tbody>
                      {cart.map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong><small>{item.sku ? `Código ${item.sku}` : `ID ${item.id}`}</small></td>
                          <td className="orders-number-cell">{money(item.price)}</td>
                          <td className="orders-quantity-cell">
                            <div className="orders-quantity-control">
                              <button type="button" aria-label={`Quitar una unidad de ${item.name}`} onClick={() => updateQuantity(item.id, Math.max(0, Number(item.quantity) - 1))}>−</button>
                              <input aria-label={`Cantidad de ${item.name}`} type="number" min="0" step="0.01" value={item.quantity} onChange={event => updateQuantity(item.id, event.target.value)} />
                              <button type="button" aria-label={`Agregar una unidad de ${item.name}`} onClick={() => updateQuantity(item.id, Number(item.quantity) + 1)}>+</button>
                            </div>
                          </td>
                          <td className="orders-discount-cell">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={item.applyDiscount}
                              disabled={Number(discountPercent) <= 0}
                              aria-label={`Aplicar descuento a ${item.name}`}
                              onChange={event => setCart(current => current.map(row => row.id === item.id ? { ...row, applyDiscount: event.target.checked } : row))}
                            />
                          </td>
                          <td className="orders-number-cell orders-line-total">
                            {money((item.price * (Number(item.quantity) || 0)) * (item.applyDiscount ? 1 - (Number(discountPercent) || 0) / 100 : 1))}
                          </td>
                          <td><button className="orders-remove-button" type="button" aria-label={`Quitar ${item.name} del pedido`} onClick={() => setCart(current => current.filter(row => row.id !== item.id))}>Quitar</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="orders-summary-rows">
                <div><span>Subtotal</span><strong>{money(orderSubtotal)}</strong></div>
                <div><span>Descuento aplicado</span><strong>− {money(discountAmount)}</strong></div>
                <div className="orders-total-row"><span>Total</span><strong>{money(orderTotal)}</strong></div>
              </div>
            </div>
          </section>

          <section className="orders-card orders-delivery-card" aria-labelledby="orders-delivery-title">
            <div className="orders-section-heading">
              <span className="orders-step">3</span>
              <div><h4 id="orders-delivery-title">Entrega y observaciones</h4><p>Definí cuándo y cómo se entrega el pedido.</p></div>
            </div>
            <div className="orders-delivery-grid">
              <fieldset className="orders-delivery-options">
                <legend className="orders-field-label">Modalidad</legend>
                {[
                  ['por reparto', 'Reparto'],
                  ['deposito', 'Depósito'],
                  ['otros', 'Otros']
                ].map(([value, label]) => (
                  <label className={`orders-delivery-option${deliveryType === value ? ' is-selected' : ''}`} key={value}>
                    <input type="radio" name="deliveryType" value={value} checked={deliveryType === value} onChange={() => { setDeliveryType(value); setFormError(''); }} />
                    <span>{label}</span>
                  </label>
                ))}
              </fieldset>
              <div className="orders-delivery-fields">
                <label className="orders-field-label" htmlFor="orders-delivery-date">Fecha de entrega</label>
                <input id="orders-delivery-date" className="form-control" type="date" min={localDateValue(new Date())} value={deliveryDate} onChange={event => setDeliveryDate(event.target.value)} />
                {deliveryType === 'por reparto' && (
                  <>
                    <label className="orders-field-label orders-repartidor-label" htmlFor="orders-repartidor">Repartidor</label>
                    <select id="orders-repartidor" className="form-select" value={repartidorId} onChange={event => setRepartidorId(event.target.value)}>
                      <option value="">Seleccioná un repartidor</option>
                      {repartidores.map(repartidor => <option key={repartidor.id} value={repartidor.id}>{repartidor.nombre}</option>)}
                    </select>
                    {repartidoresError && <span className="orders-inline-error" role="alert">No se pudo cargar el catálogo de repartidores: {repartidoresError}</span>}
                  </>
                )}
              </div>
              <div className="orders-notes-field">
                <label className="orders-field-label" htmlFor="orders-notes">Observaciones <span>(opcional)</span></label>
                <textarea id="orders-notes" className="form-control" rows="3" maxLength="255" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Indicaciones para preparar o entregar el pedido" />
                <small>{notes.length}/255</small>
              </div>
            </div>
          </section>

          {formError && <div className="orders-alert is-error" role="alert">{formError}</div>}
          {success && <div className="orders-alert is-success" role="status">{success}</div>}
          <div className="orders-submit-row">
            <span>El pedido se guardará con los precios mostrados.</span>
            <div className="orders-submit-actions">
              <button type="button" className="btn orders-cancel-button" disabled={submitting} onClick={() => { resetForm(); setShowForm(false); }}>Cancelar</button>
              <button type="submit" className="btn orders-submit-button" disabled={submitting}>
                {submitting ? 'Guardando...' : editingOrderId ? 'Guardar cambios' : 'Confirmar pedido'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="orders-readonly-notice" role="status">Tu perfil permite consultar pedidos, pero no crear nuevos.</div>
      )) : (
        <section className="orders-history" aria-labelledby="orders-history-title">
          <div className="orders-history-heading">
            <div><span className="orders-eyebrow">VENTAS</span><h3 id="orders-history-title">Pedidos</h3></div>
            <div className="orders-list-actions">
              <input
                className="form-control orders-list-search"
                type="search"
                placeholder="Buscar por pedido, cliente o estado"
                aria-label="Buscar pedidos"
                value={orderSearch}
                onChange={event => { setOrderSearch(event.target.value); setOrderPage(1); }}
              />
              <button type="button" className="orders-refresh-button" onClick={loadOrders}>Actualizar</button>
              {isAdmin && <button type="button" className="btn orders-submit-button" onClick={startNewOrder}>+ Agregar pedido</button>}
            </div>
          </div>
          {ordersError ? (
            <div className="orders-alert is-error" role="alert">No se pudieron cargar los pedidos: {ordersError}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="orders-cart-empty">{orderSearch ? 'No hay pedidos que coincidan con la búsqueda.' : 'No hay pedidos para mostrar.'}</div>
          ) : (
            <>
              <div className="table-responsive orders-history-table-wrap">
                <table className="table orders-history-table">
                  <thead><tr>{isAdmin && <th>Acciones</th>}<th>Número</th><th>Cliente</th><th>Fecha</th><th>Entrega</th><th>Modalidad</th><th>Estado</th><th className="orders-number-cell">Total</th></tr></thead>
                  <tbody>
                    {visibleOrders.map(order => (
                      <tr key={order.id}>
                        {isAdmin && <td>
                          <div className="orders-row-actions">
                            <button type="button" className="orders-action-button" title="Modificar pedido" aria-label={`Modificar pedido ${order.id}`} onClick={() => editOrder(order)}>✎</button>
                            <button type="button" className="orders-action-button is-delete" title="Eliminar pedido" aria-label={`Eliminar pedido ${order.id}`} onClick={() => deleteOrder(order)}>×</button>
                          </div>
                        </td>}
                        <td><strong>#{order.id}</strong></td>
                        <td>{order.client_name || `Cliente ${order.client_id}`}</td>
                        <td>{formatDate(order.created_at)}</td>
                        <td>{formatDate(order.delivery_date, true)}</td>
                        <td>{order.delivery_type || '—'}</td>
                        <td><span className="orders-status">{order.status || '—'}</span></td>
                        <td className="orders-number-cell">{money(order.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationFooter page={safeOrderPage} pageSize={PAGE_SIZE} total={filteredOrders.length} onPageChange={setOrderPage} />
            </>
          )}
        </section>
      )}
    </section>
  );
}
