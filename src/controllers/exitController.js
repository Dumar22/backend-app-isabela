import { check, validationResult } from 'express-validator'

import ExitMaterial from "../models/ExitMaterials.js";
import MaterialsExitDetail from "../models/MaterialExitDetails.js";
import Material from "../models/Material.js";
import Meter from "../models/Meter.js";
import User from '../models/User.js';

const getExit = async (req, res) => {
   
  // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
  try {
    const user = req.user;
    
    const exit = await ExitMaterial.findAll({
      where: { createdById: user.id },
      include: [{ model: MaterialExitDetail, as: 'materialExitDetail' },
      { model: User, attributes: ['name'], as: 'createdBy' } ]
    });
     
     // Verificar que el usuario tenga permiso para ver la factura
     const exitAuth = exit.filter(exit=> exit.createdById === user.id);
    
  
    const count = await ExitMaterial.count(
      {
        where: { createdById: user.id }
      }
    );
    
    res.json( {count, exitAuth} );
    
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los datos'
    });
    
  }

  ;
}

const getAllExit = async (req, res) => {
  try {
    const exit = await ExitMaterial.findAll({
      include: [MaterialExitDetail, { model: User, as: 'createdBy' }]
    });
    const totalExit = await ExitMaterial.count();
    res.json({ entry, totalExit });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ha ocurrido un Error Obteniendo las entradas');
  }
}

 const getExitById = async( req, res ) => {

   const { id } = req.params;
   
  const exit = await ExitMaterial.findByPk(id, {
    include: [{ model: MaterialExitDetail, as: 'materialExitDetail' } ]
  });
  
  if (!exit) {
    return res.status(404).json({ error: 'Salida no encontrada' });
   }
   
   const createdBy = await exit.getCreatedBy();

    res.json({ entry, createdBy: { id: createdBy.id, name: createdBy.name } });


}

const createExit = async (req, res) => {
    try {
      // Extraer datos de la solicitud
      const { exitNumber, collaboratorCode, collaboratorName, collaboratorDocument, collaboratorOperation, details } = req.body;
  
      // Validar campos obligatorios
      const validationRules = [
        check('date').notEmpty().withMessage('El campo fecha es obligatorio.'),
        check('exitNumber').notEmpty().withMessage('El campo número de factura es obligatorio.'),
        check('collaboratorCode').notEmpty().withMessage('El campo código del colaborador es obligatorio.'),
        check('collaboratorName').notEmpty().withMessage('El campo nombre del colaborador es obligatorio.'),
        check('collaboratorDocument').notEmpty().withMessage('El campo documento del colaborador es obligatorio.'),
        check('collaboratorOperation').notEmpty().withMessage('El campo operación del colaborador es obligatorio.'),
        check('details').isArray({ min: 1 }).withMessage('Debe haber al menos un detalle.')
      ];
      await Promise.all(validationRules.map(validation => validation.run(req)));
  
      // Manejar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      // Verificar si la factura ya existe
      const existExitNumber = await ExitMaterial.findOne({ where: { exitNumber } });
      if (existExitNumber) {
        return res.status(400).json({
          msg: `La factura de salida ${exitNumber} ya existe, ingrese una diferente.`
        });
      }
  
      // Verificar si hay suficiente cantidad de materiales y medidores disponibles para dar salida
      for (let i = 0; i < details.length; i++) {
        const { name, code, unity, note, quantity, restore, serial, value } = details[i];
        if (code.startsWith('MED')) {
          // Si el código comienza con "MED", se trata de un medidor
          const existingMeter = await Meter.findOne({ where: { code } });
          if (!existingMeter) {
            return res.status(400).json({
              msg: `El medidor con código ${code} no existe o ya fue dado de baja.`
            });
          }
          if (existingMeter.quantity < quantity) {
            return res.status(400).json({
              msg: `No hay suficientes medidores con código ${code} disponibles para dar salida.`
            });
          }
        } else {
          // Si no comienza con "MED", se trata de un material
          const existingMaterial = await Material.findOne({ where: { code } });
          if (!existingMaterial) {
            return res.status(400).json({
              msg: `El material con código ${code} no existe o ya fue dado de baja.`
            });
          }
          if (existingMaterial.quantity < quantity) {
            return res.status(400).json({
              msg: `No hay suficientes materiales con código ${code} disponibles para dar salida.`
            });
          }
        }
      }
  
      // Crear la factura de salida
      const newExit = await ExitMaterial.create({
        date: req.body.date,
        exitNumber,
        warehouse: req.user.warehouse,
        collaboratorCode,
        collaboratorName,
        collaboratorDocument,
        collaboratorOperation
      });
  
      // Agregar los detalles a la factura de salida y actualizar los materiales y medidores correspondientes
      for (let i = 0; i < details.length; i++) {
        const { name, code, unity, note, quantity, restore, serial, value } = details[i];
        const total = quantity * value;
        if (code.startsWith('MED')) {
          // Si el código comienza con "MED", se trata de un medidor
          await MaterialsExitDetail.create({
            name,
            code,
            unity,
            note,
            quantity,
            restore,
            serial,
            value,
            total,
            materialsExitId: newExit.id
          });
          await Meter.update(
            { quantity: Sequelize.literal(`quantity - ${quantity}`) },
            { where: { code } }
          );
        } else {
          // Si no comienza con "MED", se trata de un material
          await MaterialsExitDetail.create({
            name,
            code,
            unity,
            note,
            quantity,
            restore,
            serial,
            value,
            total,
            materialsExitId: newExit.id
          });
          await Material.update(
            { quantity: Material.sequelize.literal(`quantity - ${quantity}`) },
            { where: { code } }
          );
        }
      }
  
      res.json({ msg: 'Factura de salida creada exitosamente.' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: 'Hubo un error al crear la factura de salida.' });
    }
  };
  
  
const putExit = async (req, res) => {
    try {
        // Extraer datos de la solicitud
        const { exitNumber, collaboratorCode, collaboratorName, collaboratorDocument, collaboratorOperation, details } = req.body;
    
        // Validar campos obligatorios
        const validationRules = [
          check('date').notEmpty().withMessage('El campo fecha es obligatorio.'),
          check('exitNumber').notEmpty().withMessage('El campo número de factura es obligatorio.'),
          check('collaboratorCode').notEmpty().withMessage('El campo código del colaborador es obligatorio.'),
          check('collaboratorName').notEmpty().withMessage('El campo nombre del colaborador es obligatorio.'),
          check('collaboratorDocument').notEmpty().withMessage('El campo documento del colaborador es obligatorio.'),
          check('collaboratorOperation').notEmpty().withMessage('El campo operación del colaborador es obligatorio.'),
          check('details').isArray({ min: 1 }).withMessage('Debe haber al menos un detalle.')
        ];
        await Promise.all(validationRules.map(validation => validation.run(req)));
    
        // Manejar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
    
        // Verificar si la factura de salida existe
        const exitId = req.params.id;
        const existExit = await MaterialsExit.findOne({ where: { id: exitId } });
        if (!existExit) {
          return res.status(404).json({
            msg: `No se encontró la factura de salida con ID ${exitId}.`
          });
        }
    
        // Verificar si la factura de salida ya fue entregada
        if (existExit.delivered) {
          return res.status(400).json({
            msg: `La factura de salida con ID ${exitId} ya fue entregada y no puede ser modificada.`
          });
        }
    
        // Verificar si hay suficiente cantidad de materiales y medidores disponibles para dar salida
        for (let i = 0; i < details.length; i++) {
          const { name, code, unity, note, quantity, restore, serial, value } = details[i];
          if (code.startsWith('MED')) {
            // Si el código comienza con "MED", se trata de un medidor
            const existingMeter = await Meter.findOne({ where: { code } });
            if (!existingMeter) {
              return res.status(400).json({
                msg: `El medidor con código ${code} no existe o ya fue dado de baja.`
              });
            }
            const existingExitMeter = await MaterialsExitDetail.findOne({
              where: { materialsExitId: exitId, code }
            });
            if (existingExitMeter) {
              const totalQuantity = existingExitMeter.quantity + quantity;
              if (existingMeter.quantity < totalQuantity) {
                return res.status(400).json({
                  msg: `No hay suficientes medidores con código ${code} disponibles para dar salida.`
                });
              }
            } else {
              if (existingMeter.quantity < quantity) {
                return res.status(400).json({
                  msg: `No hay suficientes medidores con código ${code} disponibles para dar salida.`
                });
              }
            }
          } else {
            // Si no comienza con "MED", se trata de un material
            const existingMaterial = await Material.findOne({ where: { code } });
            if (!existingMaterial) {
              return res.status(400).json({
                msg: `El material con código ${code} no existe o ya fue dado de baja.`
              });
            }
            const existingExitMaterial = await MaterialsExitDetail.findOne({
              where: { materialsExitId: exitId, code }
            });
            if (existingExitMaterial) {
              const totalQuantity = existingExitMaterial.quantity + quantity;
              if (existingMaterial.quantity < totalQuantity) {
                return res.status(400).json({
                  msg: `No hay suficientes materiales con código ${code} disponibles para dar salida.`
                });
              }
            } else {
              if (existingMaterial.quantity < quantity) {
                return res.status(400).json({
                  msg: `No hay suficientes materiales con código ${code} disponibles para dar salida.`
                });
              }
            }
          }
        }
    
        // Actualizar la factura de salida
        await MaterialsExit.update(
          {
            date: req.body.date,
            exitNumber,
            collaboratorCode,
            collaboratorName,
            collaboratorDocument,
            collaboratorOperation
          },
          { where: { id: exitId } }
        );
    
        // Actualizar los detalles de la factura de salida y los materiales y medidores correspondientes
        for (let i = 0; i < details.length; i++) {
          const { name, code, unity, note, quantity, restore, serial, value } = details[i];
          const total = quantity * value;
          if (code.startsWith('MED')) {
            // Si el código comienza con "MED", se trata de un medidor
            const existingExitMeter = await MaterialsExitDetail.findOne({
              where: { materialsExitId: exitId, code }
            });
            if (existingExitMeter) {
              await MaterialsExitDetail.update(
                {
                  name,
                  unity,
                  note,
                  quantity,
                  restore,
                  serial,
                  value,
                  total
                },
                { where: { id: existingExitMeter.id } }
              );
              await Meter.update(
                { quantity: Sequelize.literal(`quantity - ${quantity - existingExitMeter.quantity}`) },
                { where: { code } }
              );
            } else {
              await MaterialsExitDetail.create({
                name,
                code,
                unity,
                note,
                quantity,
                restore,
                serial,
                value,
                total,
                materialsExitId: exitId
              });
              await Meter.update(
                { quantity: Sequelize.literal(`quantity - ${quantity}`) },
                { where: { code } }
              );
            }
          } else {
            // Si no comienza con "MED", se trata de un material
            const existingExitMaterial = await MaterialsExitDetail.findOne({
              where: { materialsExitId: exitId, code }
            });
            if (existingExitMaterial) {
              await MaterialsExitDetail.update(
                {
                  name,
                  unity,
                  note,
                  quantity,
                  restore,
                  serial,
                  value,
                  total
                },
                { where: { id: existingExitMaterial.id } }
              );
              await Material.update(
                { quantity: Material.sequelize.literal(`quantity - ${quantity - existingExitMaterial.quantity}`) },
                { where: { code } }
              );
            } else {
              await MaterialsExitDetail.create({
                name,
                code,
                unity,
                note,
                quantity,
                restore,
                serial,
                value,
                total,
                materialsExitId: exitId
              });
              await Material.update(
                { quantity: Material.sequelize.literal(`quantity - ${quantity}`) },
                { where: { code } }
              );
            }
          }
        }
    
        res.json({ msg: 'Factura de salida actualizada exitosamente.' });
      } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Hubo un error al crear la factura de salida.' });
      }
    };

const deleteExit = async (req, res) => {
  try {
    const { id } = req.params;

    const exit = await ExitMaterial.findByPk(id);

    if (!exit) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    await MaterialExitDetail.destroy({
      where: { id: id }
    });

    await exit.destroy();

    res.json({ message: 'Entrada eliminada correctamente' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'No se pudo eliminar la Entrada.' });
  }
};


export {
  createExit,
  deleteExit,
  getAllExit ,
  getExit,
  getExitById,
  putExit,

}