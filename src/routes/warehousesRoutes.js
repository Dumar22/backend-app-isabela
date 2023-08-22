import express from "express";
import { createWarehouse, deleteWarehouse, getWarehouses,getWarehouse, putWarehouse } from '../controllers/warehousesControlers.js';
import validateJWT from "../middlewares/validateJWT.js";

const router = express.Router();


router.get('/warehouses',validateJWT, getWarehouses)
router.get('/warehouse/:id',validateJWT, getWarehouse)
router.post('/warehouse',validateJWT, createWarehouse)
router.put('/warehouse/:id',validateJWT, putWarehouse)
router.delete('/warehouse/:id',validateJWT, deleteWarehouse)


export default router