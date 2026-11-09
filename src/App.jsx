import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import TopNav from './components/TopNav';
import Statistics from './components/Statistics';
import Login from './components/Login';
import DynamicModule from './components/DynamicModule';
import Clients from './components/Clients/Clients';
import Employees from './components/Employees/Employees';
import Users from './components/Users/Users';
import useStore from './store';

export default function App() {
  const [active, setActive] = useState('home');
  const [navCounter, setNavCounter] = useState(0);
  const handleSelect = (key) => {
    setActive(key);
    setNavCounter(n => n + 1);
  };
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const { token, sections, fetchSections, loading } = useStore();

  useEffect(() => {
    if (token) {
      fetchSections()
        .then(() => setSectionsLoaded(true))
        .catch(err => {
          console.error('Error loading sections:', err);
          setSectionsLoaded(true);
        });
    }
  }, [token, fetchSections]);

  if (!token) return <Login />;

  const getModuleTitle = () => {
    if (active === 'home') return 'Inicio';
    if (active === 'statistics') return 'Estadísticas';
    const section = sections.find(s => s.key === active);
    return section ? section.name : active.charAt(0).toUpperCase() + active.slice(1);
  };

  if (loading && !sectionsLoaded) {
    return (
      <div className="app-layout">
        <TopNav active={active} onSelect={handleSelect} />
        <div className="app-main container-fluid my-4">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando módulos...</span>
            </div>
            <p className="mt-2">Cargando módulos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <TopNav active={active} onSelect={handleSelect} />
      <div className="app-main">
      {active === 'home' ? (
        <Home />
      ) : (
        <div className="container-fluid my-4 module-page">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">{getModuleTitle()}</h2>
          </div>

          {active === 'statistics' && <Statistics key={navCounter} />}
          {active === 'users' && <Users key={navCounter} />}
          {active === 'clients' && <Clients key={navCounter} />}
          {active === 'empleados' && <Employees key={navCounter} />}
          {!['statistics', 'home', 'users', 'clients', 'empleados'].includes(active) && <DynamicModule key={`${active}-${navCounter}`} sectionKey={active} />}
        </div>
      )}
      </div>
    </div>
  );
}
