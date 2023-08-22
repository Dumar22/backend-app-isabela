import { DataTypes } from 'sequelize';
import db from '../config/config.js'

const Material = db.define('Material', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
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
    unique: true,
  },
  unity: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'La unidad del material es obligatoria.' },
      notEmpty: { msg: 'La unidad del material no puede estar vacía.' },
    },
  },
   quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'La cantidad del material no puede ser negativa.' },
    },
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'El valor del material no puede ser negativo.' },
    },
  },
  serial: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue:'',
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El almacén del material es obligatorio.' },
      notEmpty: { msg: 'El almacén del material no puede estar vacío.' },
    },
  },
  available: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue:true,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },

});

export default Material;
