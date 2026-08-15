import React from 'react';

/**
 * Reusable Select Component
 * @param {Object} props - Component properties
 * @param {string} props.name - Select name
 * @param {string|number} props.value - Selected value
 * @param {function} props.onChange - Change handler
 * @param {Array} props.options - Array of options [{value, label}] or array of strings
 * @param {string} props.label - Label text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {string} props.placeholder - Placeholder text (default option)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.labelClassName - Label CSS classes
 * @param {string} props.selectClassName - Select CSS classes
 */
const Select = ({
  name,
  value,
  onChange,
  options = [],
  label,
  required = false,
  disabled = false,
  error,
  placeholder = 'Seleccione una opción',
  className = '',
  labelClassName = '',
  selectClassName = '',
  ...rest
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      {label && (
        <label htmlFor={name} className={`form-label ${labelClassName}`}>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        className={`form-select ${error ? 'is-invalid' : ''} ${selectClassName}`}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => {
          // Handle both object {value, label} and simple string arrays
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          
          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Select;
