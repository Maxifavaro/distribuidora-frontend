import React from 'react';
import useStore from '../store';

export default function TopNav({ active, onSelect }) {
  const { permission, logout, user } = useStore();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <button className="navbar-brand btn btn-link" style={{ textDecoration: 'none', color: '#212529', backgroundColor: 'white', borderRadius: '4px', padding: '8px 16px' }} onClick={() => onSelect('home')}>Distribuidora</button>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Menu
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><button className={`dropdown-item ${active === 'providers' ? 'active' : ''}`} onClick={() => onSelect('providers')}>🏪 Proveedores</button></li>
                <li><button className={`dropdown-item ${active === 'clients' ? 'active' : ''}`} onClick={() => onSelect('clients')}>👥 Clientes</button></li>
                <li><button className={`dropdown-item ${active === 'products' ? 'active' : ''}`} onClick={() => onSelect('products')}>📦 Productos</button></li>
                <li><button className={`dropdown-item ${active === 'orders' ? 'active' : ''}`} onClick={() => onSelect('orders')}>📋 Pedidos</button></li>
                <li><button className={`dropdown-item ${active === 'statistics' ? 'active' : ''}`} onClick={() => onSelect('statistics')}>📊 Estadísticas</button></li>
                {permission === 'admin' && (
                  <>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className={`dropdown-item ${active === 'users' ? 'active' : ''}`} onClick={() => onSelect('users')}><span className="badge bg-success">👤</span> Usuarios</button></li>
                  </>
                )}
              </ul>
            </li>
          </ul>
          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="navbar-text text-light small">
              {user?.username} <span className="badge bg-secondary">{user?.permission}</span>
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={() => logout()}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
