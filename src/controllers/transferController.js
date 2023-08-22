import { check, validationResult } from 'express-validator'

import Transfer from "../models/Transfer.js";
import MaterialTransferDetail from "../models/MaterialTransferDetail.js";
import Material from "../models/Material.js";
import User from '../models/User.js';

const getTransfer = async (req, res) => {
   
  // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
  try {
    const user = req.user;
    
    const transfer = await Transfer.findAll({
      where: { createdById: user.id },
      include: [{ model: MaterialTransferDetail, as: 'materialTransferDetail' },
      { model: User, attributes: ['name'], as: 'createdBy' } ]
    });
     
     // Verificar que el usuario tenga permiso para ver la factura
     const transferAuth = transfer.filter(transfer => transfer.createdById === user.id);
    
  
    const count = await Transfer.count(
      {
        where: { createdById: user.id }
      }
    );
    
    res.json( {count, transferAuth} );
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los datos'
    });
    
  }

  ;
}

const getAllTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findAll({
      include: [MaterialTransferDetail, { model: User, as: 'createdBy' }]
    });
    const totalTransfer = await Transfer.count();
    res.json({ transfer, totalEntry });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ha ocurrido un Error Obteniendo las entradas');
  }
}

 const getTransferById = async( req, res ) => {

   const { id } = req.params;
   
  const transfer = await Transfer.findByPk(id, {
    include: [{ model: MaterialTransferDetail, as: 'materialTransferDetail' } ]
  });
  
  if (!transfer) {
    return res.status(404).json({ error: 'Entrada no encontrada' });
   }
   
   const createdBy = await transfer.getCreatedBy();

    res.json({ transfer, createdBy: { id: createdBy.id, name: createdBy.name } });


}

const createTransfer = async (req, res) => {
  try {
      // Extraer datos de la solicitud
    const { transferNumber, origin, destination, autorization,delivery, receive, materials } = req.body;
     
    // Validar campos obligatorios
    const validationRules = [
      check('date').notEmpty().withMessage('El campo fecha es obligatorio.- fecha'),
      check('transferNumber').notEmpty().withMessage('El campo número de transferencia es obligatorio. - número de transferencia'),
      check('origin').notEmpty().withMessage('El campo origen es obligatorio. - origen'),
      check('destination').notEmpty().withMessage('El campo origen es obligatorio. - destino'),
      check('autorization').notEmpty().withMessage('El campo nombre del proveedor es obligatorio. - autoriza'),
      check('delivery').notEmpty().withMessage('El campo quien entrega del es obligatorio.'),
      check('receive').notEmpty().withMessage('El campo quien recibe del es obligatorio.'),
      check('materials').isArray({ min: 1 }).withMessage('Debe haber al menos un material.')
    ];
    await Promise.all(validationRules.map(validation => validation.run(req)));

    // Manejar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si la Entrada ya existe
    const existTransferNumber = await Transfer.findOne({ where: { transferNumber } });
    if (existTransferNumber) {
      return res.status(400).json({
        msg: `El Traslado ${transferNumber} ya existe, ingrese una diferente.`
      });
    }

    // Crear objeto de factura
    const user = req.user;
    const transfer = await Transfer.create({
        ...req.body,   
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          autorization: autorization.toUpperCase(),
          delivery: delivery.toUpperCase(),
          receive: receive.toUpperCase(),
          createdById: user.id  // Asignar el ID del usuario creador de la entrada
        });    

   // Crear los detalles de materiales y asociarlos a la entrada
    for (const materialDetail of materials) {
      const { code, name, quantity, unity, serial = '', value } = materialDetail;

      // Crear el detalle de material
      const materialEntryDetail = await MaterialTransferDetail.create({
        code,
        name: name.toUpperCase(),
        unity,
        quantity,
        value,
        serial,
        total: quantity * value,
        transferId: transfer.id // Asociar el detalle de material a la entrada creada anteriormente
      });

      // Actualizar la cantidad y el valor del material en la tabla de materiales
      const [updatedRows] = await Material.update(
        {
          quantity: Material.sequelize.literal(`quantity - ${quantity}`),
          value
        },
        {
          where: {
            code: code
          }
        }
      );

      if (updatedRows === 0) {
        // Si no se actualizó ningún registro, significa que el material no existe en la tabla de materiales
        // En este caso, se puede crear un nuevo registro en la tabla de materiales si se desea
        console.log(`El material con código ${code} no existe en la tabla de materiales.`);
      }
    }

    res.status(201).json({ message: 'Entrada de materiales creada exitosamente.' });
   
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo crear la entrada de materiales.' });
  }
};


const putTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { origin, destination, autorization,receive,delivery, materials } = req.body;

    const transfer = await Transfer.findByPk(id);

    if (!transfer) {  //validar si el traslado existe
      return res.status(404).json({ error: 'Traslado no encontrado o no existe.' });
    }

    await check('date').notEmpty().withMessage('El Campo no puede ir vacio - fecha').run(req)
    await check('transferNumber').notEmpty().withMessage('El Campo no puede ir vacio - numero transferencia').run(req)
    await check('origin').notEmpty().withMessage('El Campo no puede ir vacio- origen').run(req)
    await check('destination').notEmpty().withMessage('El Campo no puede ir vacio- destino').run(req)
    await check('autorization').notEmpty().withMessage('El Campo no puede ir vacio - autoriza').run(req)
    await check('delivery').notEmpty().withMessage('El Campo no puede ir vacio -envia').run(req)
    await check('receive').notEmpty().withMessage('El Campo no puede ir vacio -envia').run(req)
    await check('materials').isArray({ min: 1 }).withMessage('Debe haber al menos un material.').run(req)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }  
    // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
    const user = req.user;
     // Actualizar la entrada de materiales
     await entry.update({
        ...req.body,   
        origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          autorization: autorization.toUpperCase(),
          delivery: delivery.toUpperCase(),
          receive: receive.toUpperCase(),
        createdById: user.id  // Asignar el ID del usuario creador de la entrada
      });

    // Actualizar los detalles de materiales asociados a la entrada
    for (const materialDetail of materials) {
        const { id: materialEntryDetailId, code, name, unity, quantity, serial = '', value } = materialDetail;
  
        if (materialEntryDetailId) {
          // Si el detalle de material ya existe, actualizarlo
          const materialEntryDetail = await MaterialTransferDetail.findByPk(materialEntryDetailId);
  
          if (!materialEntryDetail) {
            console.log(`El detalle de material con ID ${materialEntryDetailId} no existe.`);
            continue;
          }
          // Actualizar el detalle de material
          await materialEntryDetail.update({
            code,
            name: name.toUpperCase(),
            unity,            
            quantity,
            serial,
            value,
            total: quantity * value,
          });
  
          // Actualizar la cantidad y el valor del material en la tabla de materiales
          const [updatedRows] = await Material.update(
            {
              quantity: Material.sequelize.literal(`quantity - ${materialEntryDetail.previous('quantity')} + ${quantity}`),
              value
            },
            {
              where: {
                code: code
              }
            }
          );
  
          if (updatedRows === 0) {
            console.log(`El material con código ${code} no existe en la tabla de materiales.`);
          }
        } else {
          // Si el detalle de material no existe, crearlo y asociarlo a la entrada
          const materialEntryDetail = await MaterialTransferDetail.create({
            code,
            name: name.toUpperCase(),
            unity,            
            quantity,
            value,
            serial,
            total: quantity * value,
            entryId: entry.id
          });
  
          // Actualizar la cantidad y el valor del material en la tabla de materiales
          const [updatedRows] = await Material.update(
            {
              quantity: Material.sequelize.literal(`quantity + ${quantity}`),
              value
            },
            {
              where: {
                code: code
              }
            }
          );
  
          if (updatedRows === 0) {
            console.log(`El traslado con código ${code} no existe en la tabla de materiales.`);
          }
        }
      }
  
      res.status(200).json({ message: 'Traslado de materiales actualizado exitosamente.' });

     
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo actualizar el traslado.' });
  }
};

const deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await Transfer.findByPk(id);

    if (!transfer) {
      return res.status(404).json({ error: 'Traslado no encontrado' });
    }
    
    await MaterialTransferDetail.destroy({
      where: { id: id }
    });

    await transfer.destroy();

    res.json({ message: 'Traslado eliminado correctamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo eliminar el Traslado.' });
  }
};


export {
  createTransfer,
  deleteTransfer,
  getAllTransfer ,
  getTransfer,
  getTransferById,
  putTransfer,

}