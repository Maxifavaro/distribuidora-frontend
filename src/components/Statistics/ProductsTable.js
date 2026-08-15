import React from 'react';

/**
 * Tabla de productos más vendidos
 * @param {Object} props
 * @param {Array} props.products - Lista de productos
 */
const ProductsTable = ({ products }) => {
  return (
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
        {products.map((product, index) => (
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
  );
};

export default ProductsTable;
