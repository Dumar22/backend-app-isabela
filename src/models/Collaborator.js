import { DataTypes } from 'sequelize';
import db from '../config/config.js'

const Collaborator = db.define('Collaborator', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'El código del colaborardor ya está en uso.' },
    validate: {
      notNull: { msg: 'El código del colaborardor es obligatorio.' },
      notEmpty: { msg: 'El código del colaborardor no puede estar vacío.' },
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El nombre del colaborardor es obligatorio.' },
      notEmpty: { msg: 'El nombre del colaborardor no puede estar vacío.' },
    },
  }, 
  operation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'El campo es obligatorio.' },
      notEmpty: { msg: 'El campo no puede estar vacío.' },
    },
  },
  document: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'El documeto ingresado ya está en uso.' },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0'
  },
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Collaborator;
