import jsPDF from 'jspdf';

/**
 * Hook personalizado para generar PDFs de pedidos
 * @returns {Object} { generatePDFBlob, exportToPDF }
 */
export const usePDFGenerator = () => {
  const generatePDFBlob = async (orderData, orderItems) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Título simple
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`Pedido: ${String(orderData.id).padStart(6, '0')}`, pageWidth / 2, 20, { align: 'center' });
    
    // Línea separadora
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(15, 25, pageWidth - 15, 25);
    
    // Información del pedido en dos columnas
    let yPos = 35;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL CLIENTE', 15, yPos);
    doc.text('DATOS DEL PEDIDO', 110, yPos);
    
    yPos += 8;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    
    // Columna izquierda - Cliente
    doc.setFont(undefined, 'bold');
    doc.text('Cliente:', 15, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(orderData.client_name || 'N/A', 35, yPos);
    
    // Columna derecha - Fecha creación
    doc.setFont(undefined, 'bold');
    doc.text('Fecha Pedido:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(new Date(orderData.created_at).toLocaleDateString('es-AR'), 145, yPos);
    
    yPos += 7;
    
    // Dirección
    if (orderData.client_direccion) {
      doc.setFont(undefined, 'bold');
      doc.text('Dirección:', 15, yPos);
      doc.setFont(undefined, 'normal');
      const direccion = orderData.client_direccion + (orderData.client_numero ? ' ' + orderData.client_numero : '');
      doc.text(direccion, 35, yPos);
    }
    
    // Tipo de entrega
    doc.setFont(undefined, 'bold');
    doc.text('Tipo Entrega:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(orderData.delivery_type || 'N/A', 145, yPos);
    
    yPos += 7;
    
    // Teléfono
    if (orderData.client_telefono) {
      doc.setFont(undefined, 'bold');
      doc.text('Teléfono:', 15, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(orderData.client_telefono, 35, yPos);
    }
    
    yPos += 7;
    
    // Fecha de entrega
    if (orderData.delivery_date) {
      doc.setFont(undefined, 'bold');
      doc.text('Fecha Entrega:', 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(new Date(orderData.delivery_date).toLocaleDateString('es-AR'), 145, yPos);
      yPos += 7;
    }
    
    // Repartidor
    if (orderData.repartidor_name) {
      doc.setFont(undefined, 'bold');
      doc.text('Repartidor:', 110, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(orderData.repartidor_name, 145, yPos);
      yPos += 7;
    }
    
    // Estado
    doc.setFont(undefined, 'bold');
    doc.text('Estado:', 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(orderData.status || 'Pendiente', 145, yPos);
    
    // Línea separadora
    yPos += 8;
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Título de la tabla
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('DETALLE DE PRODUCTOS', 15, yPos);
    
    // Encabezado de tabla
    yPos += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    
    // Línea superior del encabezado
    doc.setLineWidth(0.5);
    doc.line(15, yPos - 2, pageWidth - 15, yPos - 2);
    
    doc.text('PRODUCTO', 17, yPos + 2);
    doc.text('SKU', 110, yPos + 2);
    doc.text('CANT.', 135, yPos + 2, { align: 'center' });
    doc.text('PRECIO UNIT.', 160, yPos + 2, { align: 'right' });
    doc.text('SUBTOTAL', pageWidth - 17, yPos + 2, { align: 'right' });
    
    // Línea inferior del encabezado
    doc.line(15, yPos + 4, pageWidth - 15, yPos + 4);
    
    doc.setFont(undefined, 'normal');
    
    // Items de la tabla
    yPos += 8;
    let totalGeneral = 0;
    let itemCount = 0;
    
    orderItems.forEach((item, idx) => {
      // Verificar si necesitamos nueva página
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
        
        // Repetir encabezado en nueva página
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        
        doc.setLineWidth(0.5);
        doc.line(15, yPos - 2, pageWidth - 15, yPos - 2);
        
        doc.text('PRODUCTO', 17, yPos + 2);
        doc.text('SKU', 110, yPos + 2);
        doc.text('CANT.', 135, yPos + 2, { align: 'center' });
        doc.text('PRECIO UNIT.', 160, yPos + 2, { align: 'right' });
        doc.text('SUBTOTAL', pageWidth - 17, yPos + 2, { align: 'right' });
        
        doc.line(15, yPos + 4, pageWidth - 15, yPos + 4);
        
        doc.setFont(undefined, 'normal');
        yPos += 8;
      }
      
      const subtotal = item.quantity * item.unit_price;
      totalGeneral += subtotal;
      itemCount++;
      
      // Truncar nombre si es muy largo
      const productName = item.name.length > 40 ? item.name.substring(0, 37) + '...' : item.name;
      
      doc.setFontSize(8);
      doc.text(productName, 17, yPos);
      doc.text(item.sku || 'N/A', 110, yPos);
      doc.text(String(item.quantity), 135, yPos, { align: 'center' });
      doc.text(`$ ${parseFloat(item.unit_price).toFixed(2)}`, 160, yPos, { align: 'right' });
      doc.setFont(undefined, 'bold');
      doc.text(`$ ${subtotal.toFixed(2)}`, pageWidth - 17, yPos, { align: 'right' });
      doc.setFont(undefined, 'normal');
      
      yPos += 7;
    });
    
    // Línea antes del total
    yPos += 3;
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(15, yPos, pageWidth - 15, yPos);
    
    // Resumen final
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Total de items: ${itemCount}`, 15, yPos);
    
    // Total
    yPos += 2;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL:', pageWidth - 75, yPos + 2);
    doc.text(`$ ${totalGeneral.toFixed(2)}`, pageWidth - 17, yPos + 2, { align: 'right' });
    
    // Pie de página
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado el ${new Date().toLocaleString('es-AR')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    return doc.output('blob');
  };

  const downloadPDF = (blob, orderId, clientName) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 10);
    link.download = `PEDIDO_${orderId}_${clientName?.replace(/\s+/g, '_')}_${dateStr}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    generatePDFBlob,
    downloadPDF
  };
};
