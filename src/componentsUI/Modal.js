import React from 'react';

/**
 * Reusable Modal Component
 * @param {Object} props - Component properties
 * @param {boolean} props.show - Show/hide modal
 * @param {function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal body content
 * @param {React.ReactNode} props.footer - Modal footer content
 * @param {string} props.size - Modal size (sm, md, lg, xl)
 * @param {boolean} props.centered - Center modal vertically
 * @param {boolean} props.scrollable - Scrollable modal body
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.closeButton - Show close button in header
 * @param {boolean} props.backdrop - Enable backdrop (true, false, 'static')
 */
const Modal = ({
  show = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  centered = false,
  scrollable = false,
  className = '',
  closeButton = true,
  backdrop = true,
  ...rest
}) => {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && backdrop !== 'static') {
      onClose && onClose();
    }
  };

  const modalDialogClasses = [
    'modal-dialog',
    size !== 'md' && `modal-${size}`,
    centered && 'modal-dialog-centered',
    scrollable && 'modal-dialog-scrollable'
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`modal fade show ${className}`}
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      tabIndex="-1"
      onClick={handleBackdropClick}
      {...rest}
    >
      <div className={modalDialogClasses}>
        <div className="modal-content">
          {(title || closeButton) && (
            <div className="modal-header">
              {title && <h5 className="modal-title">{title}</h5>}
              {closeButton && (
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              )}
            </div>
          )}
          <div className="modal-body">
            {children}
          </div>
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
