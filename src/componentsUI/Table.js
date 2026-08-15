import React from 'react';

/**
 * Reusable Table Component
 * @param {Object} props - Component properties
 * @param {Array} props.columns - Array of column definitions [{key, label, render}]
 * @param {Array} props.data - Array of data objects
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.striped - Striped rows
 * @param {boolean} props.bordered - Bordered table
 * @param {boolean} props.hover - Hover effect
 * @param {boolean} props.responsive - Responsive wrapper
 * @param {string} props.size - Table size (sm, md, lg)
 * @param {React.ReactNode} props.emptyMessage - Message when no data
 * @param {function} props.onRowClick - Row click handler
 */
const Table = ({
  columns = [],
  data = [],
  className = '',
  striped = true,
  bordered = false,
  hover = true,
  responsive = true,
  size = 'md',
  emptyMessage = 'No hay datos para mostrar',
  onRowClick,
  ...rest
}) => {
  const tableClasses = [
    'table',
    striped && 'table-striped',
    bordered && 'table-bordered',
    hover && 'table-hover',
    size !== 'md' && `table-${size}`,
    className
  ].filter(Boolean).join(' ');

  const TableContent = (
    <table className={tableClasses} {...rest}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={column.key || index} className={column.headerClassName || ''}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center text-muted">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row, rowIndex)}
              style={onRowClick ? { cursor: 'pointer' } : {}}
            >
              {columns.map((column, colIndex) => (
                <td key={column.key || colIndex} className={column.cellClassName || ''}>
                  {column.render ? column.render(row, rowIndex) : row[column.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return responsive ? (
    <div className="table-responsive">
      {TableContent}
    </div>
  ) : (
    TableContent
  );
};

export default Table;
