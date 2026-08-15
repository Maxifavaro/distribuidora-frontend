import React from 'react';

/**
 * Reusable Form Component
 * @param {Object} props - Component properties
 * @param {function} props.onSubmit - Form submit handler
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.inline - Inline form layout
 * @param {boolean} props.validated - Show validation styles
 */
const Form = ({
  onSubmit,
  children,
  className = '',
  inline = false,
  validated = false,
  ...rest
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit && onSubmit(e);
  };

  const formClasses = [
    inline && 'row g-3',
    validated && 'was-validated',
    className
  ].filter(Boolean).join(' ');

  return (
    <form className={formClasses} onSubmit={handleSubmit} {...rest}>
      {children}
    </form>
  );
};

export default Form;
