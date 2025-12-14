import React from 'react';
import useStore from '../store';

export default function Home() {
  const { user } = useStore();

  return (
    <div className="container-fluid py-5">
      <div className="row align-items-center min-vh-100">
        <div className="col-lg-6 text-center mb-4 mb-lg-0">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=500&fit=crop"
            alt="Distribuidora"
            className="img-fluid rounded-lg shadow-lg"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        <div className="col-lg-6">
          <div className="ps-lg-5">
            <h1 className="display-4 fw-bold mb-4">
              ¡Bienvenido, {user?.username}!
            </h1>
            <p className="lead text-muted mb-4">
              Gestión integral de tu distribuidora de bebidas. Administra proveedores, clientes, productos y pedidos desde un único lugar.
            </p>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-start">
                <div className="badge bg-primary me-3 p-2 mt-1">📦</div>
                <div>
                  <h5 className="mb-1">Productos</h5>
                  <p className="text-muted small">Gestiona tu catálogo de bebidas y stock</p>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="badge bg-success me-3 p-2 mt-1">👥</div>
                <div>
                  <h5 className="mb-1">Clientes y Proveedores</h5>
                  <p className="text-muted small">Administra tus contactos comerciales</p>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="badge bg-info me-3 p-2 mt-1">📋</div>
                <div>
                  <h5 className="mb-1">Pedidos</h5>
                  <p className="text-muted small">Crea y gestiona órdenes de compra y venta</p>
                </div>
              </div>
            </div>
            <p className="text-muted mt-5 small">
              👉 Selecciona una opción en el menú superior para comenzar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
