import React from 'react';

const MODULES = {
  clients: { title: 'Directorio comercial', description: 'Administrá la información y los datos de contacto de tus clientes.', singular: 'cliente', plural: 'clientes' },
  providers: { title: 'Directorio de proveedores', description: 'Administrá la información y los datos de contacto de tus proveedores.', singular: 'proveedor', plural: 'proveedores' },
  products: { title: 'Catálogo de productos', description: 'Administrá la información de los productos de tu catálogo.', singular: 'producto', plural: 'productos' },
  rubros: { title: 'Catálogo de rubros', description: 'Administrá los rubros de tus productos.', singular: 'rubro', plural: 'rubros' },
  marcas: { title: 'Catálogo de marcas', description: 'Administrá las marcas de tus productos.', singular: 'marca', plural: 'marcas' },
  orders: { title: 'Gestión de pedidos', description: 'Administrá los pedidos registrados.', singular: 'pedido', plural: 'pedidos' },
  empleados: { title: 'Directorio de empleados', description: 'Administrá la información de tus empleados.', singular: 'empleado', plural: 'empleados' },
  categoria: { title: 'Categorías de empleados', description: 'Administrá las categorías de tus empleados.', singular: 'categoría', plural: 'categorías' },
  listaprecio: { title: 'Listas de precios', description: 'Administrá las listas de precios disponibles.', singular: 'lista', plural: 'listas' },
  condiva: { title: 'Condiciones de IVA', description: 'Administrá las condiciones de IVA disponibles.', singular: 'condición', plural: 'condiciones' },
  users: { title: 'Gestión de accesos', description: 'Administrá los usuarios y permisos de tus empleados.', singular: 'usuario', plural: 'usuarios' }
};

export function getModuleDetails(moduleKey, sectionName) {
  return MODULES[moduleKey] || {
    title: sectionName,
    description: 'Administrá los registros de esta sección.',
    singular: 'registro',
    plural: 'registros'
  };
}

export default function ModuleSummary({ moduleKey, sectionName, count }) {
  const details = getModuleDetails(moduleKey, sectionName);

  return (
    <header className="client-module-header">
      <div>
        <span className="client-module-eyebrow">{details.title}</span>
        <p>{details.description}</p>
      </div>
      <div className="client-module-count">
        <strong>{count}</strong>
        <span>{count === 1 ? details.singular : details.plural}</span>
      </div>
    </header>
  );
}
