import React, { useEffect, useState } from 'react';
import PaginationFooter from '../shared/PaginationFooter';

const PAGE_SIZE = 10;

export default function UserList({ users, search, onSearch, loading, onEdit, onRemove, onCreate }) {
  const [page, setPage] = useState(1);
  const term = search.trim().toLocaleLowerCase();
  const filteredUsers = users.filter(user =>
    `${user.id} ${user.apellido} ${user.nombre} ${user.username} ${user.permission}`.toLocaleLowerCase().includes(term));
  useEffect(() => { setPage(1); }, [search, users]);
  const safePage = Math.min(page, Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE)));
  const visibleUsers = filteredUsers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <div className="dynamic-module-toolbar client-module-toolbar mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
        <div className="d-flex gap-2 align-items-center client-module-search-group">
          <input className="form-control" placeholder="Buscar por empleado, usuario o permiso" aria-label="Buscar usuario" value={search} onChange={e => onSearch(e.target.value)} />
          {onCreate && (
            <button className="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0" onClick={onCreate} title="Crear usuario">
              <span aria-hidden="true">+</span><span>Nuevo usuario</span>
            </button>
          )}
        </div>
      </div>
      {loading ? <p>Cargando usuarios...</p> : filteredUsers.length === 0 ? <div className="alert alert-info">No hay usuarios para mostrar.</div> : (
        <>
        <div className="table-responsive">
          <table className="table table-striped table-hover abm-grid-table">
            <thead><tr><th>Acciones</th><th>Código</th><th>Empleado</th><th>Usuario</th><th>Permiso</th></tr></thead>
            <tbody>{visibleUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <button className="btn btn-outline-primary" onClick={() => onEdit(user)} title="Editar" aria-label="Editar">
                      ✏️
                    </button>
                    <button className="btn btn-outline-danger" onClick={() => onRemove(user)} title="Eliminar acceso" aria-label="Eliminar acceso">
                      🗑️
                    </button>
                  </div>
                </td>
                <td>{user.id}</td><td>{user.apellido}, {user.nombre}</td><td>{user.username}</td><td>{user.permission}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <PaginationFooter page={safePage} pageSize={PAGE_SIZE} total={filteredUsers.length} filteredFrom={term ? users.length : null} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
