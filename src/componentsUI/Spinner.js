import React from 'react';

/**
 * Reusable Spinner Component
 * @param {Object} props - Component properties
 * @param {string} props.variant - Spinner variant (primary, secondary, success, danger, warning, info, light, dark)
 * @param {string} props.type - Spinner type (border, grow)
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.text - Screen reader text
 */
const Spinner = ({
  variant = 'primary',
  type = 'border',
  size = 'md',
  className = '',
  text = 'Cargando...',
  ...rest
}) => {
  const spinnerClasses = [
    `spinner-${type}`,
    `text-${variant}`,
    size === 'sm' && `spinner-${type}-sm`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses} role="status" {...rest}>
      <span className="visually-hidden">{text}</span>
    </div>
  );
};

export default Spinner;
