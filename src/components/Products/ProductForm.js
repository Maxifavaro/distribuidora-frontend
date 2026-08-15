import React from 'react';
import { Input, Select, Button, Card, Form, Checkbox } from '../../componentsUI';

/**
 * ProductForm - Formulario complejo para crear/editar productos
 */
export default function ProductForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  onRubroChange,
  isEditing = false,
  loading = false,
  loadingMarcas = false,
  providers = [],
  rubros = [],
  marcas = []
}) {
  return (
    <Card 
      title={isEditing ? 'Modificar Producto' : 'Nuevo Producto'}
      className="mb-3"
    >
      <Form onSubmit={onSubmit}>
        {/* Fila 1: Datos básicos */}
        <div className="row">
          <div className="col-md-4">
            <Input
              required
              name="name"
              label="Nombre"
              value={form.name}
              onChange={onChange}
              placeholder="Nombre"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="sku"
              label="SKU"
              value={form.sku}
              onChange={onChange}
              placeholder="SKU"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="stock"
              label="Stock"
              type="number"
              value={form.stock}
              onChange={onChange}
              placeholder="Stock"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="pack"
              label="Pack"
              value={form.pack}
              onChange={onChange}
              placeholder="UN"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="uniXPack"
              label="Uni x Pack"
              type="number"
              value={form.uniXPack}
              onChange={onChange}
              placeholder="1"
            />
          </div>
        </div>
        
        {/* Fila 2: Precios */}
        <div className="row">
          <div className="col-md-3">
            <Input
              required
              name="price"
              label="Precio Final Uni"
              type="number"
              step="0.01"
              value={form.price}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-3">
            <Input
              name="precioFinalPack"
              label="Precio Final Pack"
              type="number"
              step="0.01"
              value={form.precioFinalPack}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-3">
            <Input
              name="precioNetoPack"
              label="Precio Neto Pack"
              type="number"
              step="0.01"
              value={form.precioNetoPack}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-3">
            <Input
              name="precioNetoUni"
              label="Precio Neto Uni"
              type="number"
              step="0.01"
              value={form.precioNetoUni}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Fila 3: Costos */}
        <div className="row">
          <div className="col-md-3">
            <Input
              name="costo"
              label="Costo"
              type="number"
              step="0.01"
              value={form.costo}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-3">
            <Input
              name="costoUnit"
              label="Costo Unit"
              type="number"
              step="0.01"
              value={form.costoUnit}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="margen"
              label="Margen (%)"
              type="number"
              step="0.01"
              value={form.margen}
              onChange={onChange}
              placeholder="0"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="montoIVA"
              label="Monto IVA"
              type="number"
              step="0.01"
              value={form.montoIVA}
              onChange={onChange}
              placeholder="0.00"
            />
          </div>
          <div className="col-md-2">
            <Input
              name="pmr"
              label="PMR"
              type="number"
              value={form.pmr}
              onChange={onChange}
              placeholder="1"
            />
          </div>
        </div>
        
        {/* Fila 4: Relaciones */}
        <div className="row">
          <div className="col-md-4">
            <Select
              required
              name="provider_id"
              label="Proveedor"
              value={form.provider_id}
              onChange={onChange}
              options={providers.map(p => ({ 
                value: p.id, 
                label: p.razon_social || p.name 
              }))}
              placeholder="Seleccionar Proveedor"
            />
          </div>
          <div className="col-md-3">
            <Select
              required
              name="rubro_id"
              label="Rubro"
              value={form.rubro_id}
              onChange={onRubroChange}
              options={rubros.map(r => ({ 
                value: r.id_rubro, 
                label: r.descripcion 
              }))}
              placeholder="Seleccionar Rubro"
            />
          </div>
          <div className="col-md-3">
            <Select
              name="marca_id"
              label="Marca"
              value={form.marca_id}
              onChange={onChange}
              options={marcas.map(m => ({ 
                value: m.id_marca, 
                label: m.descripcion 
              }))}
              placeholder={loadingMarcas ? 'Cargando...' : 'Sin marca'}
              disabled={loadingMarcas}
            />
          </div>
          <div className="col-md-2">
            <Select
              name="alicuota_id"
              label="Alícuota IVA"
              value={form.alicuota_id}
              onChange={onChange}
              options={[
                { value: '1', label: '21%' },
                { value: '2', label: '10.5%' },
                { value: '3', label: '27%' }
              ]}
              placeholder="Sin alícuota"
            />
          </div>
        </div>

        {/* Fila 5: Estado y descuento */}
        <div className="row">
          <div className="col-md-3">
            <Select
              name="estado"
              label="Estado"
              value={form.estado}
              onChange={onChange}
              options={[
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' }
              ]}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label d-block">¿Permite descuentos?</label>
            <div className="form-check form-check-inline">
              <input 
                className="form-check-input" 
                type="radio" 
                name="permite_descuento" 
                id="descuento_si" 
                checked={form.permite_descuento === true}
                onChange={() => onChange({ 
                  target: { name: 'permite_descuento', value: true } 
                })}
              />
              <label className="form-check-label" htmlFor="descuento_si">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input 
                className="form-check-input" 
                type="radio" 
                name="permite_descuento" 
                id="descuento_no" 
                checked={form.permite_descuento === false}
                onChange={() => onChange({ 
                  target: { name: 'permite_descuento', value: false } 
                })}
              />
              <label className="form-check-label" htmlFor="descuento_no">No</label>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2 mt-3">
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
