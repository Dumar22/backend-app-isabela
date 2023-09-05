import { DataTypes } from 'sequelize';
import db from '../config/config.js'
import MaterialExitRegisterDetail from './MaterialExitRegisterDetails.js';
import WorkInstall from './WorkInstall.js';
import User from "./User.js";

const ExitMaterialRegister = db.define('ExitMaterialRegister', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      notNull: { msg: 'La fecha es obligatoria.' },
      isDate: { msg: 'La fecha no es una fecha válida.' },
    },
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  exitNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El número de factura es obligatorio.' },
      notEmpty: { msg: 'El número de factura no puede ir vacío.' },
    },
  },
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El origen es obligatorio.' },
      notEmpty: { msg: 'El origen no puede ir vacío.' },
    },
  },
  collaboratorCode: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El código es obligatorio.' },
      notEmpty: { msg: 'El código no puede ir vacío.' },
    },
  },
  collaboratorName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El nombre es obligatorio.' },
      notEmpty: { msg: 'El nombre no puede ir vacío.' },
    },
  },
  collaboratorDocument: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El número de documento es obligatorio.' },
      notEmpty: { msg: 'El número de documento no puede ir vacío.' },
    },
  },
  collaboratorOperation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El campo operación es obligatorio.' },
      notEmpty: { msg: 'El campo operación no puede ir vacío.' },
    },
  },
  // Otros campos específicos de las salidas
},
  { db, modelName: 'exitMaterialRegister' });

  ExitMaterialRegister.hasMany(MaterialExitRegisterDetail, { as: 'materialExitRegisterDetail', foreignKey: 'exitMaterialRegisterId' });

  MaterialExitRegisterDetail.belongsTo(ExitMaterialRegister, { as: 'exitMaterialRegister', foreignKey: 'exitMaterialRegisterId' });

User.hasMany(ExitMaterialRegister, { as: 'exitMaterialRegister', foreignKey: 'createdById' });

ExitMaterialRegister.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });

WorkInstall.hasMany(ExitMaterialRegister, { as: 'exitMaterialRegister', foreignKey: 'workInstallId' });

ExitMaterialRegister.belongsTo(WorkInstall, { as: 'workInstall', foreignKey: 'workInstallId' });


export default ExitMaterialRegister;