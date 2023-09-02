import { check, validationResult } from 'express-validator'
import * as XLSX from 'xlsx/xlsx.mjs';
import * as fs from 'fs';
import  Material  from "../models/Material.js";

XLSX.set_fs(fs);

 const getMaterials = async( req, res ) => {

 const warehouse = req.user.warehouse;
  
  const materials = await Material.findAll({ where: { warehouse: warehouse } });
  const total = await Material.count({ where: { warehouse: warehouse } } );  
  res.json( { total, materials } );
}

 const getMaterial = async( req, res ) => {

  const { id } = req.params;

  const material = await Material.findByPk( id );

  if( material ) {
      res.json(material);
  } else {
      res.status(404).json({
          msg: `No existe un Material con el id ${ id }`
      });
  }


}

const createMaterial = async (req, res) => {

 await check('name').notEmpty().withMessage('El Campo Nombre no puede ir vacio').run(req)
 await check('code').notEmpty().withMessage('El Campo Codigo  no puede ir vacio').run(req)
 await check('unity').notEmpty().withMessage('El Campo unidad no puede ir vacio').run(req)
 await check('quantity').notEmpty().withMessage('El Campo cantidad no puede ir vacio').run(req)
 await check('value').notEmpty().withMessage('El Campo valor no puede ir vacio').run(req)
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

 try {

  // Extraer los datos
 const { name, code, unity, quantity, value, serial = '', warehouse, } = req.body;
 const user = req.user;
 const verifywarehouse = req.user.warehouse;
 

 // Verificar si el material ya existe en la bodega
 const existingMaterial = await Material.findOne({ where: { name:name, warehouse:verifywarehouse } });

 if (existingMaterial) {
   return res.status(400).json({
     message: `El material ${name} ya existe en la bodega.`});
 }
 const existingMaterialCode = await Material.findOne({ where: { code:code, warehouse:verifywarehouse } });
 if (existingMaterialCode) {
   return res.status(400).json({
     message: `El material con código ${code} ya existe en la bodega.` });
 }

  // Obtener los datos completos del usuario que está logeado utilizando el middleware validateJWT


// Almacenar 
const data =  {
  name: name.toUpperCase(), 
  code,
  unity,
  quantity,
  value,
  serial,
  total : quantity * value,
  warehouse: user.warehouse,  
  user: user.id,
  createdAt: new Date(),
  updatedAt: new Date()  
 }

 const provider = new Material(data);
 
 
 await provider.save();

 res.status(201).json({
   msg: 'Material guardado con exito',
   provider: provider
 })
 } catch (error) {
  console.error(error);
    res.status(500).send('Ha ocurrido un Error');
 }
  
}

const uploadMaterials = async (req, res) => {
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
      const [name, code, unity, quantity, value, serial = '', warehouse] = rows[i];
     // console.log('datos archivo => ',name, code, unity, quantity, value, serial);
      const existingMaterial = await Material.findOne({ where: { name: name,code: code, warehouse: verifywarehouse } });
      //console.log('materiales exit =>:',existingMaterial);
      if (existingMaterial) {        
        console.log(`El material ${name} con código ${code} ya existe en la bodega.`);
        existingMaterial.quantity += quantity;
        existingMaterial.total = existingMaterial.quantity * existingMaterial.value;
        await existingMaterial.save();
        console.log(`Se ha actualizado la cantidad del material ${name} con código ${code}.`);
      } else {
        const data = {
          name: name.toUpperCase(),
          code,
          unity,
          quantity,
          value,
          serial,
          total: quantity * value,
          warehouse:req.user.warehouse,
          user: req.user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Emitir progreso
      processedRows++;         

        const material = new Material(data);
        await material.save();
        console.log(`El material ${name} con código ${code} ha sido agregado a la bodega.`);
      }
    }
    const progressPercentage = (processedRows / totalRows) * 100;
    res.status(200).json({ message: 'Los materiales han sido agregados a la bodega.',progress: progressPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Ha ocurrido un error al procesar el archivo.' });
  }
};

const putMaterial = async( req, res) => {

  try {
    const { id }   = req.params;
    const { body } = req;

    const material = await Material.findByPk(id);
    if (!material) {
      return res.status(404).json({
        msg: 'No existe un material con el id ' + id
      });
    }

    // Verificar si el nombre o el código del material ya existe en la base de datos
    const existingMaterial = await Material.findOne({ where: { name: body.name, warehouse: material.warehouse } });
    if (existingMaterial && existingMaterial.id !== id) {
      return res.status(400).json({
        msg: `El material ${body.name} ya existe en la bodega.`
      });
    }
    const existingMaterialCode = await Material.findOne({ where: { code: body.code, warehouse: material.warehouse } });
    if (existingMaterialCode && existingMaterialCode.id !== id) {
      return res.status(400).json({
        msg: `El material con código ${body.code} ya existe en la bodega.`
      });
    }

    // Actualizar el campo "total" si se ha cambiado la cantidad o el valor
    const oldQuantity = material.quantity;
    const oldvalue = material.value;
    if (body.quantity !== oldQuantity || body.value !== oldvalue) {
      body.total = body.quantity * body.value;
    }

         
   // Convertir el nombre a mayúsculas
   if (body.name) {
    body.name = body.name.toUpperCase();
  }
   
    await material.update( body);

    res.status(200).json({
      msg:'Material Actualizado con exito'});

  } catch (error) {
      //console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteMaterial = async( req, res) => {

  const { id } = req.params;

  const material = await Material.findByPk( id );
  if ( !material ) {
      return res.status(404).json({
          msg: 'No existe un Proveedor con el id ' + id
      });
  }

  await material.destroy();

  res.status(200).json({
    msg: 'Material Eliminado con exito',
    provider: material
  })
}


export {
  createMaterial,
  deleteMaterial,
  getMaterials,
  getMaterial,
  putMaterial,
  uploadMaterials
}