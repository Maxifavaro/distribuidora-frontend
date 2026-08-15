import React from 'react';
import { Input, Select, Button, Card, Form } from '../../componentsUI';

/**
 * ClientForm - Formulario para crear/editar clientes
 * @param {Object} props
 * @param {Object} props.form - Estado del formulario
 * @param {Function} props.onChange - Handler para cambios en inputs
 * @param {Function} props.onSubmit - Handler para submit del formulario
 * @param {Function} props.onCancel - Handler para cancelar edición
 * @param {boolean} props.isEditing - Indica si está en modo edición
 * @param {boolean} props.loading - Indica si está cargando
 * @param {Array} props.barrios - Lista de barrios
 * @param {Array} props.localidades - Lista de localidades
 * @param {Array} props.zonas - Lista de zonas
 * @param {Array} props.condicionesPago - Lista de condiciones de pago
 */
export default function ClientForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  barrios = [],
  localidades = [],
  zonas = [],
  condicionesPago = []
}) {
  return (
    <Card 
      title={isEditing ? 'Modificar Cliente' : 'Nuevo Cliente'}
      className="mb-3"
    >
      <Form onSubmit={onSubmit}>
        <div className="row">
          <div className="col-md-4">
            <Input
              required
              name="nombre"
              label="Nombre"
              value={form.nombre}
              onChange={onChange}
              placeholder="Campo obligatorio"
            />
          </div>
          <div className="col-md-4">
            <Input
              name="apellido"
              label="Apellido"
              value={form.apellido}
              onChange={onChange}
              placeholder="Opcional"
            />
          </div>
          <div className="col-md-4">
            <Input
              name="razon_social"
              label="Razón Social"
              value={form.razon_social}
              onChange={onChange}
              placeholder="Opcional"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Input
              name="direccion"
              label="Dirección"
              value={form.direccion}
              onChange={onChange}
            />
          </div>
          <div className="col-md-2">
            <Input
              name="numero"
              label="Número"
              value={form.numero}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Input
              name="telefono"
              label="Teléfono"
              value={form.telefono}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Input
              name="cuit"
              label="CUIT"
              value={form.cuit}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Input
              type="email"
              name="correo"
              label="Correo"
              value={form.correo}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Select
              name="id_barrio"
              label="Barrio"
              value={form.id_barrio}
              onChange={onChange}
              options={Array.isArray(barrios) ? barrios.map(b => ({ value: b.id, label: b.nombre })) : []}
              placeholder="Seleccionar..."
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Select
              name="id_localidad"
              label="Localidad"
              value={form.id_localidad}
              onChange={onChange}
              options={Array.isArray(localidades) ? localidades.map(l => ({ value: l.id, label: l.nombre })) : []}
              placeholder="Seleccionar..."
            />
          </div>
          <div className="col-md-4">
            <Select
              name="id_zona"
              label="Zona"
              value={form.id_zona}
              onChange={onChange}
              options={Array.isArray(zonas) ? zonas.map(z => ({ value: z.id, label: z.descripcion })) : []}
              placeholder="Seleccionar..."
            />
          </div>
          <div className="col-md-4">
            <Select
              name="id_condicion"
              label="Condición de Pago"
              value={form.id_condicion}
              onChange={onChange}
              options={Array.isArray(condicionesPago) ? condicionesPago.map(c => ({ value: c.id, label: c.descripcion })) : []}
              placeholder="Seleccionar..."
            />
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" disabled={loading}>
            Confirmar
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Card>
  );
}
