import express from "express";
import validateJWT from "../middlewares/validateJWT.js";
import { createTransfer, deleteTransfer, dowloadPdf, getAllTransfer, getTransfer,getTransferById, putTransfer, } from '../controllers/transferController.js';

const router = express.Router();



router.get('/transfer', validateJWT, getTransfer)
router.get('/transfers',  getAllTransfer)
router.get('/transfer/:id', getTransferById)
router.post('/transfer', validateJWT, createTransfer)
router.put('/transfer/:id', validateJWT, putTransfer)
router.delete('/transfer/:id', deleteTransfer)
router.get('/dowload-transfer/:id', dowloadPdf ) 








export default router