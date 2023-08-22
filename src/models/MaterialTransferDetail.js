import { DataTypes } from 'sequelize';
import db from '../config/config.js'


const MaterialTransferDetail = db.define('MaterialTransferDetail', {
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
  serial:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // Otros campos específicos de los detalles de materiales
},
{ db, modelName: 'materialTransferDetail' }
);



export default MaterialTransferDetail;
