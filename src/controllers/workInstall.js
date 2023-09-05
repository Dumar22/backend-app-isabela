import { check, validationResult } from 'express-validator'
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import  WorkInstall  from "../models/WorkInstall.js";
//import { generarJWT, generarId } from '../helpers/tokens.js'
XLSX.set_fs(fs);

 const getWorkInstall = async( req, res ) => {
  const warehouse = req.user.warehouse;

  const workInstall = await WorkInstall.findAll({ where: { warehouse: warehouse } });
  const total = await WorkInstall.count({ where: { warehouse: warehouse } });

  res.json( {workInstall, total} );
}

 const getWorkInstallById = async( req, res ) => {

  const { id } = req.params;

  const workInstall = await WorkInstall.findByPk( id );

  if( workInstall ) {
      res.json({workInstall});
  } else {
      res.status(404).json({
          msg: `No existe un Proveedor con el id ${ id }`
      });
  }


}

const createWorkInstall = async (req, res) => {


 await check('name').notEmpty().withMessage('El campo Nombre es requerido').run(req)
 await check('registration').notEmpty().withMessage('El campo Matrícula es requerido').run(req)
  await check('ot').notEmpty().withMessage('El campo Orden de trabajo es requerido').run(req)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
 
 try {
  
  // Extraer los datos
  const { body } = req;
  const user = req.user;
  const warehouse = req.user.warehouse;

 // Verificar que el provedor no este duplicado
  const existWorkInstall = await WorkInstall.findOne({ where: { registration: body.registration, warehouse:warehouse } });
 if(existWorkInstall) {
     return res.status(400).json({
      msg: 'La matricula ' + body.registration + ' ya existe, ingrese una diferente'
  });
 }
 
 // Almacenar un usuario
 const data =  {
   ...body,
   registration: body.registration,
   name: body.name.toUpperCase(), 
   warehouse: user.warehouse,
   user: user.id,
  }

  const workInstall = new WorkInstall(data);
  
  
  await workInstall.save();

  res.status(201).json({
    msg: 'Matricula guardada con exito',
   
  })
 } catch (error) {
  console.error(error);
    res.status(500).send('Ha ocurrido un Error');
 }
  
}

const uploadWorkInstall = async (req, res) => {
  try {
    const file = req.file;      
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Procesar los datos del archivo
    for (let i = 1; i < rows.length; i++) {
      const [registration, name, ot, address, phone, warehouse] = rows[i];
      const existingWorkInstall = await WorkInstall.findOne({ where: { registration: registration, warehouse: warehouse } });
      if (existingWorkInstall) {
        console.log(`La matricula ${registration} ya existe en la bodega.`);
      } else {
        const data = {
            ...body,
          name: name.toUpperCase(),          
          warehouse:req.user.warehouse,
          user: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const workInstall = new WorkInstall(data);
        await workInstall.save();
        console.log(`La matricula ${registration} ha sido agregada a la bodega.`);
      }
    }

    res.status(200).json({ message: 'Las matriculas han sido agregadas a la bodega.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al procesar el archivo.' });
  }
};

const putWorkInstall = async( req, res) => {

  const { id }   = req.params;
  const { body } = req;
  const user = req.user;
  try {       
      const workInstall = await WorkInstall.findByPk( id );
      if ( !workInstall ) {
          return res.status(404).json({
              msg: 'No existe una Matricula ' + id
          });
    }
      
    const data = {
        ...body,
        name: body.name.toUpperCase(),          
        warehouse:user.warehouse,
        user: user.id,
    }
  
     await workInstall.update( data );

    res.status(200).json({
      msg: 'Matricula Actualizada con exito',
      WorkInstall
    })

  } catch (error) {

      console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteWorkInstall = async( req, res) => {

  const { id } = req.params;

  const workInstall = await WorkInstall.findByPk( id );
  if ( !workInstall ) {
      return res.status(404).json({
          msg: 'No existe una matricula con el id ' + id
      });
  }

  //await warehouse.update({ estado: false });

  await workInstall.destroy();

  res.status(200).json({
    msg: 'Matricula Eliminada con exito',
    workInstall: workInstall
  })
}


export {
  createWorkInstall,
  deleteWorkInstall,
  getWorkInstall,
  getWorkInstallById,
  putWorkInstall,
  uploadWorkInstall
}