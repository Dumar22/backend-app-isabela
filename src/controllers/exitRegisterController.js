import { check, validationResult } from 'express-validator'

import ExitMaterialRegister from "../models/ExitMaterialsRegister.js";
import MaterialExitRegisterDetail from "../models/MaterialExitRegisterDetails.js";
import WorkInstall from "../models/WorkInstall.js";
import Material from "../models/Material.js";
import Meter from "../models/Meter.js";
import User from '../models/User.js';

const getExit = async (req, res) => {
   
  // Obtener el objeto de usuario autenticado a partir del middleware validateJWT
  try {
    const user = req.user;
    
    const exit = await ExitMaterialRegister.findAll({
      where: { createdById: user.id }, 
     include: [{ model: MaterialExitRegisterDetail, as: 'materialExitRegisterDetail' },
      { model: User, attributes: ['name'], as: 'createdBy' },
      { model: WorkInstall, as: 'workInstall' } ]
    });     
     // Verificar que el usuario tenga permiso para ver la factura
     const exitAuth = exit.filter(exit=> exit.createdById === user.id);    
  
    const count = await ExitMaterialRegister.count(
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
    const exit = await ExitMaterialRegister.findAll({
      include: [MaterialExitDetail, { model: User, as: 'createdBy' }]
    });
    const totalExit = await ExitMaterialRegister.count();
    res.json({ entry, totalExit });
  } catch (error) {
    console.error(error);
    res.status(500).send('Ha ocurrido un Error Obteniendo las entradas');
  }
}

 const getExitById = async( req, res ) => {

   const { id } = req.params;
   
  const exit = await ExitMaterialRegister.findByPk(id, {
    include: [{ model: MaterialExitRegisterDetail, as: 'materialExitRegisterDetail' },
    { model: User, attributes: ['name'], as: 'createdBy' },
    { model: WorkInstall, as: 'workInstall' } ]
  });
  
  if (!exit) {
    return res.status(404).json({ error: 'Salida no encontrada' });
   }
   
   const createdBy = await exit.getCreatedBy();

    res.json({ exit, createdBy: { id: createdBy.id, name: createdBy.name } });


}

const createExit = async (req, res) => {
  try {
    const { date, exitNumber, collaboratorCode, collaboratorName, collaboratorDocument, collaboratorOperation, materialExitRegisterDetail, workInstallId } = req.body;

    const user = req.user

    // Validar campos obligatorios
    const validationRules = [
      { field: 'date', message: 'El campo fecha es obligatorio.' },
      { field: 'exitNumber', message: 'El campo número de factura es obligatorio.' },
      { field: 'collaboratorCode', message: 'El campo código del colaborador es obligatorio.' },
      { field: 'collaboratorName', message: 'El campo nombre del colaborador es obligatorio.' },
      { field: 'collaboratorDocument', message: 'El campo documento del colaborador es obligatorio.' },
      { field: 'collaboratorOperation', message: 'El campo operación del colaborador es obligatorio.' },
      { field: 'workInstallId', message: 'Debe haber una matricula válida.' },
      { field: 'materialExitRegisterDetail', message: 'Debe haber al menos un material.', isArray: true, minArrayLength: 1 }
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
    const existExitNumber = await ExitMaterialRegister.findOne({ where: { exitNumber } });
    if (existExitNumber) {
      return res.status(400).json({
        msg: `La salida de salida ${exitNumber} ya existe, ingrese una diferente.`
      });
    }

    const workInstall = await WorkInstall.findByPk(workInstallId);
if (!workInstall) {
  return res.status(404).json({
    msg: 'La matrícula u orden de trabajo de trabajo no existe.'
  });
}

// Verificar si ya existe una salida de material para la misma matrícula u orden de trabajo
const existingExit = await ExitMaterialRegister.findOne({
  where: { workInstallId }
});
if (existingExit) {
  return res.status(400).json({
    msg: 'Ya existe una salida de material asociada a esta matrícula u orden de trabajo.'
  });
}


    // Verificar si hay suficiente cantidad de materiales y medidores disponibles para dar salida
    for (const detail of materialExitRegisterDetail) {
      const { code } = detail;
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
    const exitMaterial = await ExitMaterialRegister.create({
      ...req.body,
      workInstallId: workInstall.id,
      warehouse: user.warehouse,      
      createdById: user.id 
    });


// Agregar los detalles de los materiales a la factura de salida
for (const detail of materialExitRegisterDetail) {
  const { name, code, unity, note, quantity, restore = 0, serial ='', value, obs = ''} = detail;
  
  // Crear el detalle de material
  const materialExitRegisterDetail = await MaterialExitRegisterDetail.create({
    ...detail,
    total: quantity * value,
    obs,
    exitMaterialRegisterId: exitMaterial.id
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
  msg: 'Salida creada exitosamente.',
  exitMaterial
});
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};  
  
const putExit = async (req, res) => {
  try {

    const { materialExitRegisterDetail, workInstallId } = req.body;
    console.log(req.body);
    const { id } = req.params;
    const user = req.user;

    // Verificar si la salida de material existe
    const exitMaterial = await ExitMaterialRegister.findByPk(id);
    if (!exitMaterial) {
      return res.status(404).json({
        msg: 'La salida de material no existe.'
      });
    }

    // Validar campos obligatorios
    const validationRules = [
      { field: 'date', message: 'El campo fecha es obligatorio.' },
      { field: 'exitNumber', message: 'El campo número de factura es obligatorio.' },
      { field: 'collaboratorCode', message: 'El campo código del colaborador es obligatorio.' },
      { field: 'collaboratorName', message: 'El campo nombre del colaborador es obligatorio.' },
      { field: 'collaboratorDocument', message: 'El campo documento del colaborador es obligatorio.' },
      { field: 'collaboratorOperation', message: 'El campo operación del colaborador es obligatorio.' },
      { field: 'workInstallId', message: 'Debe haber una matricula válida.' },
      { field: 'materialExitRegisterDetail', message: 'Debe haber al menos un material.', isArray: true, minArrayLength: 1 }
    ];

    for (const rule of validationRules) {
      const { field, message, isArray = false, minArrayLength = null } = rule;
      const value = req.body[field];
      if (isArray) {
        if (!Array.isArray(value) || (minArrayLength !== null && value.length < minArrayLength)) {
          return res.status(400).json({
           message
          });
        }
      } else if (!value) {
        return res.status(400).json({
          message
         });
      }
    }
    
    const workInstall = await WorkInstall.findByPk(workInstallId);
    if (!workInstall) {
      return res.status(404).json({
        msg: 'La matrícula u orden de trabajo de trabajo no existe.'
      });
    }

    // Verificar si ya existe una salida de material para la misma matrícula u orden de trabajo
    const existingExit = await ExitMaterialRegister.findOne({
      where: { workInstallId },
      attributes: ['id'],
      raw: true
    });
    if (existingExit && existingExit.id !== id) {
      return res.status(400).json({
        msg: 'Ya existe una salida de material asociada a esta matrícula u orden de trabajo.'
      });
    }

    // Verificar si hay suficiente cantidad de materiales y medidores disponibles para dar salida
    for (const detail of materialExitRegisterDetail) {
      const { code } = detail;
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
          
          return res.status(400).json({
            msg: `No hay suficientes materiales con el código ${code} para dar salida.`
           });
        }
        existingMaterial.quantity -= detail.quantity;
        await existingMaterial.save();
      }
    }

    // Actualizar la salida de material
    await exitMaterial.update({
      ...req.body,
      workInstallId: workInstall.id,
      warehouse: user.warehouse,
      updatedById: user.id
    });

      
     // Actualizar los detalles de materiales
     // Actualizar los detalles de materiales
for (const detail of req.body.materialExitRegisterDetail) {
  const existingDetail = detail.id
  ? await MaterialExitRegisterDetail.findOne({ where: { id: detail.id } })
  : null;
  
  if (existingDetail) {
    // Actualizar el detalle existente
    existingDetail.name = detail.name;
    existingDetail.code = detail.code;
    existingDetail.unity = detail.unity;
    existingDetail.note = detail.note;
    existingDetail.quantity = detail.quantity;
    await existingDetail.save();
  } else {
    // Agregar un nuevo detalle
    const { quantity, value, obs } = detail;
    const material = await Material.findOne({ where: { code: detail.code } });
    const materialExitRegisterDetail = await MaterialExitRegisterDetail.create({
      ...detail,
      total: quantity * value,
      obs,
      exitMaterialRegisterId: exitMaterial.id,
      materialId: material.id
    });
      }
    }

    return res.status(200).json({
      msg: 'Salida actualizada exitosamente.'
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: error.message });
  }
};


const deleteExit = async (req, res) => {
  try {
    const { id } = req.params;

    const exit = await ExitMaterialRegister.findByPk(id);

    if (!exit) {
      return res.status(404).json({ error: 'Entrada no encontrada' });
    }
    
    await MaterialExitRegisterDetail.destroy({
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