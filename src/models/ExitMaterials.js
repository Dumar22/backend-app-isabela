import { DataTypes } from 'sequelize';
import db from '../config/config.js'
import MaterialExitDetail from './MaterialExitDetails.js';
import User from "./User.js";

const ExitMaterial = db.define('ExitMaterial', {
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
  { db, modelName: 'exitMaterial' });

  ExitMaterial.hasMany(MaterialExitDetail, { as: 'materialExitDetail', foreignKey: 'exitMaterialId' });
MaterialExitDetail.belongsTo(ExitMaterial, { as: 'exitMaterial', foreignKey: 'exitMaterialId' });
User.hasMany(ExitMaterial, { as: 'exitMaterial', foreignKey: 'createdById' });
ExitMaterial.belongsTo(User, { as: 'createdBy', foreignKey: 'createdById' });
export default ExitMaterial;