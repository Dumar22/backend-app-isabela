import { check, validationResult } from 'express-validator'
import fs from 'fs';

import Invoice from "../models/Invoice.js";
import MaterialInvoiceDetail from "../models/MaterialInvoiceDetail.js";
import Material from "../models/Material.js";
import User from '../models/User.js';
import {  generateInvoicePDF } from '../middlewares/generateInvoicePDF.js';





const getInvoices = async (req, res) => {
   
  // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
  try {
    const user = req.user;
    
    const invoice = await Invoice.findAll({
      where: { createdById: user.id },
      include: [{ model: MaterialInvoiceDetail, as: 'materialInvoiceDetail' },
      { model: User, attributes: ['name'], as: 'createdBy' } ]
    });
     
     // Verificar que el usuario tenga permiso para ver la factura
     const invoiceAuth = invoice.filter(invoice => invoice.createdById === user.id);
    
  
    const count = await Invoice.count(
      {
        where: { createdById: user.id }
      }
    );
    
    res.json( {count, invoiceAuth} );
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los datos'
    });
    
  }

  ;
}

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [MaterialInvoiceDetail, { model: User, as: 'createdBy' }]
    });
    const totalInvoices = await Invoice.count();
    res.json({ invoices, totalInvoices });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while retrieving invoices.');
  }
}

 const getInvoice = async( req, res ) => {

   const { id } = req.params;
   
  const invoice = await Invoice.findByPk(id, {
    include: [{ model: MaterialInvoiceDetail, as: 'materialInvoiceDetail' } ]
  });
  
  if (!invoice) {
    return res.status(404).json({ error: 'Factura no encontrada' });
   }
   
   const createdBy = await invoice.getCreatedBy();

    res.json({ invoice, createdBy: { id: createdBy.id, name: createdBy.name } });


}

const createInvoice = async (req, res) => {
  try {
      // Extraer datos de la solicitud
    const { invoiceNumber, origin, providerName, materials } = req.body;
     
    // Validar campos obligatorios
    const validationRules = [
      check('date').notEmpty().withMessage('El campo fecha es obligatorio.'),
      check('invoiceNumber').notEmpty().withMessage('El campo número de factura es obligatorio.'),
      check('origin').notEmpty().withMessage('El campo origen es obligatorio.'),
      check('providerName').notEmpty().withMessage('El campo nombre del proveedor es obligatorio.'),
      check('providerNit').notEmpty().withMessage('El campo NIT del proveedor es obligatorio.'),
      check('materials').isArray({ min: 1 }).withMessage('Debe haber al menos un material.')
    ];
    await Promise.all(validationRules.map(validation => validation.run(req)));

    // Manejar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si la factura ya existe
    const existInvoiceNumber = await Invoice.findOne({ where: { invoiceNumber } });
    if (existInvoiceNumber) {
      return res.status(400).json({
        msg: `La factura ${invoiceNumber} ya existe, ingrese una diferente.`
      });
    }

    // Crear objeto de factura
    const user = req.user;
    const incomingData = {
    ...req.body,   
      origin: origin.toUpperCase(),
      providerName: providerName.toUpperCase(),
      createdById: user.id
    };
    const incoming = await Invoice.create(incomingData);
    
    if (materials && materials.length > 0) {
      // Crear detalles de materiales y asociarlos a la entrada
      const incomingDetails = await Promise.all(materials.map(async (material) => {
        // Crear objeto de detalle de material
        const incomingDetailData = {
          ...material,
          name: material.name.toUpperCase(),
          total: material.quantity * material.value
        };
        const incomingDetail = await MaterialEntryDetail.create(incomingDetailData);
    
        // Asociar detalle de material a la entrada
        await incomingDetail.setEntry(incoming);
    
        // Incrementar cantidad de materiales disponibles en la base de datos
        const { code, name, quantity } = material;
        const existingMaterial = await Material.findOne({ where: { [Op.or]: [{ code }, { name }] } });
        if (existingMaterial) {
          existingMaterial.increment('quantity', { by: quantity });
        } else {
          // Si el material no existe en la base de datos, crear uno nuevo
          const newMaterialData = {
            code,
            name: name.toUpperCase(),
            unity,
            state,
            quantity,
            value,
            total: quantity * value
          };
          await Material.create(newMaterialData);
        }
    
        // Devolver detalle de material creado
        return incomingDetail;
      }));
    
      // Crear respuesta exitosa
      const response = {
        message: 'La entrada se registró correctamente.',
        entry: incoming,
        details: incomingDetails
      };
      res.send(response);
    } else {
      return res.status(400).json({ message: 'El arreglo de materiales está vacío.' });
    }
   
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo crear la entrada de materiales.' });
  }
};


const putInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    await check('date').notEmpty().withMessage('El Campo no puede ir vacio - fecha').run(req)
    await check('invoiceNumber').notEmpty().withMessage('El Campo no puede ir vacio').run(req)
    await check('origin').notEmpty().withMessage('El Campo no puede ir vacio').run(req)
    await check('providerName').notEmpty().withMessage('El Campo no puede ir vacio').run(req)
    await check('providerNit').notEmpty().withMessage('El Campo no puede ir vacio').run(req)
    await check('materials').isArray({ min: 1 }).withMessage('Debe haber al menos un material.').run(req)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, invoiceNumber, origin, providerName, providerNit, materials } = req.body;

    // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
    const user = req.user;
    console.log('usuario token'+ user.name);

    invoice.date = date;
    invoice.invoiceNumber = invoiceNumber;
    invoice.origin = origin.toUpperCase();
    invoice.providerName = providerName.toUpperCase();
    invoice.providerNit = providerNit;
    invoice.createdById = user.id;

    await invoice.save();

    if (materials && materials.length > 0) {
      const details = await MaterialInvoiceDetail.findAll({
        where: {
          invoiceId: invoice.id
        }
      });

      await Promise.all(
        details.map(async (detail) => {
          await detail.destroy();
        })
      );

      await Promise.all(
        materials.map(async (material) => {
          const { code, name, unity, state, value, quantity } = material;

          const dataIncomig = {
            code: code,
            name: name.toUpperCase(),
            unity,
            state,
            quantity,
            value,
            total: quantity * value
          }

          const incomingDetail = new MaterialInvoiceDetail(dataIncomig);
          await incomingDetail.save();

          // Asocia el detalle de entrada al encabezado de entrada
          await incomingDetail.setInvoice(invoice);

          return incomingDetail;
        })
      );

      const updatedInvoice = await Invoice.findByPk(id, {
        include: [ { model: MaterialInvoiceDetail, as: 'materialInvoiceDetail' } ]
      });

      res.json({ invoice: updatedInvoice });
    } else {
      return res.status(400).json({ message: 'El arreglo de materiales está vacío.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo actualizar la factura.' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    await MaterialInvoiceDetail.destroy({
      where: { invoiceId: id }
    });

    await invoice.destroy();

    res.json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo eliminar la factura.' });
  }
};

const dowloadPdf = async (req, res) => {
  try {
    // Obtener factura por ID
    const { id } = req.params;
   
    const invoice = await Invoice.findByPk(id, {
      include: [{ model: MaterialInvoiceDetail, as: 'materialInvoiceDetail' } ]
    });
    
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Generar PDF de factura
    const result = await generateInvoicePDF(invoice);

    // Enviar PDF en respuesta

    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    res.sendFile(result.pdfPath, err => {
      if (err) return res.status(500).json({error: err}); 
    });
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    // res.send(pdfContent);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al descargar factura' });
  }
};

export {
  createInvoice,
  deleteInvoice,
  getAllInvoices,
  getInvoices,
  getInvoice,
  putInvoice,
  dowloadPdf
}