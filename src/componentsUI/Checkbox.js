import React from 'react';

/**
 * Reusable Checkbox Component
 * @param {Object} props - Component properties
 * @param {string} props.name - Checkbox name
 * @param {boolean} props.checked - Checked state
 * @param {function} props.onChange - Change handler
 * @param {string} props.label - Label text
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.labelClassName - Label CSS classes
 * @param {boolean} props.inline - Inline layout
 */
const Checkbox = ({
  name,
  checked,
  onChange,
  label,
  disabled = false,
  error,
  className = '',
  labelClassName = '',
  inline = false,
  ...rest
}) => {
  const containerClass = inline ? 'form-check form-check-inline' : 'form-check';

  return (
    <div className={`${containerClass} ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        className={`form-check-input ${error ? 'is-invalid' : ''}`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...rest}
      />
      {label && (
        <label htmlFor={name} className={`form-check-label ${labelClassName}`}>
          {label}
        </label>
      )}
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Checkbox;
