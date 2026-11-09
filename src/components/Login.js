import React, { useState } from 'react';
import useStore from '../store';
import logo from '../../img/ommi LOGO (4).png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useStore();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch (err) {
      // error handled in store
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <img src={logo} alt="Distribuidora Ommi" />
          <span>GESTIÓN COMERCIAL</span>
        </div>
        <h1>Bienvenido de nuevo</h1>
        <p>Ingresá a tu cuenta para continuar.</p>
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="login-username">Usuario</label>
            <input id="login-username" className="form-control" placeholder="Ingresá tu usuario" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="login-password">Contraseña</label>
            <input id="login-password" className="form-control" placeholder="Ingresá tu contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="d-grid">
            <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
