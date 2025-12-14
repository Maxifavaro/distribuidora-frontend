import React, { useState } from 'react';
import Home from './components/Home';
import Providers from './components/Providers';
import Clients from './components/Clients';
import Products from './components/Products';
import TopNav from './components/TopNav';
import Orders from './components/Orders';
import Users from './components/Users';
import Statistics from './components/Statistics';
import Login from './components/Login';
import useStore from './store';

export default function App() {
  const [active, setActive] = useState('home');
  const { token, logout, user } = useStore();

  if (!token) return <Login />;

  return (
    <div>
      <TopNav active={active} onSelect={setActive} />
      {active === 'home' ? (
        <Home />
      ) : (
        <div className="container my-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>{active.charAt(0).toUpperCase() + active.slice(1)}</h2>
            <div>
              <span className="me-3">{user?.username} ({user?.permission})</span>
              <button className="btn btn-outline-secondary btn-sm" onClick={() => logout()}>Logout</button>
            </div>
          </div>

          {active === 'providers' && <Providers />}
          {active === 'clients' && <Clients />}
          {active === 'products' && <Products />}
          {active === 'orders' && <Orders />}
          {active === 'users' && <Users />}
          {active === 'statistics' && <Statistics />}
        </div>
      )}
    </div>
  );
}
