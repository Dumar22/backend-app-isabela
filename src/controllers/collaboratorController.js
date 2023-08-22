import { check, validationResult } from 'express-validator'
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import  Collaborator  from "../models/Collaborator.js";

XLSX.set_fs(fs);


 const getCollaborators = async( req, res ) => {
  const desde = Number(req.query.desde) || 0;

 try {
   
  const warehouse = req.user.warehouse;

  const collaborator = await Collaborator.findAll({ 
    where: { warehouse: warehouse }, 
    offset: desde });

  const total = await Collaborator.count({ where: { warehouse: warehouse } });

  res.json( {collaborator, total} );
 } catch (error) {
  console.log(error);
    res.status(500).json({
      ok: false,
      mensaje: 'Error al obtener los usuarios'
    });
  }
 }

 const getCollaborator = async( req, res ) => {

  const { id } = req.params;

  const collaborator = await Collaborator.findByPk( id );

  if( collaborator ) {
      res.json(collaborator);
  } else {
      res.status(404).json({
          msg: `No existe un Colaborador con el id ${ id }`
      });
  }


}

const createCollaborator = async (req, res) => {

 await check('code').notEmpty().withMessage('El Código no puede ir vacio').run(req)
 await check('name').notEmpty().withMessage('El Nombre no puede ir vacio').run(req)
 await check('operation').notEmpty().withMessage('El Campo no puede ir vacio - op').run(req)
  await check('document').notEmpty().withMessage('El Campo no puede ir vacio - doc').run(req)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

try {
  
   // Extraer los datos
   const { body } = req;
   const user = req.user;
   const warehouse = req.user.warehouse;
 
  // Verificar que el colaborador no este duplicado
  const existCollaborator = await Collaborator.findOne({ where: { document: body.document, warehouse:warehouse } });
   console.log(warehouse);
  if(existCollaborator) {
      return res.status(400).json({
       msg: 'El Colaborador con documento No: ' + body.document + ' ya existe, ingrese una diferente'
   });
  }
  // Verificar que el colaborador no este duplicado
  const collaboratorexist = await Collaborator.findOne({ where: { code: body.code, warehouse:warehouse } });
  if(collaboratorexist) {
      return res.status(400).json({
       msg: 'El código ' + body.code + ' ya existe, ingrese uno diferente'
   });
  }
 
  // Almacenar un usuario
  const data =  {
    name: body.name.toUpperCase(), 
    code: body.code,
    operation: body.operation,
    document: body.document,
    phone: body.phone,
    warehouse: user.warehouse,
    state: body.state,
    user: user.id,
   }
 
   const collaborator = new Collaborator(data);
   
   
   await collaborator.save();
 
   res.status(201).json({
     msg: 'Colaborador guardado con exito',
     collaborator
   })
} catch (error) {
  console.error(error);
    res.status(500).send('Ha ocurrido un Error');
}
  
}



const uploadCollaborator = async (req, res) => {
  try {
    const file = req.file;      
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Procesar los datos del archivo
    for (let i = 1; i < rows.length; i++) {
      const [ code, name,operation, document, warehouse ] = rows[i];
      const existingCollaborator = await Collaborator.findOne({ where: { name: name, code: code, warehouse: warehouse } });
      if (existingCollaborator) {
        console.log(`El colaborardor ${name} con código ${code} ya existe en la bodega.`);
      } else {
        const data = {
          code,
          name: name.toUpperCase(),
          operation,
          document,    
          warehouse:req.user.warehouse,          
          user: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const provider = new Collaborator(data);
        await provider.save();
       
      }
    }

    res.status(200).json({ message: 'Los colaboradores han sido agregados a la bodega.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al procesar el archivo.' });
  }
};


const putCollaborator = async( req, res) => {

  //console.log(req.body);
 await check('code').notEmpty().withMessage('El Código no puede ir vacio').run(req)
 await check('name').notEmpty().withMessage('El Nombre no puede ir vacio').run(req)
 await check('operation').notEmpty().withMessage('El Campo no puede ir vacio - op').run(req)
  await check('document').notEmpty().withMessage('El Campo no puede ir vacio - doc').run(req)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id }   = req.params;
  const { body } = req;

  try {

   
      
      const collaborator = await Collaborator.findByPk( id );
      if ( !collaborator ) {
          return res.status(404).json({
              msg: 'No existe un colaborador con el id ' + id
          });
    }    
    const data = {
      name: body.name.toUpperCase(),
      code: body.code,
      operation: body.operation,
      document: body.document,
      phone: body.phone,
      state: body.state,
    }
  
     await collaborator.update( data );

    res.status(200).json({
      msg: 'Colaborador Actualizado con exito',
      collaborator
    })


  } catch (error) {

      console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteCollaborator = async( req, res) => {

  const { id } = req.params;

  const collaborator = await Collaborator.findByPk( id );
  if ( !collaborator ) {
      return res.status(404).json({
          msg: 'No existe un Colaborador con el id ' + id
      });
  }

  //await warehouse.update({ estado: false });

  await collaborator.destroy();

  res.status(200).json({
    msg: 'Colaborador Eliminado con exito',
    collaborator
  })
}


export {
  createCollaborator,
  deleteCollaborator,
  getCollaborator,
  getCollaborators,
  putCollaborator,
  uploadCollaborator
}