import { DataTypes } from 'sequelize';
import db from '../config/config.js'

const Provider = db.define('Provider', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    
  },
  ally: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El almacén del material es obligatorio.' },
      notEmpty: { msg: 'El almacén del material no puede estar vacío.' },
    },
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Provider;
