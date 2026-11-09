import React, { useEffect, useRef, useState } from 'react';
import useStore from '../store';
import logo from '../../img/ommi LOGO (4).png';

const GROUPS = [
  { key: 'archivo', label: 'Archivo', icon: 'archive' },
  { key: 'compras', label: 'Compras', icon: 'purchases' },
  { key: 'ventas', label: 'Ventas', icon: 'sales' }
];

function groupFor(key) {
  if (key === 'providers') return 'compras';
  if (key === 'orders' || key === 'statistics') return 'ventas';
  return 'archivo';
}

function Icon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" /></>,
    archive: <><path d="M4 7h16v13H4zM3 4h18v3H3z" /><path d="M9 11h6" /></>,
    purchases: <><path d="M3 4h2l2 11h11l3-8H6" /><circle cx="9" cy="19" r="1" /><circle cx="18" cy="19" r="1" /></>,
    sales: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>
  };
  return <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function TopNav({ active, onSelect }) {
  const { logout, user, sections = [], loading, sectionsError, fetchSections } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState({ archivo: true, compras: true, ventas: true });
  const menuButton = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleSelect = (key) => {
    setMobileOpen(false);
    onSelect(key);
  };

  return (
    <>
      <header className="mobile-nav-bar">
        <button ref={menuButton} type="button" className="mobile-nav-toggle" aria-label="Abrir menú" aria-expanded={mobileOpen} aria-controls="app-sidebar" onClick={() => setMobileOpen(true)}>
          <Icon name="menu" />
        </button>
        <span>OMMI <small>GESTIÓN</small></span>
      </header>
      {mobileOpen && <button className="sidebar-backdrop" type="button" aria-label="Cerrar menú" tabIndex={-1} onClick={() => setMobileOpen(false)} />}
      <aside id="app-sidebar" className={`app-sidebar${mobileOpen ? ' is-open' : ''}`} aria-label="Menú principal">
        <div className="sidebar-brand">
          <button type="button" className="sidebar-brand-link" onClick={() => handleSelect('home')} aria-label="Ir al inicio">
            <img src={logo} alt="" />
            <span className="sidebar-brand-text">OMMI <small>GESTIÓN COMERCIAL</small></span>
          </button>
          <button type="button" className="sidebar-close" aria-label="Cerrar menú" onClick={() => { setMobileOpen(false); menuButton.current?.focus(); }}>
            <Icon name="close" />
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Navegación">
          <p className="sidebar-caption">MENÚ PRINCIPAL</p>
          <button type="button" className={`sidebar-home${active === 'home' ? ' is-active' : ''}`} aria-current={active === 'home' ? 'page' : undefined} onClick={() => handleSelect('home')}>
            <Icon name="home" /><span>Inicio</span>
          </button>
          {GROUPS.map(group => {
            const items = sections.filter(section => groupFor(section.key) === group.key);
            return (
              <div className="sidebar-group" key={group.key}>
                <button type="button" className="sidebar-group-toggle" aria-expanded={openGroups[group.key]} aria-controls={`sidebar-${group.key}`}
                  onClick={() => setOpenGroups(previous => ({ ...previous, [group.key]: !previous[group.key] }))}>
                  <Icon name={group.icon} /><span>{group.label}</span><span className={`sidebar-chevron${openGroups[group.key] ? ' is-open' : ''}`} aria-hidden="true">⌄</span>
                </button>
                <ul id={`sidebar-${group.key}`} className="sidebar-items" hidden={!openGroups[group.key]}>
                  {items.map(section => (
                    <li key={section.key}>
                      <button type="button" className={`sidebar-item${active === section.key ? ' is-active' : ''}`}
                        aria-current={active === section.key ? 'page' : undefined} onClick={() => handleSelect(section.key)}>
                        {section.key === 'statistics' ? 'Estadísticas' : section.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {sections.length === 0 && (
            <div className="sidebar-status" role={sectionsError ? 'alert' : 'status'}>
              {loading ? 'Cargando módulos...' : sectionsError ? 'No se pudieron cargar los módulos.' : 'No hay módulos disponibles.'}
              {!loading && <button type="button" onClick={() => fetchSections().catch(() => {})}>Reintentar</button>}
            </div>
          )}
        </nav>
        <div className="sidebar-account">
          <div className="sidebar-avatar" aria-hidden="true">{user?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="sidebar-account-info"><strong>{user?.username}</strong><span>{user?.permission === 'admin' ? 'Administrador' : 'Lectura'}</span></div>
          <button type="button" className="sidebar-logout" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión"><Icon name="logout" /></button>
        </div>
      </aside>
    </>
  );
}
