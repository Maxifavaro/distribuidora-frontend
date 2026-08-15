import React from 'react';

/**
 * Tabla de proveedores con mayores compras
 * @param {Object} props
 * @param {Array} props.providers - Lista de proveedores
 */
const ProvidersTable = ({ providers }) => {
  return (
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
        {providers.map((provider, index) => (
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
  );
};

export default ProvidersTable;
