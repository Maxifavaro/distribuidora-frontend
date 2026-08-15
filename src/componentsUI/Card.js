import React from 'react';

/**
 * Reusable Card Component
 * @param {Object} props - Component properties
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {React.ReactNode} props.children - Card body content
 * @param {React.ReactNode} props.header - Card header content
 * @param {React.ReactNode} props.footer - Card footer content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.bodyClassName - Body CSS classes
 * @param {string} props.headerClassName - Header CSS classes
 * @param {string} props.footerClassName - Footer CSS classes
 */
const Card = ({
  title,
  subtitle,
  children,
  header,
  footer,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  ...rest
}) => {
  return (
    <div className={`card ${className}`} {...rest}>
      {(header || title || subtitle) && (
        <div className={`card-header ${headerClassName}`}>
          {header || (
            <>
              {title && <h5 className="card-title mb-0">{title}</h5>}
              {subtitle && <h6 className="card-subtitle text-muted">{subtitle}</h6>}
            </>
          )}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className={`card-footer ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
