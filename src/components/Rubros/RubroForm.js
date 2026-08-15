import React from 'react';
import { Input, Button, Card, Form } from '../../componentsUI';

/**
 * RubroForm - Formulario para crear/editar rubros
 */
export default function RubroForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}) {
  return (
    <Card 
      title={isEditing ? 'Modificar Rubro' : 'Nuevo Rubro'}
      className="mb-3"
    >
      <Form onSubmit={onSubmit}>
        <Input
          required
          name="descripcion"
          label="Descripción"
          value={form.descripcion}
          onChange={onChange}
          placeholder="Descripción del Rubro"
        />
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
