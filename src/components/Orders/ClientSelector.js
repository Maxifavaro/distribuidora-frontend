import React, { useState } from 'react';

/**
 * Componente modal para selección de clientes con búsqueda avanzada
 * @param {Object} props
 * @param {Array} props.clients - Lista de clientes
 * @param {Function} props.onSelectClient - Callback al seleccionar cliente
 * @param {Function} props.onClose - Callback para cerrar modal
 * @param {boolean} props.show - Controla visibilidad del modal
 */
const ClientSelector = ({ clients, onSelectClient, onClose, show }) => {
  const [clientSearch, setClientSearch] = useState('');

  if (!show) return null;

  const filteredClients = Array.isArray(clients) ? clients.filter(c => {
    if (!clientSearch) return true;
    const searchLower = clientSearch.toLowerCase();
    return (
      (c.razon_social && c.razon_social.toLowerCase().includes(searchLower)) ||
      (c.nombre && c.nombre.toLowerCase().includes(searchLower)) ||
      (c.apellido && c.apellido.toLowerCase().includes(searchLower)) ||
      (c.cuit && c.cuit.toLowerCase().includes(searchLower)) ||
      (c.direccion && c.direccion.toLowerCase().includes(searchLower)) ||
      (c.telefono && c.telefono.toLowerCase().includes(searchLower)) ||
      (c.localidad_nombre && c.localidad_nombre.toLowerCase().includes(searchLower)) ||
      c.id.toString().includes(searchLower)
    );
  }).slice(0, 50) : [];

  const handleSelectClient = (client) => {
    onSelectClient(client);
    setClientSearch('');
    onClose();
  };

  return (
    <div className="card position-absolute" style={{ zIndex: 1000, width: '600px', maxHeight: '400px', marginTop: '5px' }}>
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
        <span>Seleccionar Cliente</span>
        <button 
          type="button" 
          className="btn-close btn-close-white" 
          onClick={() => {
            setClientSearch('');
            onClose();
          }}
        />
      </div>
      <div className="card-body p-2">
        <input 
          type="text" 
          className="form-control form-control-sm mb-2" 
          placeholder="Buscar por nombre, razón social, CUIT, dirección, teléfono..." 
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          autoFocus
        />
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {filteredClients.map(c => (
            <div 
              key={c.id} 
              className="border-bottom p-2 hover-bg-light" 
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectClient(c)}
            >
              <div className="d-flex justify-content-between">
                <strong className="text-primary">
                  #{c.id} - {c.razon_social || `${c.nombre || ''} ${c.apellido || ''}`.trim() || 'Sin nombre'}
                </strong>
                <span className="badge bg-secondary">{c.estado || 'Activo'}</span>
              </div>
              <div className="small text-muted">
                {c.cuit && <span className="me-3"><i className="bi bi-card-text"></i> CUIT: {c.cuit}</span>}
                {c.telefono && <span className="me-3"><i className="bi bi-telephone"></i> {c.telefono}</span>}
              </div>
              <div className="small text-muted">
                {c.direccion && <span className="me-2"><i className="bi bi-geo-alt"></i> {c.direccion} {c.numero || ''}</span>}
                {c.localidad_nombre && <span>- {c.localidad_nombre}</span>}
              </div>
              {c.condicion_pago && (
                <div className="small">
                  <span className="badge bg-info text-dark mt-1">{c.condicion_pago}</span>
                </div>
              )}
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="text-center text-muted p-3">No se encontraron clientes</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;
