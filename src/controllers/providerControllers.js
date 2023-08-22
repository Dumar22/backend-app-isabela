import { check, validationResult } from 'express-validator'
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import  Provider  from "../models/Provider.js";
//import { generarJWT, generarId } from '../helpers/tokens.js'
XLSX.set_fs(fs);

 const getProviders = async( req, res ) => {
  const warehouse = req.user.warehouse;

  const providers = await Provider.findAll({ where: { warehouse: warehouse } });
  const total = await Provider.count({ where: { warehouse: warehouse } });

  res.json( {providers, total} );
}

 const getProvider = async( req, res ) => {

  const { id } = req.params;

  const provider = await Provider.findByPk( id );

  if( provider ) {
      res.json(provider);
  } else {
      res.status(404).json({
          msg: `No existe un Proveedor con el id ${ id }`
      });
  }


}

const createProvider = async (req, res) => {


 await check('name').notEmpty().withMessage('El campo Nombre es requerido').run(req)
 await check('nit').notEmpty().withMessage('El campo Nit es requerido').run(req)
  await check('ally').notEmpty().withMessage('El campo Aliado es requerido').run(req)
  
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
  const existProvider = await Provider.findOne({ where: { name: body.name, warehouse:warehouse } });
 if(existProvider) {
     return res.status(400).json({
      msg: 'El Proveedor ' + body.name + ' ya existe, ingrese uno diferente'
  });
 }
  const existProviderNit = await Provider.findOne({ where: { nit: body.nit, warehouse:warehouse } });
 if(existProviderNit) {
     return res.status(400).json({
      msg: 'El Proveedor con nit ' + body.nit + ' ya existe, ingrese uno diferente'
  });
 }
 

 // Almacenar un usuario
 const data =  {
   name: body.name.toUpperCase(), 
   nit: body.nit,
   ally: body.ally,
   warehouse: user.warehouse,
   user: user.id,
  }

  const provider = new Provider(data);
  
  
  await provider.save();

  res.status(201).json({
    msg: 'Proveedor guardado con exito',
    provider: provider
  })
 } catch (error) {
  console.error(error);
    res.status(500).send('Ha ocurrido un Error');
 }
  
}

const uploadProviders = async (req, res) => {
  try {
    const file = req.file;      
    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Procesar los datos del archivo
    for (let i = 1; i < rows.length; i++) {
      const [name,nit, warehouse] = rows[i];
      const existingProvider = await Provider.findOne({ where: { name: name, nit: nit, warehouse: warehouse } });
      if (existingProvider) {
        console.log(`El material ${name} con proveedor ${nit} ya existe en la bodega.`);
      } else {
        const data = {
          name: name.toUpperCase(),
          nit,
          warehouse:req.user.warehouse,
          user: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const provider = new Provider(data);
        await provider.save();
        console.log(`El proveedor ${name} con nit ${nit} ha sido agregado a la bodega.`);
      }
    }

    res.status(200).json({ message: 'Los Provedoress han sido agregados a la bodega.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ha ocurrido un error al procesar el archivo.' });
  }
};

const putProvider = async( req, res) => {

  const { id }   = req.params;
  const { body } = req;
  const user = req.user;
  try {       
      const provider = await Provider.findByPk( id );
      if ( !provider ) {
          return res.status(404).json({
              msg: 'No existe un Proveedor con el nombre ' + id
          });
    }
      
    const data = {
      name: body.name.toUpperCase(),
      nit: body.nit,
      ally: body.ally,
      warehouse: user.warehouse,
      user: user.id,
    }
  
     await provider.update( data );

    res.status(200).json({
      msg: 'Proveedor Actualizado con exito',
      provider: provider
    })

  } catch (error) {

      console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteProvider = async( req, res) => {

  const { id } = req.params;

  const provider = await Provider.findByPk( id );
  if ( !provider ) {
      return res.status(404).json({
          msg: 'No existe un Proveedor con el id ' + id
      });
  }

  //await warehouse.update({ estado: false });

  await provider.destroy();

  res.status(200).json({
    msg: 'Proveedor Eliminado con exito',
    provider: provider
  })
}


export {
  createProvider,
  deleteProvider,
  getProviders,
  getProvider,
  putProvider,
  uploadProviders
}