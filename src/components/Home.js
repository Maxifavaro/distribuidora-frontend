import React from 'react';
import useStore from '../store';
import logo from '../../img/ommi LOGO (4).png';

export default function Home() {
  const { user } = useStore();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">TU ESPACIO DE TRABAJO</span>
          <h1>¡Bienvenido, {user?.username}!</h1>
          <p>Todo lo que necesitás para gestionar tu distribuidora, en un solo lugar.</p>
          <div className="home-hint">Seleccioná una opción del menú lateral para comenzar <span aria-hidden="true">←</span></div>
        </div>
        <div className="home-logo">
          <img src={logo} alt="Distribuidora Ommi" />
        </div>
      </section>
      <section className="home-overview" aria-label="Áreas de gestión">
        <div className="home-section-heading">
          <span className="home-eyebrow">TU NEGOCIO, ORGANIZADO</span>
          <h2>Una gestión más simple</h2>
        </div>
        <div className="home-feature-grid">
          <div className="home-feature">
            <span className="home-feature-icon" aria-hidden="true">01</span>
            <h3>Productos</h3>
            <p>Gestioná tu catálogo de bebidas y stock.</p>
          </div>
          <div className="home-feature">
            <span className="home-feature-icon" aria-hidden="true">02</span>
            <h3>Clientes y proveedores</h3>
            <p>Administrá tus contactos comerciales.</p>
          </div>
          <div className="home-feature">
            <span className="home-feature-icon" aria-hidden="true">03</span>
            <h3>Pedidos</h3>
            <p>Creá y gestioná órdenes de compra y venta.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
