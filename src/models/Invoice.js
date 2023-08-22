import { DataTypes } from 'sequelize';
import db from '../config/config.js'
import MaterialInvoiceDetail from './MaterialInvoiceDetail.js';
import User from "./User.js";

const Invoice = db.define('Invoice', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'La fecha es obligatoria.' },
      isDate: { msg: 'La fecha no es una fecha válida.' },
    },
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El número de factura es obligatorio.' },
      notEmpty: { msg: 'El número de factura no puede ir vacío.' },
    },
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El origen es obligatorio.' },
      notEmpty: { msg: 'El origen no puede ir vacío.' },
    },
  },
  providerName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El nombre del proveedor es obligatorio.' },
      notEmpty: { msg: 'El nombre del proveedor no puede ir vacío.' },
    },
  },
  providerNit: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El NIT del proveedor es obligatorio.' },
      notEmpty: { msg: 'El NIT del proveedor no puede ir vacío.' },
    },
  },
  // Otros campos específicos de las salidas
},
  { db, modelName: 'invoice' });

Invoice.hasMany(MaterialInvoiceDetail, { as: 'materialInvoiceDetail', foreignKey: 'invoiceId' });
MaterialInvoiceDetail.belongsTo(Invoice, { as: 'invoice', foreignKey: 'invoiceId' });
User.hasMany(Invoice, { as: 'invoices', foreignKey: 'createdById' });
Invoice.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
export default Invoice;
