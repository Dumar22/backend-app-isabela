import { check, validationResult } from 'express-validator'
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import  Meter  from "../models/Meter.js";


XLSX.set_fs(fs);
//import { generarJWT, generarId } from '../helpers/tokens.js'


 const getMeters = async( req, res ) => {

 const warehouse = req.user.warehouse;
  
  const meters = await Meter.findAll({ where: { warehouse: warehouse } });
  const total = await Meter.count();
  res.json( { total, meters } );
}

 const getMeter = async( req, res ) => {

  const { id } = req.params;

  const meter = await Meter.findByPk( id );

  if( meter ) {
      res.json({meter});
  } else {
      res.status(404).json({
          msg: `No existe un Material con el id ${ id }`
      });
  }


}

const createMeter = async (req, res) => {

 await check('name').notEmpty().withMessage('El Campo Nombre no puede ir vacio - nombre').run(req)
 await check('code').notEmpty().withMessage('El Campo Codigo  no puede ir vacio - código').run(req)
 await check('unity').notEmpty().withMessage('El Campo unidad no puede ir vacio - unidad').run(req) 
 await check('value').notEmpty().withMessage('El Campo valor no puede ir vacio - valor').run(req)
 await check('serial').notEmpty().withMessage('El Campo serial no puede ir vacio - serial').run(req)
 await check('brand').notEmpty().withMessage('El Campo marca no puede ir vacio - serial').run(req)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

 // Extraer los datos
 const { name, code,unity,quantity = 1 , value, serial, brand, warehouse, } = req.body;
    // Obtener los datos completos del usuario que está logeado utilizando el middleware validateJWT

 const user = req.user;
 const verifywarehouse = req.user.warehouse;
 
  // Verificar si el material ya existe en la bodega
  const existingMaterial = await Meter.findOne({ where: { name: name, serial: serial, warehouse: verifywarehouse } });
  if (existingMaterial) {
    return res.status(400).json({ message: 'El Medidor ya existe en la bodega.' });
  }

 if (quantity > 1 || quantity <= 0) {
    return res.status(400).json({ message: 'Error en la cantidad de ingreso' });
 }
 

 // Almacenar 
 const data =  {
   name: name.toUpperCase(), 
   code,
   unity,   
   value,
   serial,
   brand,
   total : quantity * value,
   warehouse: user.warehouse,  
   user: user.id,
   createdAt: new Date(),
   updatedAt: new Date()  
  }

  const provider = new Meter(data);
  
  
  await provider.save();

  res.status(201).json({
    msg: 'Medidor guardado con exito',
    provider: provider
  })
  
}

const uploadMeters = async (req, res) => {
    try {
      const user = req.user;
    const verifywarehouse = req.user.warehouse;
      const file = req.file;      
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const totalRows = rows.length - 1; // Excluimos la fila de encabezado
    let processedRows = 0;
  
      // Procesar los datos del archivo
      for (let i = 1; i < rows.length; i++) {
        const [name, code, unity, quantity, value, serial, brand, warehouse] = rows[i];
        const existingMaterial = await Meter.findOne({ where: { name: name, serial: serial, warehouse: verifywarehouse } });
        if (existingMaterial) {
          console.log(`El medidor ${name} con número de serie ${serial} ya existe en la bodega.`);
          continue;
        } else {
          const data = {
            name: name.toUpperCase(),
            code,
            unity,
            quantity,
            value,
            serial,
            brand,
            total: quantity * value,
            warehouse: user.warehouse,
            user: user.id,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Emitir progreso
            processedRows++;  

          const provider = new Meter(data);
          await provider.save();
          console.log(`El medidor ${name} con número de serie ${serial} ha sido agregado a la bodega.`);
        }
      }
      const progressPercentage = (processedRows / totalRows) * 100;
      res.status(200).json({ msg: 'Los medidores han sido agregados a la bodega.',progress: progressPercentage  });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Ha ocurrido un error al procesar el archivo.' });
    }
  };

const putMeter = async( req, res) => {

  try {
    const { id }   = req.params;
    const { user,warehouse, code, ...body} = req.body;   
      
      const meter = await Meter.findByPk( id );
      if ( !meter ) {
          return res.status(404).json({
              msg: 'No existe un Material con el id ' + id
          });   }
          

          if (body.quantity > 1 || body.quantity <= 0) {
            return res.status(400).json({ msg: 'Error en la cantidad de ingreso' });
         }
         
   // Convertir el nombre a mayúsculas
   if (body.name) {
    body.name = body.name.toUpperCase();
  }

  body.total = body.quantity * body.value,
   
    // Actualizar el medidor
    Object.entries(body).forEach(([key, value]) => {
      meter[key] = value;
    });

    await meter.save();

    res.json({ meter });

  } catch (error) {
      //console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteMeter = async( req, res) => {

  const { id } = req.params;

  const meter = await Meter.findByPk( id );
  if ( !meter ) {
      return res.status(404).json({
          msg: 'No existe un Proveedor con el id ' + id
      });
  }

  await meter.destroy();

  res.status(200).json({
    msg: 'Medidor Eliminado con exito',
    provider: meter
  })
}


export {
  createMeter,
  deleteMeter,
  getMeters ,
  getMeter,
  putMeter,
  uploadMeters
}