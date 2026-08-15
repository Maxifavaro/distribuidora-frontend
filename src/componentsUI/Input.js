import React from 'react';

/**
 * Reusable Input Component
 * @param {Object} props - Component properties
 * @param {string} props.type - Input type (text, number, email, password, date, etc.)
 * @param {string} props.name - Input name
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.labelClassName - Label CSS classes
 * @param {string} props.inputClassName - Input CSS classes
 * @param {boolean} props.readOnly - Read-only state
 * @param {string} props.min - Min value (for number/date inputs)
 * @param {string} props.max - Max value (for number/date inputs)
 * @param {number} props.step - Step value (for number inputs)
 */
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  label,
  required = false,
  disabled = false,
  error,
  className = '',
  labelClassName = '',
  inputClassName = '',
  readOnly = false,
  min,
  max,
  step,
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
      <input
        type={type}
        id={name}
        name={name}
        className={`form-control ${error ? 'is-invalid' : ''} ${inputClassName}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        {...rest}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default Input;
