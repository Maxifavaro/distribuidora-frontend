import React from 'react';

export default function UserList({ users, search, onSearch, loading, onEdit, onRemove }) {
  const term = search.trim().toLocaleLowerCase();
  const filteredUsers = users.filter(user =>
    `${user.apellido} ${user.nombre} ${user.username} ${user.permission}`.toLocaleLowerCase().includes(term));

  return (
    <>
      <input className="form-control mb-3" placeholder="Buscar por empleado, usuario o permiso" aria-label="Buscar usuario" value={search} onChange={e => onSearch(e.target.value)} />
      {loading ? <p>Cargando usuarios...</p> : filteredUsers.length === 0 ? <div className="alert alert-info">No hay usuarios para mostrar.</div> : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead><tr><th>Empleado</th><th>Usuario</th><th>Permiso</th><th>Acciones</th></tr></thead>
            <tbody>{filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.apellido}, {user.nombre} ({user.id})</td><td>{user.username}</td><td>{user.permission}</td>
                <td><button className="btn btn-sm btn-primary me-2" onClick={() => onEdit(user)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onRemove(user)}>Eliminar acceso</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
