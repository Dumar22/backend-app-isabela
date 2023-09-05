import { check, validationResult } from 'express-validator'

import ExitMaterial from "../models/ExitMaterials.js";
import MaterialExitDetail from "../models/MaterialExitDetails.js";
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

    res.json({ exit, createdBy: { id: createdBy.id, name: createdBy.name } });


}

const createExit = async (req, res) => {
  try {
    const { date, exitNumber, collaboratorCode, collaboratorName, collaboratorDocument, collaboratorOperation, materialExitDetail } = req.body;

    const user = req.user

    // Validar campos obligatorios
    const validationRules = [
      { field: 'date', message: 'El campo fecha es obligatorio.' },
      { field: 'exitNumber', message: 'El campo número de factura es obligatorio.' },
      { field: 'collaboratorCode', message: 'El campo código del colaborador es obligatorio.' },
      { field: 'collaboratorName', message: 'El campo nombre del colaborador es obligatorio.' },
      { field: 'collaboratorDocument', message: 'El campo documento del colaborador es obligatorio.' },
      { field: 'collaboratorOperation', message: 'El campo operación del colaborador es obligatorio.' },
      { field: 'materialExitDetail', message: 'Debe haber al menos un detalle.', isArray: true, minArrayLength: 1 }
    ];

    for (const rule of validationRules) {
      const { field, message, isArray = false, minArrayLength = null } = rule;
      const value = req.body[field];
      if (isArray) {
        if (!Array.isArray(value) || (minArrayLength !== null && value.length < minArrayLength)) {
          throw new Error(message);
        }
      } else if (!value) {
        throw new Error(message);
      }
    }

    // Verificar si la factura ya existe
    const existExitNumber = await ExitMaterial.findOne({ where: { exitNumber } });
    if (existExitNumber) {
      return res.status(400).json({
        msg: `La salida de salida ${exitNumber} ya existe, ingrese una diferente.`
      });
    }

    // Verificar si hay suficiente cantidad de materiales y medidores disponibles para dar salida
    for (const detail of materialExitDetail) {
      const { code } = detail;
      console.log(code);
      if (code.startsWith('MED')) {
        const existingMeter = await Meter.findOne({ where: { code } });
        if (!existingMeter) {
          throw new Error(`No existe un medidor con el código ${code}.`);
        }
        if (existingMeter.quantity < detail.quantity) {
          throw new Error(`No hay suficientes medidores con el código ${code} para dar salida.`);
        }
        existingMeter.quantity -= detail.quantity;
        await existingMeter.save();
      } else {
        const existingMaterial = await Material.findOne({ where: { code } });
        if (!existingMaterial) {
          throw new Error(`No existe un material con el código ${code}.`);
        }
        if (existingMaterial.quantity < detail.quantity) {
          throw new Error(`No hay suficientes materiales con el código ${code} para dar salida.`);
        }
        existingMaterial.quantity -= detail.quantity;
        await existingMaterial.save();
      }
    }

    // // Crear la factura de salida
    const exitMaterial = await ExitMaterial.create({
      date,
      exitNumber,
      collaboratorCode,
      collaboratorName,
      collaboratorDocument,
      collaboratorOperation,
      warehouse: user.warehouse,      
      createdById: user.id 
    });


// Agregar los detalles de los materiales a la factura de salida
for (const detail of materialExitDetail) {
  const { name, code, unity, note, quantity, restore = 0, serial ='', value, obs = ''} = detail;
  
  // Crear el detalle de material
  const materialExitDetail = await MaterialExitDetail.create({
    name,
    code,
    unity,
    note,
    quantity,
    restore,
    serial,
    value,
    total: quantity * value,
    obs,
    exitMaterialId: exitMaterial.id
  });

  // Actualizar el material correspondiente
  const material = await Material.findOne({ where: { code } });
  material.quantity -= quantity;
  await material.save();
  
  // Actualizar el medidor correspondiente si el código comienza con "MED"
  if (code.startsWith('MED')) {
    const meter = await Meter.findOne({ where: { code } });
    meter.quantity -= quantity;
    await meter.save();
  }
}

return res.status(200).json({
  msg: 'Factura de salida creada exitosamente.'
});
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

  
  
const putExit = async (req, res) => {
  try {
    const { date, exitNumber, collaboratorCode, collaboratorName, collaboratorDocument, collaboratorOperation, materialExitDetail } = req.body;
    const { id } = req.params;

    // Validar campos obligatorios
    const requiredFields = ['date', 'exitNumber', 'collaboratorCode', 'collaboratorName', 'collaboratorDocument', 'collaboratorOperation', 'materialExitDetail'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new Error(`El campo ${field} es obligatorio.`);
      }
    }

    // Verificar si la factura existe
    const exitMaterial = await ExitMaterial.findOne({ where: { id } });
    if (!exitMaterial) {
      return res.status(404).json({
        msg: 'La factura de salida no existe.'
      });
    }
 // Verificar si hay suficiente cantidad de materiales y medidores disponibles para dar salida
 for (const detail of materialExitDetail) {
  const { code } = detail;
  console.log(code);
  if (code.startsWith('MED')) {
    const existingMeter = await Meter.findOne({ where: { code } });
    if (!existingMeter) {
      throw new Error(`No existe un medidor con el código ${code}.`);
    }
    if (existingMeter.quantity < detail.quantity) {
      throw new Error(`No hay suficientes medidores con el código ${code} para dar salida.`);
    }
    existingMeter.quantity -= detail.quantity;
    await existingMeter.save();
  } else {
    const existingMaterial = await Material.findOne({ where: { code } });
    if (!existingMaterial) {
      throw new Error(`No existe un material con el código ${code}.`);
    }
    if (existingMaterial.quantity < detail.quantity) {
      throw new Error(`No hay suficientes materiales con el código ${code} para dar salida.`);
    }
    existingMaterial.quantity -= detail.quantity;
    await existingMaterial.save();
  }
}

    // Actualizar los campos de la factura de salida
    exitMaterial.date = date;
    exitMaterial.exitNumber = exitNumber;
    exitMaterial.collaboratorCode = collaboratorCode;
    exitMaterial.collaboratorName = collaboratorName;
    exitMaterial.collaboratorDocument = collaboratorDocument;
    exitMaterial.collaboratorOperation = collaboratorOperation;
    await exitMaterial.save();

    // Actualizar los detalles de los materiales asociados a la factura de salida
    await MaterialExitDetail.destroy({ where: { exitMaterialId: id } });
    for (const detail of materialExitDetail) {
      const { name, code, unity, note, quantity, restore, serial, value } = detail;
      await MaterialExitDetail.create({
        name,
        code,
        unity,
        note,
        quantity,
        restore,
        serial,
        value,
        exitMaterialId: id
      });
    }

    return res.status(200).json({
      msg: 'Factura de salida actualizada exitosamente.'
    });
  } catch (error) {
    return res.status(500).json({
      msg: 'Ocurrió un error al actualizar la factura de salida.',
      error: error.message
    });
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