import { DataTypes } from 'sequelize';
import db from '../config/config.js'
//import Warehouse from './Warehouse.js';

const User = db.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
   rol: {
    type: DataTypes.STRING,
    allowNull: false,    
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true   
  },
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,
   
  },
},
);

export default User;
