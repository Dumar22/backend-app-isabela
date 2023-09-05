import { DataTypes } from 'sequelize';
import db from '../config/config.js'


const MaterialExitRegisterDetail = db.define('MaterialExitRegisterDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El nombre del material es obligatorio.' },
      notEmpty: { msg: 'El nombre del material no puede estar vacío.' },
    },
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El código del material es obligatorio.' },
      notEmpty: { msg: 'El código del material no puede estar vacío.' },
    },
  },
  unity: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'La unidad del material es obligatoria.' },
      notEmpty: { msg: 'La unidad del material no puede estar vacía.' },
    },
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,   
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'La cantidad del material no puede ser negativa.' },
    },
  },
  restore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'La cantidad del material no puede ser negativa.' },
    },
  },  
  serial:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'El valor del material no puede ser negativo.' },
    },
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  obs: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue:''
  },
  // Otros campos específicos de los detalles de materiales
},
{ db, modelName: 'materialExitRegisterDetail' }
);

export default MaterialExitRegisterDetail;
