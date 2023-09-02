import { DataTypes } from 'sequelize';
import db from '../config/config.js'

const WorkInstall = db.define('WorkInstall', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  registration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  ot: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    
  },  
  warehouse: {
    type: DataTypes.STRING,
    allowNull: false,
   
  },
  user: {
    type: DataTypes.STRING,
    allowNull: false,
  },
},
{ db, modelName: 'workInstall' });

export default WorkInstall;
