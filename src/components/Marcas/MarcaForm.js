import React from 'react';
import { Input, Button, Card, Form } from '../../componentsUI';

/**
 * MarcaForm - Formulario para crear/editar marcas
 */
export default function MarcaForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false
}) {
  return (
    <Card 
      title={isEditing ? 'Modificar Marca' : 'Nueva Marca'}
      className="mb-3"
    >
      <Form onSubmit={onSubmit}>
        <Input
          required
          name="descripcion"
          label="Descripción"
          value={form.descripcion}
          onChange={onChange}
          placeholder="Descripción de la Marca"
          maxLength={30}
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
