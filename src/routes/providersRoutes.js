import express from "express";
import multer from 'multer';
import { createProvider, deleteProvider, getProviders,getProvider, putProvider, uploadProviders } from '../controllers/providerControllers.js';

import validateJWT from "../middlewares/validateJWT.js";


const router = express.Router();
const upload = multer({ dest: 'uploads/' });


router.get('/providers',validateJWT, getProviders)
router.get('/provider/:id',validateJWT, getProvider)
router.post('/provider', validateJWT, createProvider)
router.post('/providers/upload', validateJWT,upload.single('file'), uploadProviders);
router.put('/provider/:id',validateJWT, putProvider)
router.delete('/provider/:id', validateJWT, deleteProvider)








export default router