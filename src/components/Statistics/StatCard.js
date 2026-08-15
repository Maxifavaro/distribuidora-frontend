import React from 'react';

/**
 * Componente reutilizable para tarjetas de estadísticas
 * @param {Object} props
 * @param {string} props.title - Título de la tarjeta
 * @param {string} props.bgColor - Color de fondo del header (bg-primary, bg-success, bg-info, etc.)
 * @param {React.ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.emptyMessage - Mensaje cuando no hay datos
 * @param {boolean} props.isEmpty - Indica si no hay datos
 */
const StatCard = ({ title, bgColor = 'bg-primary', children, emptyMessage, isEmpty }) => {
  return (
    <div className="card mt-4">
      <div className={`card-header ${bgColor} text-white`}>
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        {isEmpty ? (
          <p className="text-muted">{emptyMessage || 'No hay datos disponibles'}</p>
        ) : (
          <div className="table-responsive">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
