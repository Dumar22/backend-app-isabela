import { DataTypes } from 'sequelize';
import db from '../config/config.js'

const Meter = db.define('Meter', {
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
   quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
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

export default Meter;


//podriamos manejar el ingreso de los medidores de al la bodega forma independiente al ingreso de los materiales en la aplicacion, sin embargo cuando vamos hacer las salidas como podriamos manejarlo por que las salidas de medidores son con un numero de matricula para la instalacion ademas debe ir agragada la lista de materiales que se usaron en la instalacion y tambien si se uso este medidor poder marcarlo como deshabilitado