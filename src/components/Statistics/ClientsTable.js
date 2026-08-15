import React from 'react';

/**
 * Tabla de clientes con mayores compras (con expansión de productos)
 * @param {Object} props
 * @param {Array} props.clients - Lista de clientes
 * @param {number} props.expandedClient - ID del cliente expandido
 * @param {Function} props.onToggleClient - Handler para expandir/colapsar cliente
 * @param {Object} props.clientProducts - Productos por cliente
 * @param {Object} props.loadingProducts - Estado de carga de productos
 */
const ClientsTable = ({ 
  clients, 
  expandedClient, 
  onToggleClient, 
  clientProducts, 
  loadingProducts 
}) => {
  return (
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
        {clients.map((client, index) => (
          <React.Fragment key={client.id}>
            <tr>
              <td>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => onToggleClient(client.id)}
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
  );
};

export default ClientsTable;
