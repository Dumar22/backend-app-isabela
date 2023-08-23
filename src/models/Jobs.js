import { DataTypes } from 'sequelize';
import db from '../config/config.js'


const Jobs = db.define('Jobs', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default Jobs;