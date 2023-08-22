import { DataTypes } from 'sequelize';
import db from '../config/config.js'


const Warehouse = db.define('Warehouse', {
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

export default Warehouse;
