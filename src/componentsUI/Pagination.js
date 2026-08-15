import React from 'react';
import Button from './Button';

/**
 * Reusable Pagination Component
 * @param {Object} props - Component properties
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalRecords - Total number of records
 * @param {Function} props.onPageChange - Page change handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.prevLabel - Previous button label
 * @param {string} props.nextLabel - Next button label
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
  className = '',
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  ...rest
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`d-flex justify-content-center align-items-center mt-3 ${className}`} {...rest}>
      <Button 
        variant="secondary" 
        size="sm" 
        className="me-2" 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
      >
        {prevLabel}
      </Button>
      <span>Página {currentPage} de {totalPages} ({totalRecords} registros)</span>
      <Button 
        variant="secondary" 
        size="sm" 
        className="ms-2" 
        onClick={() => onPageChange(currentPage + 1)} 
        disabled={currentPage === totalPages}
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default Pagination;
