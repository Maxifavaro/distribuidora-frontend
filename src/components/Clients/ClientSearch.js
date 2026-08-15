import React from 'react';
import { Input } from '../../componentsUI';

/**
 * ClientSearch - Componente de búsqueda para clientes
 * @param {Object} props
 * @param {string} props.value - Valor de búsqueda
 * @param {Function} props.onChange - Handler para cambios
 * @param {boolean} props.showFormToggle - Mostrar toggle de formulario
 * @param {boolean} props.formVisible - Estado del formulario
 * @param {Function} props.onToggleForm - Handler para toggle
 * @param {boolean} props.isEditing - Si está editando
 * @param {string} props.permission - Permiso del usuario
 */
export default function ClientSearch({
  value,
  onChange,
  showFormToggle = false,
  formVisible = false,
  onToggleForm,
  isEditing = false,
  permission = 'read'
}) {
  return (
    <div className="mb-3 d-flex align-items-center">
      <div className="flex-grow-1 me-2">
        <Input 
          name="search"
          placeholder="Buscar por ID o nombre" 
          value={value} 
          onChange={onChange}
          className="mb-0"
        />
      </div>
      {showFormToggle && permission === 'admin' && !isEditing && (
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="toggleForm" 
            checked={formVisible} 
            onChange={onToggleForm}
            style={{ width: '48px', height: '24px', cursor: 'pointer' }}
          />
        </div>
      )}
    </div>
  );
}
