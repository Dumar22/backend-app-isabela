import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import { createExit, deleteExit, getExitById,getExit, getAllExit, putExit } from '../controllers/exitController.js';

const router = express.Router();



router.get('/exit', validateJWT, getExit)
router.get('/exit-all',  getAllExit)
router.get('/exit/:id',validateJWT, getExitById)
router.post('/exit', validateJWT, createExit)
router.put('/exit/:id', validateJWT, putExit)
router.delete('/exit/:id', deleteExit)
router.get('/dowload-exit/:id', ) 









export default router