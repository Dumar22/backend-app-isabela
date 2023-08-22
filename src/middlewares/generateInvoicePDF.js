import fs from 'fs';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const invoicesDir = join(dirname(fileURLToPath(import.meta.url)), '../invoices');

if (!existsSync(invoicesDir)) {
  mkdirSync(invoicesDir);
}

export const generateInvoicePDF = async (incoming) => {

  try {

    const doc = new jsPDF();
    let y = 15; // Ajustar la posición vertical del contenido
     
    // Agregar el logo de la empresa
    const logo = await fs.promises.readFile('logo1.png');
    const arrayBuffer = Buffer.from(logo);
    doc.addImage(arrayBuffer, 'PNG', 20, y, 40, 30); // Ajustar la posición y el margen izquierdo de la imagen

    doc.setFontSize(17);
    doc.setFont('bold');
    doc.text('Factura de Entrada', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 10; // Ajustar la posición del encabezado para dejar espacio al logo  
    
    // Agregar el título de la ciudad
    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('Manizales', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 10; // Ajustar la posición vertical del contenido

    // Agregar los detalles de la factura
    doc.setFontSize(12);
    const margin = 15; // Ajustar el margen derecho
    const rightX = doc.internal.pageSize.getWidth() - margin; // Calcular la posición x en base al ancho de página y el ancho del texto
    doc.text(`Número de factura: ${incoming.invoiceNumber}`, rightX, 22, { align: 'right' });
    doc.text(`Fecha: ${incoming.date}`, rightX, 22 + 5, { align: 'right' });
    doc.text(`Origen: ${incoming.origin}`, rightX, 22 + 10, { align: 'right' });
    doc.text(`Nombre del proveedor: ${incoming.providerName}`, rightX, 22 + 15, { align: 'right' });
    doc.text(`NIT del proveedor: ${incoming.providerNit}`, rightX, 22 + 20, { align: 'right' });

    y += 10; // Ajustar la posición vertical del contenido
    
    // Agregar la tabla de materiales
    const tableHeader = [['Código', 'Nombre', 'Unidad', 'Estado', 'Cantidad', 'Valor unitario', 'Total']];
    const tableRows = incoming.materialInvoiceDetail.map(
      detail => [detail.code, detail.name, detail.unity, detail.state, detail.quantity, detail.value, detail.total]);
    doc.autoTable({
      head: tableHeader,
      body: tableRows,
      startY: y + 10, // Ajustar la posición vertical del contenido
      margin: { top: 10 },
      styles: { fontSize: 10 },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 50 }, 2: { cellWidth: 20 }, 3: { cellWidth: 20 }, 4: { cellWidth: 20 }, 5: { cellWidth: 20 }, 6: { cellWidth: 20 } },
      didDrawPage: function (data) {
        // Agregar el número de factura en la parte superior derecha
        doc.setFontSize(12);
        doc.setFont('bold');
        doc.text(`Número de factura: ${incoming.invoiceNumber}`, data.settings.margin.right, data.settings.margin.top - 2, { align: 'left' });
      }
    });
    // Agregar el autotable con los datos de los materiales


    // Enviar PDF en respuesta
    const pdfPath = `${invoicesDir}/${incoming.invoiceNumber}.pdf`;
    const pdfContent = doc.output('arraybuffer');
    const buffer = Buffer.from(pdfContent);
    fs.writeFileSync(pdfPath, buffer);

    return {
      msg: 'Factura generada',
      pdfPath
    };
  } catch (error) {
    console.log(error);
    throw new Error('No se pudo generar el PDF de la factura.');
  }
};


