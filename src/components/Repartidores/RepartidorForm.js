import React from 'react';
import { Input, Select, Button, Card, Form, Textarea } from '../../componentsUI';

/**
 * RepartidorForm - Formulario para crear/editar repartidores
 */
export default function RepartidorForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}) {
  return (
    <Card className="mb-4 shadow-sm">
      <h5 className="mb-3">{isEditing ? 'Editar Repartidor' : 'Nuevo Repartidor'}</h5>
      <Form onSubmit={onSubmit}>
        <div className="row">
          <div className="col-md-4">
            <Input
              required
              name="nombre"
              label="Nombre"
              value={form.nombre}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Input
              required
              name="apellido"
              label="Apellido"
              value={form.apellido}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Input
              name="dni"
              label="DNI"
              value={form.dni}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Input
              name="telefono"
              label="Teléfono"
              value={form.telefono}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Input
              type="email"
              name="email"
              label="Email"
              value={form.email}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Select
              name="estado"
              label="Estado"
              value={form.estado}
              onChange={onChange}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' },
                { value: 'Suspendido', label: 'Suspendido' }
              ]}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Input
              name="direccion"
              label="Dirección"
              value={form.direccion}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-4">
            <Input
              name="licencia_conducir"
              label="Licencia de Conducir"
              value={form.licencia_conducir}
              onChange={onChange}
              placeholder="Ej: B123456"
            />
          </div>
          <div className="col-md-4">
            <Input
              type="date"
              name="vencimiento_licencia"
              label="Vencimiento Licencia"
              value={form.vencimiento_licencia}
              onChange={onChange}
            />
          </div>
          <div className="col-md-4">
            <Input
              type="date"
              name="fecha_ingreso"
              label="Fecha de Ingreso"
              value={form.fecha_ingreso}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <Textarea
              name="observaciones"
              label="Observaciones"
              value={form.observaciones}
              onChange={onChange}
              rows={2}
            />
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button variant="success" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </Button>
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Card>
  );
}
