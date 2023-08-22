import express from "express";
import multer from 'multer';
import { createMaterial, deleteMaterial, getMaterials,getMaterial, putMaterial, uploadMaterials } from '../controllers/materialControllers.js';
import validateJWT from "../middlewares/validateJWT.js";

const router = express.Router();
const upload = multer({ dest: 'uploads/' });


router.get('/materials',validateJWT, getMaterials)
router.get('/materials', getMaterials)
router.get('/material/:id', getMaterial)
router.post('/material',validateJWT, createMaterial)
router.put('/material/:id',validateJWT, putMaterial)
router.delete('/material/:id',validateJWT, deleteMaterial)
router.post('/materials/upload',validateJWT, upload.single('file'), uploadMaterials );



export default router