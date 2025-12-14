import React, { useEffect, useState } from 'react';
import useStore from '../store';
import Swal from 'sweetalert2';

export default function Users() {
  const { users, fetchUsers, createUser, updateUser, deleteUser, permission } = useStore();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (permission === 'admin') {
      setLoading(true);
      fetchUsers().finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (Array.isArray(users)) {
      const filtered = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.permission.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const handleCreateUser = async () => {
    const { value: result } = await Swal.fire({
      title: 'Crear Nuevo Usuario',
      html: `
        <div style="text-align: left;">
          <label>Username:</label>
          <input id="username" class="swal2-input" type="text" placeholder="Username" style="width: 100%; margin: 10px 0;">
          <label>Password:</label>
          <input id="password" class="swal2-input" type="password" placeholder="Password" style="width: 100%; margin: 10px 0;">
          <label>Permiso:</label>
          <select id="permission" class="swal2-input" style="width: 100%; margin: 10px 0;">
            <option>admin</option>
            <option>read</option>
          </select>
        </div>
      `,
      confirmButtonText: 'Crear',
      showCancelButton: true,
      preConfirm: () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const permission = document.getElementById('permission').value;
        if (!username || !password || !permission) {
          Swal.showValidationMessage('Todos los campos son requeridos');
          return false;
        }
        return { username, password, permission };
      }
    });

    if (result) {
      try {
        await createUser(result);
        Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        await fetchUsers();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleEditPassword = async (user) => {
    const { value: newPassword } = await Swal.fire({
      title: `Cambiar Contraseña de ${user.username}`,
      input: 'password',
      inputPlaceholder: 'Nueva contraseña',
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor ingresa una contraseña';
        }
        if (value.length < 3) {
          return 'La contraseña debe tener al menos 3 caracteres';
        }
      }
    });

    if (newPassword) {
      try {
        await updateUser(user.id, { password: newPassword });
        Swal.fire('Éxito', `Contraseña de ${user.username} actualizada`, 'success');
        await fetchUsers();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el usuario "${user.username}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(user.id);
        Swal.fire('Eliminado', `Usuario ${user.username} eliminado`, 'success');
        await fetchUsers();
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  if (permission !== 'admin') {
    return <div className="alert alert-danger">No tienes permisos para acceder a esta sección</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar usuario (username o permiso)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <button className="btn btn-success" onClick={handleCreateUser}>
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="alert alert-info">No hay usuarios registrados</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Permiso</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`badge ${user.permission === 'admin' ? 'bg-danger' : 'bg-info'}`}>
                      {user.permission}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEditPassword(user)}
                      title="Cambiar contraseña"
                    >
                      🔑 Cambiar Pwd
                    </button>
                    {' '}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(user)}
                      title="Eliminar usuario"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
