import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store';

/**
 * TopNav Dinámico
 * Lee la estructura del sistema de la base de datos
 * Renderiza menú sin iconos, solo nombres de módulos
 */
export default function TopNav({ active, onSelect }) {
  const { permission, logout, user, sections } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  // NOTE: fetchSections is called from App.jsx, not here
  // This avoids calling it without authentication token

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (key) => {
    setMenuOpen(false);
    onSelect(key);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container-fluid">
        <button 
          className="navbar-brand btn btn-link" 
          style={{ textDecoration: 'none', color: '#212529', backgroundColor: 'white', borderRadius: '4px', padding: '8px 16px' }} 
          onClick={() => onSelect('home')}
        >
          Distribuidora
        </button>
        <button 
          className="navbar-toggler" 
          type="button" 
          aria-expanded={navOpen}
          aria-label="Toggle navigation"
          onClick={() => setNavOpen(prev => !prev)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown" ref={dropdownRef}>
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                role="button" 
                aria-expanded={menuOpen}
                onClick={(e) => { e.preventDefault(); setMenuOpen(prev => !prev); }}
              >
                Menú
              </a>
              <ul className={`dropdown-menu ${menuOpen ? 'show' : ''}`}>
                {sections && sections.length > 0 ? (
                  sections.map((section, idx) => (
                    <li key={section.key}>
                      <button 
                        className={`dropdown-item ${active === section.key ? 'active' : ''}`} 
                        onClick={() => handleSelect(section.key)}
                      >
                        {section.name}
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <span className="dropdown-item disabled">Cargando módulos...</span>
                  </li>
                )}
              </ul>
            </li>
          </ul>
          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="navbar-text text-light small">
              {user?.username} <span className="badge bg-secondary">{user?.permission}</span>
            </span>
            <button className="btn btn-outline-danger btn-sm" onClick={() => logout()}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
