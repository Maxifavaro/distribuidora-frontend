import React, { useEffect, useRef, useState } from 'react';
import api from '../../store/api';

export default function ProviderSearch({ value, onSelect }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    if (value || term.trim().length < 2) {
      setResults([]);
      return undefined;
    }
    const current = ++requestId.current;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get('/catalogs/proveedores', { params: { q: term.trim() } });
        if (current === requestId.current) setResults(Array.isArray(data) ? data : []);
      } catch {
        if (current === requestId.current) setResults([]);
      } finally {
        if (current === requestId.current) setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [term, value]);

  const choose = (provider) => {
    onSelect(provider);
    setTerm('');
    setOpen(false);
  };

  if (value) {
    return (
      <div className="input-group">
        <input className="form-control" readOnly value={`${value.id} - ${value.nombre}`} aria-label="Proveedor seleccionado" />
        <button type="button" className="btn btn-outline-secondary" onClick={() => onSelect(null)}>Cambiar</button>
      </div>
    );
  }

  return (
    <div className="position-relative">
      <input
        className="form-control"
        placeholder="Buscar proveedor por nombre, CUIT o código"
        aria-label="Buscar proveedor"
        value={term}
        onChange={e => { setTerm(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && term.trim().length >= 2 && (
        <div className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 20, maxHeight: 260, overflowY: 'auto' }}>
          {searching && <div className="list-group-item text-muted small">Buscando...</div>}
          {!searching && results.length === 0 && <div className="list-group-item text-muted small">Sin resultados</div>}
          {results.map(provider => (
            <button type="button" key={provider.id} className="list-group-item list-group-item-action" onClick={() => choose(provider)}>
              <strong>{provider.nombre}</strong> <span className="text-muted small">#{provider.id}{provider.cuit ? ` · ${provider.cuit}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
