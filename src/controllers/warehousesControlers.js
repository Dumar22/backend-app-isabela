import { check, validationResult } from 'express-validator'

import  Warehouse  from "../models/Warehouse.js";
//import { generarJWT, generarId } from '../helpers/tokens.js'


 const getWarehouses = async( req, res ) => {

  const warehouses = await Warehouse.findAll();

  res.json( {warehouses} );
}

 const getWarehouse = async( req, res ) => {

  const { id } = req.params;

  const warehouse = await Warehouse.findByPk( id );

  if( warehouse ) {
      res.json(warehouse);
  } else {
      res.status(404).json({
          msg: `No existe una bodega con el id ${ id }`
      });
  }


}

const createWarehouse = async (req, res) => {

 //console.log(req.body);
 await check('name').notEmpty().withMessage('El Nombre no puede ir vacio').run(req)
 
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }

 // Extraer los datos
  const { body } = req;

 // Verificar que el usuario no este duplicado
  const existWarehouse = await Warehouse.findOne({ where: { name: body.name } });
 if(existWarehouse) {
     return res.status(400).json({
      msg: 'La bodega ' + body.name + ' ya existe, ingrese una diferente'
  });
 }


 // Almacenar un usuario
 const data =  {
    name: body.name.toUpperCase(), 
  }

  const warehouse = new Warehouse(data);
  
  
  await warehouse.save();

  res.status(201).json({
    msg: 'Bodega guardada con exito',
    user: warehouse
  })
  
}

const putWarehouse = async( req, res) => {
  
  try { 
    const { id }   = req.params;
    const { body } = req;
      
      const warehouse = await Warehouse.findByPk( id );
      if ( !warehouse ) {
          return res.status(404).json({
              msg: 'No existe una bodega con el nombre ' + id
          });
    }
     const data = {
      name: body.name.toUpperCase(), 
    }
  
        await warehouse.update( data );

    res.status(200).json({
      msg: 'Bodega Actualizada con exito',
      warehouse
    })


  } catch (error) {

      //console.log(error);
      res.status(500).json({
          msg: 'Contacte al administrador'
      })    
  }   
}

const deleteWarehouse = async( req, res) => {

  const { id } = req.params;

  const warehouse = await Warehouse.findByPk( id );
  if ( !warehouse ) {
      return res.status(404).json({
          msg: 'No existe una Bodega con el id ' + id
      });
  }

  //await warehouse.update({ estado: false });

  await warehouse.destroy();

  res.status(200).json({
    msg: 'Bodega Eliminada con exito',
    user: warehouse
  })
}


export {
  createWarehouse,
  deleteWarehouse,
  getWarehouse,
  getWarehouses,
  putWarehouse
}