import express from "express";
import multer from 'multer';
import { createMeter, deleteMeter, getMeters, getMeter, putMeter, uploadMeters } from '../controllers/meterController.js';
import validateJWT from "../middlewares/validateJWT.js";
import progressMiddleware from "../middlewares/progressFile.js";


const router = express.Router();
const upload = multer({ dest: 'uploads/' });



router.get('/meters',validateJWT, getMeters)
router.get('/meter/:id', getMeter)
router.post('/meter',validateJWT, createMeter)
router.put('/meter/:id',validateJWT, putMeter)
router.delete('/meter/:id',validateJWT, deleteMeter)
router.post('/meters/upload', upload.single('file'),progressMiddleware,validateJWT, uploadMeters );







export default router