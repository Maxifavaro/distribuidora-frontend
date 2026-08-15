import React from 'react';

/**
 * Reusable Button Component
 * @param {Object} props - Component properties
 * @param {string} props.variant - Bootstrap variant (primary, secondary, success, danger, warning, info, light, dark)
 * @param {string} props.size - Button size (sm, md, lg)
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {boolean} props.disabled - Disabled state
 * @param {function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {React.ReactNode} props.icon - Icon element (optional)
 * @param {string} props.iconPosition - Icon position (left, right)
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,
  icon,
  iconPosition = 'left',
  ...rest
}) => {
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const classes = `btn btn-${variant} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {icon && iconPosition === 'left' && <span className="me-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ms-2">{icon}</span>}
    </button>
  );
};

export default Button;
