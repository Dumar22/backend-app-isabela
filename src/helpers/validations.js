import Invoice from "../models/Invoice.js";

     // Verificar la factura que no este duplicada
export const invoiceNumberExist = async (invoiceNumber) => {
  
  const existInvoiceNumber = await Invoice.findOne({ where: { invoiceNumber } });
  if (existInvoiceNumber) {
    throw new Error(`La factura  ${invoiceNumber}  ya existe, ingrese una diferente`);
  }

}

