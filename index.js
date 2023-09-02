import express from 'express';
import cors from 'cors';
import db from './src/config/config.js';
import userRoutes from './src/routes/usersRoutes.js';
import warehouseRoutes from './src/routes/warehousesRoutes.js';
import providersRoutes from './src/routes/providersRoutes.js';
import materialRoutes from './src/routes/materialsRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import collaboratorRoutes from './src/routes/collaboratorRoutes.js';
import InvoiceRoutes from './src/routes/invoiceRoutes.js';
import EntryRoutes from './src/routes/entryRoutes.js';
import MeterRoutes from './src/routes/meterRoutes.js';
import TransferRoutes from './src/routes/transferRoutes.js';
import ExitRoutes from './src/routes/exitRoutes.js';
import WorkInstall from './src/routes/workInstallRoutes.js';

const app = express();

// Configuración de las rutas, middlewares, etc.

// Configuración de middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de las rutas
app.use('/api', userRoutes);
app.use('/api', warehouseRoutes);
app.use('/api', providersRoutes);
app.use('/api', materialRoutes);
app.use('/api', searchRoutes);
app.use('/api', collaboratorRoutes);
app.use('/api', InvoiceRoutes);
app.use('/api', EntryRoutes);
app.use('/api', MeterRoutes);
app.use('/api', TransferRoutes);
app.use('/api', ExitRoutes);
app.use('/api', WorkInstall);

//Conexión con Base de Datos

try {
  await db.authenticate();
    db.sync()
    console.log('Conexión establecida con la Base de datos')
  
} catch (error) {
  console.log(error)
}

const port = process.env.PORT || 3000;
 app.listen(port, () => {
  console.log(`El Servidor esta funcionando en el puerto ${port}`)
    });
  
 
