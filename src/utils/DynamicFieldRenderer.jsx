import React from 'react';

// Columnas que son claves foráneas a catálogos: se muestran como combo
export const LOOKUP_COLUMNS = {
  ID_Barrio: 'barrios',
  ID_Localidad: 'localidades'
};

/**
 * DynamicFieldRenderer
 * Renderiza un campo de formulario basado en el tipo de dato SQL
 */
export default function DynamicFieldRenderer({ 
  column, 
  value, 
  onChange, 
  onBlur,
  options,
  error,
  allowTextPunctuation = false,
  locked = false,
  label,
  dateOnly = false
}) {
  const { name, dataType, fieldType, maxLength, isNullable, readOnly } = column;
  const normalizedDataType = (dataType || '').toLowerCase();
  const textMaxLength = maxLength > 0 ? maxLength : 255;

  if (locked) {
    return (
      <div className="mb-3">
        <label htmlFor={name} className="form-label">{formatLabel(name)}</label>
        <input
          id={name}
          className="form-control"
          value={value ?? ''}
          placeholder="No editable"
          readOnly
        />
      </div>
    );
  }

  // Skip identity/computed columns
  if (readOnly) {
    return (
      <div className="mb-3">
        <label className="form-label text-muted">{formatLabel(name)}</label>
        <div className="form-control-plaintext">{value || '-'}</div>
      </div>
    );
  }

  const commonProps = {
    className: 'form-control',
    value: value ?? '',
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${name}-error` : undefined,
    onChange: (e) => {
      let nextValue = e.target.value;

      if (fieldType === 'number' && normalizedDataType.includes('int')) {
        nextValue = nextValue.replace(/[^0-9-]/g, '').replace(/(?!^)-/g, '');
      }

      if (fieldType === 'text' && !allowTextPunctuation) {
        nextValue = nextValue.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s]/g, '');
      }

      onChange(name, nextValue);
    },
    onBlur,
    disabled: readOnly
  };

  return (
    <div className="mb-3">
      {fieldType !== 'boolean' && (
        <label htmlFor={name} className="form-label">
          {label || formatLabel(name)}
          {!isNullable && <span className="text-danger">*</span>}
        </label>
      )}

      {options && (
        <select
          id={name}
          className="form-select"
          value={value ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
          disabled={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="">Seleccionar...</option>
          {value !== '' && value !== null && value !== undefined &&
            !options.some(opt => String(opt.id) === String(value)) && (
              <option value={value} disabled>Valor actual no disponible: {value}</option>
            )}
          {options.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.nombre}</option>
          ))}
        </select>
      )}

      {!options && fieldType === 'text' && (
        <input
          id={name}
          type="text"
          maxLength={textMaxLength}
          {...commonProps}
        />
      )}

      {!options && fieldType === 'number' && (
        <input
          id={name}
          type="number"
          {...commonProps}
        />
      )}

      {fieldType === 'decimal' && (
        <input
          id={name}
          type="number"
          step="0.01"
          {...commonProps}
        />
      )}

      {fieldType === 'datetime' && (
        <input
          id={name}
          type={dateOnly ? 'date' : 'datetime-local'}
          {...commonProps}
        />
      )}

      {fieldType === 'boolean' && (
        <div className="form-check">
          <input
            id={name}
            type="checkbox"
            className="form-check-input"
            checked={value === true || value === 1 || value === '1'}
            onChange={(e) => onChange(name, e.target.checked ? 1 : 0)}
            disabled={readOnly}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${name}-error` : undefined}
          />
          <label className="form-check-label" htmlFor={name}>
            {formatLabel(name)}
          </label>
        </div>
      )}

    </div>
  );
}

// Etiquetas con tildes y espacios correctos (clave: nombre de columna en minúsculas)
const FIELD_LABELS = {
  activoweb: 'Activo Web',
  alicivadesc: 'Alícuota IVA',
  alic_iva_desc: 'Alícuota IVA',
  apagar: 'A Pagar',
  apellido: 'Apellido',
  barrio: 'Barrio',
  bdeposito: 'Depósito',
  codigopostal: 'Código Postal',
  correo: 'Correo',
  costo: 'Costo',
  costounit: 'Costo Unitario',
  created_at: 'Fecha de Creación',
  createdat: 'Fecha de Creación',
  ctacte: 'Cuenta Corriente',
  cuecodigo: 'Código de Cuenta',
  cuit: 'CUIT',
  descripcion: 'Descripción',
  direccion: 'Dirección',
  direccionfacturacion: 'Dirección de Facturación',
  dni: 'DNI',
  dto: 'Descuento',
  email: 'Email',
  enviado: 'Enviado',
  estado: 'Estado',
  fax: 'Fax',
  fecha: 'Fecha',
  fecha_alta: 'Fecha de Alta',
  fechaalta: 'Fecha de Alta',
  fechaentrega: 'Fecha de Entrega',
  fechaingreso: 'Fecha de Ingreso',
  ib: 'Ingresos Brutos',
  idalicia: 'Alícuota IVA',
  idlista: 'Lista de Precios',
  idmarca: 'Marca',
  id_marca: 'Marca',
  id_condicion: 'Condición de Pago',
  ingresosbrutos: 'Ingresos Brutos',
  letra: 'Letra',
  licenciaconducir: 'Licencia de Conducir',
  limitectacte: 'Límite Cuenta Corriente',
  localidad: 'Localidad',
  marcadesc: 'Marca',
  margen: 'Margen',
  montoiva: 'Monto IVA',
  mrc_descripcion: 'Descripción',
  nombre: 'Nombre',
  nrocuenta: 'Nº de Cuenta',
  numero: 'Número',
  numerofacturacion: 'Número de Facturación',
  observaciones: 'Observaciones',
  ocultarapp: 'Ocultar en App',
  password: 'Contraseña',
  passwordweb: 'Contraseña Web',
  percodigo: 'Código de Persona',
  permission: 'Permiso',
  permitedescuento: 'Permite Descuento',
  pmr: 'PMR',
  porcentajedto: 'Porcentaje de Descuento',
  pr_codorigen: 'Código de Origen',
  pr_ean13: 'EAN13',
  pr_pack: 'Pack',
  pr_unidminventa: 'Unidad Mínima de Venta',
  pr_unixpack: 'Unidades por Pack',
  preciofinalpack: 'Precio Final Pack',
  preciofinaluni: 'Precio Final Unidad',
  precionetopack: 'Precio Neto Pack',
  precionetouni: 'Precio Neto Unidad',
  razonsocial: 'Razón Social',
  sinstockapp: 'Sin Stock en App',
  sitioweb: 'Sitio Web',
  stock: 'Stock',
  telefono: 'Teléfono',
  total: 'Total',
  updatedat: 'Fecha de Modificación',
  username: 'Usuario',
  userweb: 'Usuario Web',
  vencimientolicencia: 'Vencimiento de Licencia',
  id_barrio: 'Barrio',
  id_categoria: 'Código de categoría',
  id_condiva: 'Código de condición de IVA',
  nombrelista: 'Nombre de lista',
  tipopercent: 'Tipo de porcentaje',
  fechadesde: 'Vigente desde',
  fechahasta: 'Vigente hasta',
  id_localidad: 'Localidad',
  id_zona: 'Zona',
  id_cliente: 'Cliente',
  id_comprobante: 'Comprobante',
  id_empleado: 'Empleado',
  id_producto: 'Producto',
  id_proveedor: 'Proveedor',
  id_repartidor: 'Repartidor',
  id_rubro: 'Rubro',
  id_tomapedido: 'Toma de Pedido'
};

/**
 * Convierte nombres de campo (ID_Producto) a etiquetas legibles (Producto)
 */
export function formatLabel(fieldName) {
  const known = FIELD_LABELS[String(fieldName).toLowerCase()];
  if (known) return known;

  return fieldName
    .replace(/^ID_/, '') // Remove ID_ prefix
    .replace(/([A-Z])/g, ' $1') // Add spaces before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Formatea valores basado en tipo de dato para mostrar
 */
export function formatDisplayValue(value, fieldType, dataType) {
  if (value === null || value === undefined) return '-';

  if (fieldType === 'datetime') {
    const date = new Date(value);
    return date.toLocaleString('es-AR');
  }

  if (fieldType === 'boolean') {
    return value ? 'Sí' : 'No';
  }

  if (fieldType === 'number' || fieldType === 'decimal') {
    return Number(value).toLocaleString('es-AR');
  }

  if (fieldType === 'text') {
    return String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '');
  }

  return String(value);
}
