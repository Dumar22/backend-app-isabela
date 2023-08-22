import { DataTypes } from 'sequelize';
import db from '../config/config.js'
import MaterialTransferDetail from './MaterialTransferDetail.js';
import User from "./User.js";

const Transfer = db.define('Transfer', {
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
  transferNumber: {
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
destination: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El origen es obligatorio.' },
      notEmpty: { msg: 'El origen no puede ir vacío.' },
    },
  },
  autorization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El nombre del proveedor es obligatorio.' },
      notEmpty: { msg: 'El nombre del proveedor no puede ir vacío.' },
    },
  },
  delivery: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El NIT del proveedor es obligatorio.' },
      notEmpty: { msg: 'El NIT del proveedor no puede ir vacío.' },
    },
  },
  documentdelivery: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El NIT del proveedor es obligatorio.' },
      notEmpty: { msg: 'El NIT del proveedor no puede ir vacío.' },
    },
  },
  receive: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El NIT del proveedor es obligatorio.' },
      notEmpty: { msg: 'El NIT del proveedor no puede ir vacío.' },
    },
  },
  documentreceive: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El NIT del proveedor es obligatorio.' },
      notEmpty: { msg: 'El NIT del proveedor no puede ir vacío.' },
    },
  },
  // Otros campos específicos de las salidas
},
  { db, modelName: 'transfer' });

Transfer.hasMany(MaterialTransferDetail, { as: 'materialTransferDetail', foreignKey: 'transferId' });
MaterialTransferDetail.belongsTo(Transfer, { as: 'transfer', foreignKey: 'transferId' });
User.hasMany(Transfer, { as: 'transfer', foreignKey: 'createdById' });
Transfer.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

export default Transfer;