import React from 'react';

/**
 * Reusable Alert Component
 * @param {Object} props - Component properties
 * @param {string} props.variant - Alert variant (primary, secondary, success, danger, warning, info, light, dark)
 * @param {React.ReactNode} props.children - Alert content
 * @param {boolean} props.dismissible - Show close button
 * @param {function} props.onClose - Close handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.title - Alert title
 */
const Alert = ({
  variant = 'info',
  children,
  dismissible = false,
  onClose,
  className = '',
  title,
  ...rest
}) => {
  const alertClasses = [
    'alert',
    `alert-${variant}`,
    dismissible && 'alert-dismissible fade show',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={alertClasses} role="alert" {...rest}>
      {title && <h5 className="alert-heading">{title}</h5>}
      {children}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      )}
    </div>
  );
};

export default Alert;
