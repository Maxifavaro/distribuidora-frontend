import React, { useState } from 'react';
import useStore from '../store';

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
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Iniciar Sesión</h5>
              <form onSubmit={onSubmit}>
                <div className="mb-2">
                  <input className="form-control" placeholder="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div className="mb-3">
                  <input className="form-control" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="d-grid">
                  <button className="btn btn-primary" type="submit" disabled={loading}>Login</button>
                </div>
                {error && <div className="mt-2 text-danger">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
