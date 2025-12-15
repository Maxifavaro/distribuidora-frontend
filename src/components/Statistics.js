import React, { useEffect, useState } from 'react';
import useStore from '../store';

export default function Statistics() {
  const store = useStore();
  const { token, fetchTopProducts, fetchTopProviders, fetchTopClients, fetchClientProducts } = store;
  const [topProducts, setTopProducts] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [expandedClient, setExpandedClient] = useState(null);
  const [clientProducts, setClientProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState({});

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const [products, providers, clients] = await Promise.all([
        fetchTopProducts ? fetchTopProducts() : Promise.resolve([]),
        fetchTopProviders ? fetchTopProviders() : Promise.resolve([]),
        fetchTopClients ? fetchTopClients() : Promise.resolve([])
      ]);
      setTopProducts(products || []);
      setTopProviders(providers || []);
      setTopClients(clients || []);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClientProducts = async (clientId) => {
    if (expandedClient === clientId) {
      setExpandedClient(null);
      return;
    }

    if (!clientProducts[clientId]) {
      setLoadingProducts({ ...loadingProducts, [clientId]: true });
      try {
        const products = await fetchClientProducts(clientId);
        setClientProducts({ ...clientProducts, [clientId]: products });
      } catch (error) {
        console.error('Error loading client products:', error);
      } finally {
        setLoadingProducts({ ...loadingProducts, [clientId]: false });
      }
    }
    
    setExpandedClient(clientId);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h2>📊 Estadísticas</h2>
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>📊 Estadísticas - Últimos 30 días</h2>

      {/* Productos más vendidos */}
      <div className="card mt-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">🏆 Productos Más Vendidos</h5>
        </div>
        <div className="card-body">
          {topProducts.length === 0 ? (
            <p className="text-muted">No hay datos de ventas en los últimos 30 días</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Cantidad Vendida</th>
                    <th>Ingresos Totales</th>
                    <th>Pedidos</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && (index + 1)}
                      </td>
                      <td><strong>{product.name}</strong></td>
                      <td>{product.sku || 'N/A'}</td>
                      <td>{product.total_quantity} unidades</td>
                      <td className="text-success fw-bold">${parseFloat(product.total_revenue).toFixed(2)}</td>
                      <td>{product.order_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Proveedores que más compraron */}
      <div className="card mt-4 mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">🚚 Proveedores - Mayores Compras</h5>
        </div>
        <div className="card-body">
          {topProviders.length === 0 ? (
            <p className="text-muted">No hay datos de compras en los últimos 30 días</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Proveedor</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    <th>Pedidos</th>
                    <th>Total Items</th>
                    <th>Monto Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topProviders.map((provider, index) => (
                    <tr key={provider.id}>
                      <td>
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && (index + 1)}
                      </td>
                      <td><strong>{provider.name}</strong></td>
                      <td>{provider.contact || 'N/A'}</td>
                      <td>{provider.phone || 'N/A'}</td>
                      <td>{provider.order_count}</td>
                      <td>{provider.total_items} unidades</td>
                      <td className="text-success fw-bold">${parseFloat(provider.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Clientes que más compraron */}
      <div className="card mt-4 mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">👥 Clientes - Mayores Compras</h5>
        </div>
        <div className="card-body">
          {topClients.length === 0 ? (
            <p className="text-muted">No hay datos de clientes en los últimos 30 días</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th></th>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Pedidos</th>
                    <th>Total Items</th>
                    <th>Monto Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topClients.map((client, index) => (
                    <React.Fragment key={client.id}>
                      <tr>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => toggleClientProducts(client.id)}
                            title="Ver productos"
                          >
                            {expandedClient === client.id ? '−' : '+'}
                          </button>
                        </td>
                        <td>
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && (index + 1)}
                        </td>
                        <td><strong>{client.name}</strong></td>
                        <td>{client.phone || 'N/A'}</td>
                        <td>{client.email || 'N/A'}</td>
                        <td>{client.order_count}</td>
                        <td>{client.total_items} unidades</td>
                        <td className="text-success fw-bold">${parseFloat(client.total_amount).toFixed(2)}</td>
                      </tr>
                      {expandedClient === client.id && (
                        <tr>
                          <td colSpan="8" className="bg-light">
                            {loadingProducts[client.id] ? (
                              <div className="text-center py-3">
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </div>
                            ) : (
                              <div className="p-3">
                                <h6 className="mb-3">📦 Productos Comprados</h6>
                                {clientProducts[client.id]?.length > 0 ? (
                                  <table className="table table-sm table-bordered">
                                    <thead className="table-secondary">
                                      <tr>
                                        <th>Producto</th>
                                        <th>SKU</th>
                                        <th>Cantidad Total</th>
                                        <th>Total Gastado</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {clientProducts[client.id].map(product => (
                                        <tr key={product.id}>
                                          <td>{product.name}</td>
                                          <td>{product.sku || 'N/A'}</td>
                                          <td>{product.total_quantity} unidades</td>
                                          <td className="text-success">${parseFloat(product.total_spent).toFixed(2)}</td>
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
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mb-4">
        <button className="btn btn-primary" onClick={loadStatistics}>
          🔄 Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
}
