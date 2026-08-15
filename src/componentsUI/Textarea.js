import React from 'react';

/**
 * Reusable Textarea Component
 * @param {Object} props - Component properties
 * @param {string} props.name - Textarea name
 * @param {string} props.value - Textarea value
 * @param {function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Label text
 * @param {boolean} props.required - Required field
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.labelClassName - Label CSS classes
 * @param {string} props.textareaClassName - Textarea CSS classes
 * @param {number} props.rows - Number of rows
 * @param {number} props.maxLength - Maximum length
 */
const Textarea = ({
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
  textareaClassName = '',
  rows = 3,
  maxLength,
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
      <textarea
        id={name}
        name={name}
        className={`form-control ${error ? 'is-invalid' : ''} ${textareaClassName}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        {...rest}
      />
      {error && <div className="invalid-feedback">{error}</div>}
      {maxLength && (
        <small className="text-muted">
          {value?.length || 0} / {maxLength}
        </small>
      )}
    </div>
  );
};

export default Textarea;
