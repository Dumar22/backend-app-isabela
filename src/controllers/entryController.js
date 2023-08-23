import { check, validationResult } from 'express-validator'

import Entry from "../models/Entry.js";
import MaterialEntryDetail from "../models/MaterialEntryDetail.js";
import Material from "../models/Material.js";
import User from '../models/User.js';

const getEntry = async (req, res) => {
   
  // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
  try {
    const user = req.user;
    
    const entry = await Entry.findAll({
      where: { createdById: user.id },
      include: [{ model: MaterialEntryDetail, as: 'materialEntryDetail' },
      { model: User, attributes: ['name'], as: 'createdBy' } ]
    });
     
     // Verificar que el usuario tenga permiso para ver la factura
     const entries = entry.filter(entry => entry.createdById === user.id);
    
  
    const count = await Entry.count(
      {
        where: { createdById: user.id }
      }
    );
    
    res.json( {count, entries} );
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los datos'
    });
    
  }

  ;
}

const getAllEntry = async (req, res) => {
  try {
    const entry = await Entry.findAll({
      include: [MaterialEntryDetail, { model: User, as: 'createdBy' }]
    });
    const totalEntry = await Entry.count();
    res.json({ entry, totalEntry });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ha ocurrido un Error Obteniendo las entradas');
  }
}

 const getEntryById = async( req, res ) => {

   const { id } = req.params;
   
  const entry = await Entry.findByPk(id, {
    include: [{ model: MaterialEntryDetail, as: 'materialEntryDetail' } ]
  });
  
  if (!entry) {
    return res.status(404).json({ error: 'Entrada no encontrada' });
   }
   
   const createdBy = await entry.getCreatedBy();

    res.json({ entry, createdBy: { id: createdBy.id, name: createdBy.name } });


}

const createEntry = async (req, res) => {
  try {
      // Extraer datos de la solicitud
    const { entryNumber, origin, providerName, materialEntryDetail } = req.body;
     
    // Validar campos obligatorios
    const validationRules = [
      check('date').notEmpty().withMessage('El campo fecha es obligatorio.- fecha'),
      check('entryNumber').notEmpty().withMessage('El campo número de factura es obligatorio. - número de entrada'),
      check('origin').notEmpty().withMessage('El campo origen es obligatorio. - origen'),
      check('providerName').notEmpty().withMessage('El campo nombre del proveedor es obligatorio. - proveedor'),
      check('providerNit').notEmpty().withMessage('El campo NIT del proveedor es obligatorio. - nit'),
      check('materialEntryDetail').isArray({ min: 1 }).withMessage('Debe haber al menos un material.')
    ];
    await Promise.all(validationRules.map(validation => validation.run(req)));

    // Manejar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verificar si la Entrada ya existe
    const existEntryNumber = await Entry.findOne({ where: { entryNumber } });
    if (existEntryNumber) {
      return res.status(400).json({
        msg: `La Entrada ${entryNumber} ya existe, ingrese una diferente.`
      });
    }

    // Crear objeto de factura
    const user = req.user;
    const entry = await Entry.create({
        ...req.body,   
          origin: origin.toUpperCase(),
          providerName: providerName.toUpperCase(),
          createdById: user.id  // Asignar el ID del usuario creador de la entrada
        });    

   // Crear los detalles de materiales y asociarlos a la entrada
    for (const materialDetail of  materialEntryDetail) {
      const { code, name, quantity, unity, serial = '', value, obs } = materialDetail;

      // Crear el detalle de material
      const materialEntryDetail = await MaterialEntryDetail.create({
        code,
        name: name.toUpperCase(),
        unity,
        quantity,
        value,
        serial,
        total: quantity * value,
        obs,
        entryId: entry.id // Asociar el detalle de material a la entrada creada anteriormente
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


const putEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { origin, providerName, materialEntryDetail } = req.body;

    const entry = await Entry.findByPk(id);


   
    await check('date').notEmpty().withMessage('El Campo no puede ir vacio - fecha').run(req)
    await check('entryNumber').notEmpty().withMessage('El Campo no puede ir vacio - numero entrada').run(req)
    await check('origin').notEmpty().withMessage('El Campo no puede ir vacio- origen').run(req)
    await check('providerName').notEmpty().withMessage('El Campo no puede ir vacio - provedor').run(req)
    await check('providerNit').notEmpty().withMessage('El Campo no puede ir vacio - nit').run(req)
    await check('materialEntryDetail').isArray({ min: 1 }).withMessage('Debe haber al menos un material.').run(req)

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
        providerName: providerName.toUpperCase(),
        createdById: user.id  // Asignar el ID del usuario creador de la entrada
      });

    // Actualizar los detalles de materiales asociados a la entrada
    for (const materialDetail of materialEntryDetail) {
        const { id: materialEntryDetailId, code, name, unity, quantity, serial = '', value } = materialDetail;
  
        if (materialEntryDetailId) {
          // Si el detalle de material ya existe, actualizarlo
          const materialEntryDetail = await MaterialEntryDetail.findByPk(materialEntryDetailId);
  
          if (!materialEntryDetail) {
            console.log(`El detalle de material con ID ${materialEntryDetailId} no existe.`);
            continue;
          }

          const { serial = 0, ...otherProps } = req.body;
  
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
          const materialEntryDetail = await MaterialEntryDetail.create({
            code,
            name: name.toUpperCase(),
            unity,            
            quantity,
            value,
            serial,
            total: quantity * value,
            obs,
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
            console.log(`El material con código ${code} no existe en la tabla de materiales.`);
          }
        }
      }
  
      res.status(200).json({ message: 'Entrada de materiales actualizada exitosamente.' });

     
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo actualizar la factura.' });
  }
};

const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findByPk(id);

    if (!entry) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    await MaterialEntryDetail.destroy({
      where: { id: id }
    });

    await entry.destroy();

    res.json({ message: 'Entrada eliminada correctamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo eliminar la Entrada.' });
  }
};


export {
  createEntry,
  deleteEntry,
  getAllEntry ,
  getEntry,
  getEntryById,
  putEntry,

}