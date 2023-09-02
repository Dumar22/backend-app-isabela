import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import { createExit, deleteExit, getExitById,getExit, getAllExit, putExit } from '../controllers/exitController.js';

const router = express.Router();



router.get('/exit-register', validateJWT, getExit)
router.get('/exit-register-all',  getAllExit)
router.get('/exit-register/:id',validateJWT, getExitById)
router.post('/exit-register', validateJWT, createExit)
router.put('/exit-register/:id', validateJWT, putExit)
router.delete('/exit-register/:id', deleteExit)
router.get('/dowload-exit-register/:id', ) 









export default router