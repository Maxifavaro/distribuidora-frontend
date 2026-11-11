import React from 'react';
import FormHeading from '../shared/FormHeading';

export default function UserForm({ form, onChange, employeeSearch, onEmployeeSearch, employees, permissions, saving, onSubmit, onCancel }) {
  const term = employeeSearch.trim().toLocaleLowerCase();
  const filteredEmployees = employees.filter(employee =>
    `${employee.apellido} ${employee.nombre} ${employee.id}`.toLocaleLowerCase().includes(term));

  return (
    <form onSubmit={onSubmit} className="card card-body mb-4">
      <FormHeading
        eyebrow="GESTIÓN DE ACCESOS"
        title={form.employee ? 'Editar usuario' : 'Nuevo usuario'}
        description={form.employee ? 'Completá los datos para actualizar el acceso.' : 'Completá los datos para asignar un usuario a un empleado.'}
      />
      {form.employee ? (
        <>
          <label className="form-label" htmlFor="user-id">Código</label>
          <input id="user-id" className="form-control mb-3" value={form.employeeId} readOnly tabIndex={-1} />
          <p>Empleado: {form.employee}</p>
        </>
      ) : (
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
      <div className="d-flex gap-2 justify-content-end client-entry-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : form.employee ? 'Guardar cambios' : 'Guardar usuario'}</button>
        <button type="button" className="btn btn-secondary" disabled={saving} onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
