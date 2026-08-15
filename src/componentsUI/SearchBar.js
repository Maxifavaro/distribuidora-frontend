import React from 'react';
import Input from './Input';

/**
 * Reusable SearchBar Component
 * @param {Object} props - Component properties
 * @param {string} props.value - Search value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {React.ReactNode} props.actions - Additional action buttons/elements
 * @param {string} props.className - Additional CSS classes
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  actions,
  className = '',
  ...rest
}) => {
  return (
    <div className={`mb-3 d-flex align-items-center ${className}`} {...rest}>
      <div className="flex-grow-1 me-2">
        <Input 
          name="search"
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          className="mb-0"
        />
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

export default SearchBar;
