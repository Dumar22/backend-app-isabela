import { response } from 'express';
import { Op } from "sequelize";
import db from '../config/config.js'

import Collaborator from "../models/Collaborator.js";
import Invoice from "../models/Invoice.js";
import Material from '../models/Material.js';
import MaterialInvoiceDetail from '../models/MaterialInvoiceDetail.js';
import Provider from "../models/Provider.js";
import User from "../models/User.js";
import  Warehouse  from "../models/Warehouse.js";
import Meter from '../models/Meter.js';


// Función para buscar materiales
export const searchAll = async (req, res = response) => {

  const searchTerm = req.params.search;  

    // Buscar los materiales que contengan el término de búsqueda en su nombre
    const [ users, materials, provider, collaborator, invoice, warehouses ] = await Promise.all([
      User.findAll({ where: { name: { [Op.like]: `%${searchTerm}%` } } }),      
      Collaborator.findAll({ where: { name: { [Op.like]: `%${searchTerm}%` } } }),
      Invoice.findAll({ where: { invoiceNumber: { [Op.like]: `%${searchTerm}%` } } }),
      Material.findAll({ where: { name: { [Op.like]: `%${searchTerm}%` } } }),
      Provider.findAll({ where: { name: { [Op.like]: `%${searchTerm}%` } } }),
      Warehouse.findAll({ where: { name: { [Op.like]: `%${searchTerm}%` } } }),
    ]);

  res.json({
    ok: true,
    users, materials, provider, collaborator, invoice, warehouses
    
 })
 
};


export const getDocumentosColeccion = async (req, res = response) => {
  const table = req.params.table;
  const searchTerm = req.params.search;

  let data = [];

  switch (table) {
    case 'invoices':
      data = await Invoice.findAll({
        where: {
          [Op.or]: [
            { invoiceNumber: { [Op.like]: `%${searchTerm}%` } },
            { origin: { [Op.like]: `%${searchTerm}%` } }
          ]
        }
      });
      break;

    case 'materials':
      data = await Material.findAll({
        where: {
          [Op.or]: [
            { code: { [Op.like]: `%${searchTerm}%` } },
            { name: { [Op.like]: `%${searchTerm}%` } }
          ]
        }
      });
      break;

    case 'meters':
      data = await Meter.findAll({
        where: {
          [Op.or]: [
            { code: { [Op.like]: `%${searchTerm}%` } },
            { name: { [Op.like]: `%${searchTerm}%` } },
            { serial: { [Op.like]: `%${searchTerm}%` } },
          ]
        }
      });
      break;

    case 'providers':
      data = await Provider.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { nit: { [Op.like]: `%${searchTerm}%` } }
          ]
        }
      });
      break;

    case 'collaborators':
      data = await Collaborator.findAll({
        where: {
          [Op.or]: [
            { code: { [Op.like]: `%${searchTerm}%` } },
            { name: { [Op.like]: `%${searchTerm}%` } }
          ]
        }
      });      
      break;

    case 'users':
      data = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
            { user: { [Op.like]: `%${searchTerm}%` } },
          ]
        }
      });
      break;
    case 'warehouses':
      data = await Warehouse.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${searchTerm}%` } },
          ]
        }
      });
      break;

    default:
      return res.status(400).json({
        ok: false,
        msg: 'La tabla tiene que ser users, materials, providers, collaborators, invoices, warehouses'
      });
  }

  res.json({
    ok: true,
    resultados: data
  });
};


// export const getDocumentosColeccion = async(req, res = response ) => {

//   const table    = req.params.table;
//   const searchTerm = req.params.search;  

//   let data = [];

//   switch ( table ) {
//       case 'invoices':
//           data = await Invoice.findAll({
//             where: { invoiceNumber: { [Op.like]: `%${searchTerm}%` } },
//             include: [ { model: MaterialInvoiceDetail },              
//             ]
//           });
//       break;

//       case 'materials':
//       data = await Material.findAll({
//         where: { name: { [Op.like]: `%${searchTerm}%` } }
//       });
//       break;

//     case 'providers':
//       data = await Provider.findAll({
//         where: { name: { [Op.like]: `%${searchTerm}%` } }
//       });

//       break;
    
//       case 'collaborators':
//         data = await Collaborator.findAll({
//           where: { name: { [Op.like]: `%${searchTerm}%` } }
//         }); 
//       break;
    
//       case 'users':
//         data = await User.findAll({
//           where: { name: { [Op.like]: `%${searchTerm}%` } }
//         }); 
//       break;
  
//       default:
//           return res.status(400).json({
//               ok: false,
//               msg: 'La tabla tiene que ser users, materials, provider, collaborator, invoice, warehouses'
//           });
//   }
  
//   res.json({
//       ok: true,
//       resultados: data
//   })
 

// }

