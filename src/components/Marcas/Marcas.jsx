import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import useStore from '../../store';
import api from '../../store/api';
import ModuleSummary from '../shared/ModuleSummary';
import FormHeading from '../shared/FormHeading';
import PaginationFooter from '../shared/PaginationFooter';

const EMPTY_FORM = { id: null, descripcion: '', rubroIds: [] };
const PAGE_SIZE = 10;

export default function Marcas() {
  const { permission } = useStore();
  const isAdmin = permission === 'admin';
  const [marcas, setMarcas] = useState([]);
  const [rubros, setRubros] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const [marcasRes, rubrosRes] = await Promise.all([api.get('/marcas'), api.get('/rubros')]);
      setMarcas(marcasRes.data);
      setRubros(rubrosRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return marcas.filter(m => `${m.descripcion} ${m.rubros.join(' ')}`.toLocaleLowerCase().includes(term));
  }, [marcas, search]);
  useEffect(() => { setPage(1); }, [search, marcas]);
  const safePage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleRubro = (id) => setForm(current => ({
    ...current,
    rubroIds: current.rubroIds.includes(id) ? current.rubroIds.filter(r => r !== id) : [...current.rubroIds, id]
  }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = { descripcion: form.descripcion.trim(), rubro_ids: form.rubroIds };
    try {
      if (form.id) await api.put(`/marcas/${form.id}`, payload);
      else await api.post('/marcas', payload);
      setForm(null);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (marca) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la marca ${marca.descripcion} y su relación con los rubros.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/marcas/${marca.id_marca}`);
      await refresh();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {form ? (
        <form onSubmit={save} className="card form-panel p-4 mb-3">
          <FormHeading
            eyebrow="CATÁLOGO DE MARCAS"
            title={form.id ? 'Editar marca' : 'Nueva marca'}
            description={`Completá los datos para ${form.id ? 'actualizar la marca' : 'agregar una marca al catálogo'}.`}
          />
          {form.id && (
            <div className="mb-3">
              <label className="form-label" htmlFor="marca-id">Código</label>
              <input id="marca-id" className="form-control" value={form.id} readOnly tabIndex={-1} />
            </div>
          )}
          <div className="mb-3">
            <label className="form-label" htmlFor="marca-descripcion">Descripción <span className="text-danger">*</span></label>
            <input id="marca-descripcion" className="form-control" required maxLength={30} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <fieldset className="mb-3">
            <legend className="form-label fs-6">Rubros de la marca</legend>
            <div className="row">
              {rubros.map(rubro => (
                <div className="col-12 col-md-6 col-lg-4" key={rubro.id_rubro}>
                  <div className="form-check">
                    <input id={`rubro-${rubro.id_rubro}`} type="checkbox" className="form-check-input" checked={form.rubroIds.includes(rubro.id_rubro)} onChange={() => toggleRubro(rubro.id_rubro)} />
                    <label className="form-check-label" htmlFor={`rubro-${rubro.id_rubro}`}>{rubro.descripcion}</label>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="d-flex gap-2 justify-content-end client-entry-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Guardar marca'}</button>
            <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setForm(null)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <>
          {!loading && !error && <ModuleSummary moduleKey="marcas" count={marcas.length} />}
          <div className="dynamic-module-toolbar client-module-toolbar mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
            <div className="d-flex gap-2 align-items-center client-module-search-group">
              <input className="form-control" placeholder="Buscar por marca o rubro" aria-label="Buscar marca" value={search} onChange={e => setSearch(e.target.value)} />
              {isAdmin && (
                <button className="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0" onClick={() => setForm(EMPTY_FORM)} title="Crear marca">
                  <span aria-hidden="true">+</span><span>Nueva marca</span>
                </button>
              )}
            </div>
          </div>          {loading ? <p>Cargando marcas...</p> : filtered.length === 0 ? <div className="alert alert-info">No hay marcas para mostrar.</div> : (
            <>
            <div className="table-responsive">
              <table className="table table-striped table-hover abm-grid-table">
                <thead><tr>{isAdmin && <th>Acciones</th>}<th>Código</th><th>Marca</th><th>Rubros</th></tr></thead>
                <tbody>{visible.map(marca => (
                  <tr key={marca.id_marca}>
                    {isAdmin && (
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button className="btn btn-outline-primary" title="Editar" aria-label="Editar" onClick={() => setForm({ id: marca.id_marca, descripcion: marca.descripcion, rubroIds: marca.rubro_ids })}>✏️</button>
                          <button className="btn btn-outline-danger" title="Eliminar" aria-label="Eliminar" onClick={() => remove(marca)}>🗑️</button>
                        </div>
                      </td>
                    )}
                    <td>{marca.id_marca}</td>
                    <td>{marca.descripcion}</td>
                    <td>{marca.rubros.length ? marca.rubros.join(', ') : <span className="text-muted">Sin rubros</span>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <PaginationFooter page={safePage} pageSize={PAGE_SIZE} total={filtered.length} filteredFrom={search.trim() ? marcas.length : null} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
