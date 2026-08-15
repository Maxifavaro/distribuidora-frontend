import React from 'react';

/**
 * Reusable Badge Component
 * @param {Object} props - Component properties
 * @param {string} props.variant - Badge variant (primary, secondary, success, danger, warning, info, light, dark)
 * @param {React.ReactNode} props.children - Badge content
 * @param {boolean} props.pill - Pill shape
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  variant = 'primary',
  children,
  pill = false,
  className = '',
  ...rest
}) => {
  const badgeClasses = [
    'badge',
    `bg-${variant}`,
    pill && 'rounded-pill',
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...rest}>
      {children}
    </span>
  );
};

export default Badge;
