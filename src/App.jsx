import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import TopNav from './components/TopNav';
import Statistics from './components/Statistics';
import Login from './components/Login';
import DynamicModule from './components/DynamicModule';
import useStore from './store';

export default function App() {
  const [active, setActive] = useState('home');
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const { token, logout, user, sections, fetchSections, loading } = useStore();

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
      <div>
        <TopNav active={active} onSelect={setActive} />
        <div className="container-fluid my-4">
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
    <div>
      <TopNav active={active} onSelect={setActive} />
      {active === 'home' ? (
        <Home />
      ) : (
        <div className="container-fluid my-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{getModuleTitle()}</h2>
            <div>
              <span className="me-3">{user?.username} ({user?.permission})</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => logout()}>Logout</button>
            </div>
          </div>

          {active === 'statistics' && <Statistics />}
          {active !== 'statistics' && active !== 'home' && <DynamicModule sectionKey={active} />}
        </div>
      )}
    </div>
  );
}
