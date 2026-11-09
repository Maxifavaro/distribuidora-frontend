import React from 'react';

export default function UserForm({ form, onChange, employeeSearch, onEmployeeSearch, employees, permissions, saving, onSubmit, onCancel }) {
  const term = employeeSearch.trim().toLocaleLowerCase();
  const filteredEmployees = employees.filter(employee =>
    `${employee.apellido} ${employee.nombre} ${employee.id}`.toLocaleLowerCase().includes(term));

  return (
    <form onSubmit={onSubmit} className="card card-body mb-4">
      <h3>{form.employee ? 'Editar usuario' : 'Asignar usuario a empleado'}</h3>
      {form.employee ? <p>Empleado: {form.employee}</p> : (
        <>
          <label className="form-label" htmlFor="employee-search">Buscar empleado</label>
          <input id="employee-search" className="form-control mb-2" value={employeeSearch} onChange={e => { onEmployeeSearch(e.target.value); onChange({ ...form, employeeId: '' }); }} placeholder="Nombre, apellido o código" />
          <label className="form-label" htmlFor="employee">Empleado</label>
          <select id="employee" className="form-select mb-3" required value={form.employeeId} onChange={e => onChange({ ...form, employeeId: e.target.value })}>
            <option value="">Seleccioná un empleado</option>
            {filteredEmployees.map(employee => <option key={employee.id} value={employee.id}>{employee.apellido}, {employee.nombre} ({employee.id})</option>)}
          </select>
        </>
      )}
      <label className="form-label" htmlFor="user-name">Usuario</label>
      <input id="user-name" className="form-control mb-3" required maxLength={50} value={form.username} onChange={e => onChange({ ...form, username: e.target.value })} autoComplete="off" />
      <label className="form-label" htmlFor="user-password">{form.employee ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
      <input id="user-password" className="form-control mb-3" type="password" required={!form.employee} value={form.password} onChange={e => onChange({ ...form, password: e.target.value })} autoComplete="new-password" />
      <label className="form-label" htmlFor="user-permission">Permiso</label>
      <select id="user-permission" className="form-select mb-3" required value={form.permissionId} onChange={e => onChange({ ...form, permissionId: e.target.value })}>
        <option value="">Seleccioná un permiso</option>
        {permissions.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
      </select>
      <div>
        <button type="submit" className="btn btn-primary me-2" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
        <button type="button" className="btn btn-secondary" disabled={saving} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
